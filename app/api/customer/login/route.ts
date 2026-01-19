import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefon ve şifre gereklidir" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: "Geçersiz telefon veya şifre" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, customer.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Geçersiz telefon veya şifre" },
        { status: 401 }
      );
    }

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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Giriş başarısız" },
      { status: 500 }
    );
  }
}
