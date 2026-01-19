import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { amount, orderId, orderNumber } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Geçersiz tutar" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe yapılandırılmamış" },
        { status: 500 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "try",
      metadata: {
        orderId,
        orderNumber,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
