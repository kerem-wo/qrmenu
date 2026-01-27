"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        toast.success(data.message || "Şifre sıfırlama linki e-posta adresinize gönderildi!");

        // Development modunda token gösteriliyor
        if (data.resetToken && data.resetUrl && process.env.NODE_ENV === "development") {
          setResetToken(data.resetToken);
          setResetUrl(data.resetUrl);
        } else {
          // Production'da email gönderilir, kullanıcıya bilgi ver
          setTimeout(() => {
            router.push("/admin/login");
          }, 3000);
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
    <div className="min-h-screen flex items-center justify-center premium-bg-gradient p-4">
      <div className="w-full max-w-md animate-premium-scale-in">
        <div className="premium-card p-10">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <h1 className="premium-heading-2 mb-3">Şifremi Unuttum</h1>
            <p className="text-gray-600 font-medium">
              E-posta adresinizi girin, size şifre sıfırlama linki gönderelim
            </p>
          </div>
          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-gray-700">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restoran.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="premium-input"
                />
              </div>
              <Button
                type="submit"
                className="premium-btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
              </Button>
              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-sm text-gray-600 hover:text-gray-900 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-sm text-blue-800 font-bold mb-2">
                  Şifre sıfırlama linki oluşturuldu!
                </p>
                <p className="text-xs text-blue-600 mb-4 font-medium">
                  Development modunda link aşağıda gösteriliyor. Production&apos;da bu link e-posta ile gönderilir.
                </p>
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-gray-600 mb-2 font-bold">Şifre Sıfırlama Linki:</p>
                  <a
                    href={resetUrl || `/admin/reset-password/${resetToken}`}
                    className="text-xs text-blue-600 hover:text-blue-800 break-all underline font-medium"
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
                  className="premium-btn-primary w-full mt-4"
                >
                  Şifre Sıfırlama Sayfasına Git
                </Button>
              </div>
              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-sm text-gray-600 hover:text-gray-900 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
