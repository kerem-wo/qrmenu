import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Sadece resim dosyaları yüklenebilir" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB'dan küçük olmalıdır" },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // Fallback to base64 if Cloudinary is not configured
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        message: "Dosya yüklendi (base64 formatında - Cloudinary yapılandırılmamış)",
      });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: "qr-menu",
          resource_type: "auto",
          transformation: [
            { width: 800, height: 800, crop: "limit", quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    }) as any;

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      message: "Dosya Cloudinary'ye yüklendi",
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    
    // Fallback to base64 on error
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        return NextResponse.json({
          url: dataUrl,
          message: "Dosya yüklendi (base64 formatında - Cloudinary hatası)",
        });
      }
    } catch (fallbackError) {
      console.error("Fallback upload error:", fallbackError);
    }

    return NextResponse.json(
      { error: error?.message || "Dosya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
