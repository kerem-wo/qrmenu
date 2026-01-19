"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { checkAuth } from "@/lib/auth-client";
import { ImageUpload } from "@/components/ui/image-upload";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    theme: "default",
    slug: "",
  });

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchRestaurant();
    });
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/admin/restaurant");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name,
          description: data.description || "",
          logo: data.logo || "",
          theme: data.theme || "default",
          slug: data.slug,
          language: data.language || "tr",
        });
      }
    } catch (error) {
      toast.error("Restoran bilgileri yüklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          logo: formData.logo,
          theme: formData.theme,
        }),
      });

      if (res.ok) {
        toast.success("Ayarlar başarıyla kaydedildi!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Ayarlar kaydedilirken bir hata oluştu!");
      }
    } catch (error) {
      toast.error("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
            <Link href="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Restoran Ayarları</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Genel Bilgiler</CardTitle>
            <CardDescription className="text-slate-600">Restoran bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Restoran Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Restoran Adı"
                  className="h-11 border-slate-300 focus:border-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-slate-700">Menü Linki (Slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  disabled
                  className="bg-slate-50 h-11"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Menü linkiniz: <span className="font-mono text-slate-900">/menu/{formData.slug}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Restoran hakkında bilgi..."
                  rows={4}
                  className="border-slate-300 focus:border-slate-900"
                />
              </div>

              <ImageUpload
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                label="Restoran Logosu"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-sm font-medium text-slate-700">Tema</Label>
                  <select
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm"
                  >
                    <option value="default">Varsayılan</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                    <option value="elegant">Şık</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-slate-700">Dil</Label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1 bg-slate-900 hover:bg-slate-800 h-11">
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-slate-300 h-11"
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
