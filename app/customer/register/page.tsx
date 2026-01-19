"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          restaurantId: restaurantId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
        router.push(`/customer/login?restaurantId=${restaurantId || ""}`);
      } else {
        toast.error(data.error || "Kayıt başarısız!");
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
          <CardTitle className="text-2xl font-bold text-slate-900">Müşteri Kaydı</CardTitle>
          <CardDescription>Hesap oluşturun ve sipariş geçmişinizi görüntüleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">İsim *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Adınız Soyadınız"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@email.com"
                className="h-11"
              />
            </div>

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
                minLength={6}
                placeholder="En az 6 karakter"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                placeholder="Şifrenizi tekrar girin"
                className="h-11"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 h-11">
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-slate-600">Zaten hesabınız var mı? </span>
              <Link href={`/customer/login?restaurantId=${restaurantId || ""}`} className="text-slate-900 font-medium hover:underline">
                Giriş Yap
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
