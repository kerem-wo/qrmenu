"use client";

"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeCheckoutProps {
  amount: number;
  orderId: string;
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, orderId, orderNumber, onSuccess, onCancel }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const res = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderId, orderNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ödeme oluşturulamadı");
      }

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderNumber}?payment=success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Ödeme başarısız");
      } else {
        toast.success("Ödeme başarılı!");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Ödeme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-slate-900 hover:bg-slate-800"
        >
          {loading ? "İşleniyor..." : `Ödeme Yap (${amount.toFixed(2)} ₺)`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          İptal
        </Button>
      </div>
    </form>
  );
}

export function StripeCheckout({ amount, orderId, orderNumber, onSuccess, onCancel }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, orderId, orderNumber }),
        });

        const data = await res.json();
        if (res.ok) {
          setClientSecret(data.clientSecret);
        } else {
          toast.error(data.error || "Ödeme başlatılamadı");
          onCancel();
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast.error("Ödeme başlatılamadı");
        onCancel();
      }
    };

    createIntent();
  }, [amount, orderId, orderNumber, onCancel]);

  if (!clientSecret || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-slate-600">Ödeme yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ödeme</CardTitle>
        <CardDescription>Güvenli ödeme için Stripe kullanıyoruz</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <CheckoutForm
            amount={amount}
            orderId={orderId}
            orderNumber={orderNumber}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
