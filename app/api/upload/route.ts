import { NextRequest, NextResponse } from "next/server";
import { encryptDataUrl, hashData } from "@/lib/encryption";
import { validateFileType, rateLimit, getClientIP, logSecurityEvent } from "@/lib/security";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * SECURE FILE UPLOAD ENDPOINT
 * - Requires authentication
 * - Encrypts files before storage
 * - Rate limiting
 * - File type validation (magic bytes)
 * - Audit logging
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await getAdminSession();
    if (!session) {
      await logSecurityEvent({
        action: 'UNAUTHORIZED_UPLOAD_ATTEMPT',
        userType: 'anonymous',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Rate Limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = `upload:${session.id}:${clientIP}`;
    if (!rateLimit(rateLimitKey, 20, 60000)) { // 20 uploads per minute
      await logSecurityEvent({
        action: 'RATE_LIMIT_EXCEEDED',
        userId: session.id,
        userType: 'admin',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        { status: 429 }
      );
    }

    // 4. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // 5. Validate file type by MIME
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.type)) {
      await logSecurityEvent({
        action: 'INVALID_FILE_TYPE_ATTEMPT',
        userId: session.id,
        userType: 'admin',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { fileType: file.type, fileName: file.name },
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Sadece resim (JPG, PNG) ve PDF dosyaları yüklenebilir" },
        { status: 400 }
      );
    }

    // 6. Validate file size (max 4MB - Vercel limit)
    const maxSize = 4 * 1024 * 1024; // 4MB (Vercel API route limit: 4.5MB)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 4MB'dan küçük olmalıdır" },
        { status: 400 }
      );
    }

    // 7. Read file buffer for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 8. Validate file type by magic bytes (more secure)
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validateFileType(buffer, allowedTypes)) {
      await logSecurityEvent({
        action: 'FILE_TYPE_MISMATCH_DETECTED',
        userId: session.id,
        userType: 'admin',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { 
          declaredType: file.type, 
          fileName: file.name,
          fileSize: file.size 
        },
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Dosya tipi doğrulanamadı. Lütfen geçerli bir dosya yükleyin." },
        { status: 400 }
      );
    }

    // 9. Convert to base64
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // 10. ENCRYPT the file data
    const encryptedDataUrl = encryptDataUrl(dataUrl);
    
    // 11. Generate file hash for integrity verification
    const fileHash = hashData(buffer);

    // 12. Log successful upload
    await logSecurityEvent({
      action: 'FILE_UPLOADED',
      userId: session.id,
      userType: 'admin',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileHash: fileHash,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      url: encryptedDataUrl, // Return encrypted data
      hash: fileHash, // Return hash for verification
      message: "Dosya güvenli şekilde şifrelenerek yüklendi",
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    
    await logSecurityEvent({
      action: 'FILE_UPLOAD_ERROR',
      userType: 'admin',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { error: error?.message },
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
