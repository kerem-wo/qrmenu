"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setValidating(false);
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/admin/reset-password?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          toast.error(data.error || "Geçersiz veya süresi dolmuş bağlantı");
        }
      } catch (error) {
        setIsValidToken(false);
        toast.error("Token doğrulanırken bir hata oluştu");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

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

    if (!token) {
      toast.error("Geçersiz bağlantı!");
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
        toast.success("Şifreniz başarıyla sıfırlandı!");
        setTimeout(() => {
          router.push("/admin/login");
        }, 1500);
      } else {
        toast.error(data.error || "Şifre sıfırlanırken bir hata oluştu!");
      }
    } catch (error) {
      toast.error("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md card-modern">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-300 border-t-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Bağlantı doğrulanıyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md card-modern">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Geçersiz Bağlantı</CardTitle>
            <CardDescription className="text-slate-600">
              Bu bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama bağlantısı oluşturun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              type="button"
              className="w-full bg-slate-900 hover:bg-slate-800 h-11 font-medium" 
              onClick={() => router.push("/admin/forgot-password")}
            >
              Yeni Bağlantı Oluştur
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="w-full mt-3 h-11" 
              onClick={() => router.push("/admin/login")}
            >
              Giriş Sayfasına Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md card-modern">
        <CardHeader className="space-y-1 pb-6">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link href="/admin/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Yeni Şifre Belirle</CardTitle>
          <CardDescription className="text-slate-600">
            Yeni şifrenizi girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Yeni Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
              />
              <p className="text-xs text-slate-500">En az 6 karakter</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 h-11 font-medium" 
              disabled={loading}
            >
              {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-300 border-t-slate-900"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
