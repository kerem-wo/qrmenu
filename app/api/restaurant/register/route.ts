import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  try {
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

    // Validation
    if (!restaurantName || !restaurantName.trim()) {
      return NextResponse.json(
        { error: "Restoran adı gereklidir" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
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

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 }
      );
    }

    // Email zaten kullanılıyor mu kontrol et
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Slug oluştur ve benzersizliğini kontrol et
    const baseSlug = generateSlug(restaurantName.trim());
    const uniqueSlug = await getUniqueSlug(baseSlug);

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction ile restaurant ve admin oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Theme validation - sadece geçerli temalar kabul edilir
      const validThemes = ["default", "premium", "paper", "paper-image", "swipe", "premium-plus", "pro", "soft-ui", "ultra-plus"];
      const selectedTheme = theme && validThemes.includes(theme) ? theme : "default";

      // Restaurant oluştur (status: pending - platform admin onayı bekliyor)
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName.trim(),
          slug: uniqueSlug,
          description: null,
          logo: null,
          theme: selectedTheme,
          language: "tr",
          kvkkConsent: kvkkConsent === true,
          privacyConsent: privacyConsent === true,
          marketingSmsConsent: marketingSmsConsent === true,
          taxDocument: taxDocument || null,
          businessLicense: businessLicense || null,
          tradeRegistry: tradeRegistry || null,
          identityDocument: identityDocument || null,
          status: 'pending', // Platform admin onayı bekliyor
        },
      });

      // Admin oluştur
      const admin = await tx.admin.create({
        data: {
          email: email.trim().toLowerCase(),
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

    return NextResponse.json({
      success: true,
      message: "Restoran kaydı başarıyla oluşturuldu. Hesabınız platform yöneticileri tarafından incelendikten sonra aktif hale gelecektir.",
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        slug: result.restaurant.slug,
        status: result.restaurant.status,
      },
      admin: result.admin,
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
