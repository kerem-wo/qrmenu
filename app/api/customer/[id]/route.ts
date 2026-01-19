import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        favorites: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Müşteri bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        favorites: data.favorites || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        favorites: true,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: error.message || "Müşteri bilgileri güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
