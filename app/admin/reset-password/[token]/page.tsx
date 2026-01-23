"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Geçersiz token!");
      router.push("/admin/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor!");
      return;
    }

    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Şifre başarıyla sıfırlandı!");
        setTimeout(() => {
          router.push("/admin/login");
        }, 1500);
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
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="premium-heading-2 mb-3">Yeni Şifre Belirle</h1>
            <p className="text-gray-600 font-medium">
              Yeni şifrenizi girin
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700">Yeni Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="premium-input"
              />
              <p className="text-xs text-gray-500 font-medium">En az 6 karakter</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="premium-input"
              />
            </div>
            <Button 
              type="submit" 
              className="premium-btn-primary w-full" 
              disabled={loading}
            >
              {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
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
        </div>
      </div>
    </div>
  );
}
