"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function PlatformAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/platform-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("platform_admin_session", JSON.stringify(data.admin));
        toast.success("Giriş başarılı!");
        router.push("/platform-admin/dashboard");
      } else {
        toast.error(data.error || "Giriş başarısız!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
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
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="premium-heading-2 mb-3">Platform Yönetimi</h1>
            <p className="text-gray-600 font-medium">
              Site yöneticisi girişi
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700">
                E-posta Adresi
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="softwareofuture@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-input premium-input-with-icon"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input premium-input-with-icon"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="premium-btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
