"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Şifre sıfırlama linki gönderildi!");
        
        // Development modunda token gösteriliyor
        if (data.resetToken && data.resetUrl) {
          setResetToken(data.resetToken);
          setResetUrl(data.resetUrl);
        } else {
          // Production'da email gönderilir, kullanıcıya bilgi ver
          setTimeout(() => {
            router.push("/admin/login");
          }, 2000);
        }
      } else {
        toast.error(data.error || "Bir hata oluştu!");
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
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-slate-600">
            E-posta adresinizi girin, size şifre sıfırlama linki gönderelim
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restoran.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 h-11 font-medium" 
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
              </Button>
              <div className="text-center">
                <Link 
                  href="/admin/login" 
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Şifre sıfırlama linki oluşturuldu!
                </p>
                <p className="text-xs text-blue-600 mb-3">
                  Development modunda link aşağıda gösteriliyor. Production'da bu link e-posta ile gönderilir.
                </p>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Şifre Sıfırlama Linki:</p>
                  <a 
                    href={resetUrl || `/admin/reset-password/${resetToken}`}
                    className="text-xs text-blue-600 hover:text-blue-800 break-all underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetUrl || `${window.location.origin}/admin/reset-password/${resetToken}`}
                  </a>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = resetUrl || `/admin/reset-password/${resetToken}`;
                  }}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 h-10 text-sm"
                >
                  Şifre Sıfırlama Sayfasına Git
                </Button>
              </div>
              <div className="text-center">
                <Link 
                  href="/admin/login" 
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
