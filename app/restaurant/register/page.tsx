"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.restaurantName.trim()) {
      toast.error("Restoran adı gereklidir");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("E-posta adresi gereklidir");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/restaurant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: formData.restaurantName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Restoran kaydı başarıyla oluşturuldu!");
        
        // Otomatik login
        const loginRes = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          if (loginData.success) {
            // Session'ı localStorage'a kaydet
            localStorage.setItem("admin_session", JSON.stringify(loginData.admin));
            
            // Dashboard'a yönlendir
            setTimeout(() => {
              router.push("/admin/dashboard");
            }, 1000);
          }
        } else {
          // Login başarısız olsa bile kayıt başarılı, login sayfasına yönlendir
          setTimeout(() => {
            router.push("/admin/login");
          }, 2000);
        }
      } else {
        toast.error(data.error || "Kayıt sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="card-modern shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Restoran Kaydı
            </CardTitle>
            <CardDescription className="text-slate-600">
              Restoranınızı kaydedin ve dijital menünüzü oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Restoran Adı */}
              <div className="space-y-2">
                <Label htmlFor="restaurantName" className="text-slate-700 font-medium">
                  Restoran Adı *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Örn: Lezzet Durağı"
                    value={formData.restaurantName}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantName: e.target.value })
                    }
                    className="pl-10 border-slate-300 focus:border-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  E-posta Adresi *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@restoran.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 border-slate-300 focus:border-slate-900"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Bu e-posta admin paneli girişi için kullanılacak
                </p>
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Şifre *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 border-slate-300 focus:border-slate-900"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Şifre Tekrar */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Şifre Tekrar *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="pl-10 border-slate-300 focus:border-slate-900"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 h-11"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Restoran Kaydet"}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/admin/login"
                    className="text-slate-900 font-medium hover:underline"
                  >
                    Giriş Yap
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
