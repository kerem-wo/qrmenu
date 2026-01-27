import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: "İsim ve telefon gereklidir" },
        { status: 400 }
      );
    }

    // Check if phone or email already exists
    if (data.phone) {
      const existingByPhone = await prisma.customer.findUnique({
        where: { phone: data.phone },
      });
      if (existingByPhone) {
        return NextResponse.json(
          { error: "Bu telefon numarası zaten kayıtlı" },
          { status: 400 }
        );
      }
    }

    if (data.email) {
      const existingByEmail = await prisma.customer.findUnique({
        where: { email: data.email },
      });
      if (existingByEmail) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten kayıtlı" },
          { status: 400 }
        );
      }
    }

    // Hash password if provided
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        password: hashedPassword,
        restaurantId: data.restaurantId || null,
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu telefon veya e-posta zaten kayıtlı" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Kayıt başarısız" },
      { status: 500 }
    );
  }
}
