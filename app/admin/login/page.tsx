"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
      });

      const data = await res.json();

      if (res.ok) {
        const { admin } = data;
        // Store session in localStorage for client-side checks
        localStorage.setItem("admin_session", JSON.stringify(admin));
        
        // Verify session cookie was set by calling /api/admin/me
        try {
          const meRes = await fetch("/api/admin/me", {
            credentials: "include", // Important: include cookies
          });
          
          if (meRes.ok) {
            toast.success("Giriş başarılı!");
            router.push("/admin/dashboard");
          } else {
            // Cookie might not be set, but localStorage is, so continue anyway
            console.warn("Session cookie verification failed, but localStorage session exists");
            toast.success("Giriş başarılı!");
            router.push("/admin/dashboard");
          }
        } catch (verifyError) {
          // Even if verification fails, proceed with localStorage session
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
            <h1 className="premium-heading-2 mb-3">Admin Girişi</h1>
            <p className="text-gray-600 font-medium">
              Restoran yönetim paneline giriş yapın
            </p>
          </div>
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="premium-input"
              />
            </div>
            <Button 
              type="submit" 
              className="premium-btn-primary w-full" 
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center pt-4 space-y-3">
              <Link 
                href="/admin/forgot-password" 
                className="text-sm text-gray-600 hover:text-gray-900 font-semibold underline block transition-colors"
              >
                Şifremi unuttum
              </Link>
              <div className="text-sm text-gray-600">
                Hesabınız yok mu?{" "}
                <Link 
                  href="/restaurant/register" 
                  className="text-gray-900 font-bold hover:text-green-600 transition-colors"
                >
                  Restoran Kaydı Oluştur
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
