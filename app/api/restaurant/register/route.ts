import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIP, logSecurityEvent, sanitizeInput } from "@/lib/security";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Slug oluşturma fonksiyonu (Türkçe karakterleri düzeltir)
function generateSlug(name: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  let slug = name
    .toLowerCase()
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-|-$/g, ''); // Başta ve sonda tire varsa kaldır

  // Eğer slug boşsa, rastgele bir slug oluştur
  if (!slug) {
    slug = `restoran-${Date.now()}`;
  }

  return slug;
}

// Benzersiz slug oluşturma (eğer slug zaten varsa numara ekle)
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = `register:${clientIP}`;
    if (!rateLimit(rateLimitKey, 3, 3600000)) { // 3 registrations per hour
      await logSecurityEvent({
        action: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
        userType: 'anonymous',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { 
      restaurantName, 
      email, 
      password,
      theme,
      kvkkConsent,
      privacyConsent,
      marketingSmsConsent,
      taxDocument,
      businessLicense,
      tradeRegistry,
      identityDocument,
    } = await request.json();

    // Sanitize and validate inputs
    const sanitizedRestaurantName = sanitizeInput(restaurantName?.trim() || '');
    const sanitizedEmail = sanitizeInput(email?.trim().toLowerCase() || '');

    // Validation
    if (!sanitizedRestaurantName || sanitizedRestaurantName.length < 2) {
      return NextResponse.json(
        { error: "Restoran adı en az 2 karakter olmalıdır" },
        { status: 400 }
      );
    }

    if (sanitizedRestaurantName.length > 100) {
      return NextResponse.json(
        { error: "Restoran adı 100 karakterden uzun olamaz" },
        { status: 400 }
      );
    }

    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Şifre çok uzun" },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 }
      );
    }

    // Email zaten kullanılıyor mu kontrol et
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: sanitizedEmail },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Slug oluştur ve benzersizliğini kontrol et
    const baseSlug = generateSlug(sanitizedRestaurantName);
    const uniqueSlug = await getUniqueSlug(baseSlug);

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for better security

    // Import encryption for document storage
    const { encryptDataUrl } = await import("@/lib/encryption");

    // Transaction ile restaurant ve admin oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Theme validation - sadece geçerli temalar kabul edilir
      const validThemes = ["default", "premium", "paper", "paper-image", "swipe", "premium-plus", "pro", "soft-ui", "ultra-plus"];
      const selectedTheme = theme && validThemes.includes(theme) ? theme : "default";

      // Encrypt documents before storage (only if not already encrypted)
      // Helper function to safely encrypt documents
      const safeEncryptDocument = (doc: string | null | undefined): string | null => {
        if (!doc || typeof doc !== 'string' || !doc.trim() || doc === 'null') {
          return null;
        }
        if (doc.startsWith('encrypted:')) {
          return doc;
        }
        try {
          return encryptDataUrl(doc);
        } catch (error) {
          console.error('Error encrypting document:', error);
          // Return null if encryption fails (invalid format)
          return null;
        }
      };

      const encryptedTaxDocument = safeEncryptDocument(taxDocument);
      const encryptedBusinessLicense = safeEncryptDocument(businessLicense);
      const encryptedTradeRegistry = safeEncryptDocument(tradeRegistry);
      const encryptedIdentityDocument = safeEncryptDocument(identityDocument);

      // Restaurant oluştur (status: pending - platform admin onayı bekliyor)
      const restaurant = await tx.restaurant.create({
        data: {
          name: sanitizedRestaurantName,
          slug: uniqueSlug,
          description: null,
          logo: null,
          theme: selectedTheme,
          language: "tr",
          kvkkConsent: kvkkConsent === true,
          privacyConsent: privacyConsent === true,
          marketingSmsConsent: marketingSmsConsent === true,
          taxDocument: encryptedTaxDocument,
          businessLicense: encryptedBusinessLicense,
          tradeRegistry: encryptedTradeRegistry,
          identityDocument: encryptedIdentityDocument,
          status: 'pending', // Platform admin onayı bekliyor
        },
      });

      // Admin oluştur
      const admin = await tx.admin.create({
        data: {
          email: sanitizedEmail,
          password: hashedPassword,
          restaurantId: restaurant.id,
        },
        select: {
          id: true,
          email: true,
          restaurantId: true,
        },
      });

      return { restaurant, admin };
    });

    // Log successful registration
    await logSecurityEvent({
      action: 'RESTAURANT_REGISTERED',
      userType: 'anonymous',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        restaurantId: result.restaurant.id,
        restaurantName: sanitizedRestaurantName,
        email: sanitizedEmail,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Restoran kaydı başarıyla oluşturuldu. Tema ve paket seçimi için yönlendiriliyorsunuz...",
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        slug: result.restaurant.slug,
        status: result.restaurant.status,
      },
      admin: result.admin,
      restaurantId: result.restaurant.id, // Tema/paket seçimi için
    });
  } catch (error: any) {
    console.error("Restaurant registration error:", error);
    
    // Prisma unique constraint hatası
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'email') {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
      if (field === 'slug') {
        return NextResponse.json(
          { error: "Bu restoran adı zaten kullanılıyor. Lütfen farklı bir isim deneyin." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: error?.message || "Kayıt sırasında bir hata oluştu",
        ...(process.env.NODE_ENV === "development" && {
          details: error?.stack,
        }),
      },
      { status: 500 }
    );
  }
}
