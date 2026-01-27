"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        const { admin } = data;
        localStorage.setItem("admin_session", JSON.stringify(admin));
        
        try {
          const meRes = await fetch("/api/admin/me", {
            credentials: "include",
          });
          
          if (meRes.ok) {
            toast.success("Giriş başarılı!");
            router.push("/admin/dashboard");
          } else {
            console.warn("Session cookie verification failed, but localStorage session exists");
            toast.success("Giriş başarılı!");
            router.push("/admin/dashboard");
          }
        } catch (verifyError) {
          console.warn("Session verification error:", verifyError);
          toast.success("Giriş başarılı!");
          router.push("/admin/dashboard");
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
    <div className="min-h-screen flex">
      {/* Sol Bölüm - Giriş Yap */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">Rivo QR</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Giriş Yap
            </h1>
            <p className="text-gray-600 text-lg">
              Restoran yönetim paneline hoş geldiniz
            </p>
          </div>

          {/* Sosyal Giriş Butonları */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all group"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all group"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#000000"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#000000"/>
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all group"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#000000"/>
              </svg>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">veya hesabını kullan</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restoran.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-[#FF6F00] focus:ring-4 focus:ring-[#FF6F00]/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Şifre
                </Label>
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-[#FF6F00] hover:text-[#E55F00] font-medium transition-colors"
                >
                  Şifremi unuttum?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-[#FF6F00] focus:ring-4 focus:ring-[#FF6F00]/10 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF6F00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              href="/restaurant/register"
              className="text-[#FF6F00] hover:text-[#E55F00] font-semibold transition-colors"
            >
              Restoran Kaydı Oluştur
            </Link>
          </div>
        </div>
      </div>

      {/* Sağ Bölüm - Kayıt Daveti */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FF6F00] via-[#FF8F33] to-[#FF6F00] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10 text-center max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Merhaba!
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Kişisel bilgilerinizi girin ve bizimle yolculuğa başlayın.
          </p>
          <Link
            href="/restaurant/register"
            className="inline-flex items-center gap-2 bg-white text-[#FF6F00] px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Kayıt Ol
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
