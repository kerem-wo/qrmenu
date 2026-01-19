"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("customer_session", JSON.stringify(data.customer));
        toast.success("Giriş başarılı!");
        if (restaurantId) {
          router.push(`/menu/${restaurantId}`);
        } else {
          router.push("/customer/dashboard");
        }
      } else {
        toast.error(data.error || "Giriş başarısız!");
      }
    } catch (error) {
      toast.error("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md card-modern">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Müşteri Girişi</CardTitle>
          <CardDescription>Hesabınıza giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="05XX XXX XX XX"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Şifrenizi girin"
                className="h-11"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 h-11">
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-slate-600">Hesabınız yok mu? </span>
              <Link href={`/customer/register?restaurantId=${restaurantId || ""}`} className="text-slate-900 font-medium hover:underline">
                Kayıt Ol
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    }>
      <CustomerLoginContent />
    </Suspense>
  );
}
