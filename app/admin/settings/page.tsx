"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { checkAuth, clearSessionFromStorage } from "@/lib/auth-client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    theme: "default",
    slug: "",
    language: "tr",
    enableTakeaway: true,
    translations: {
      en: { name: "", description: "" },
      de: { name: "", description: "" },
      ru: { name: "", description: "" },
      ar: { name: "", description: "" },
      fr: { name: "", description: "" },
      es: { name: "", description: "" },
    } as Record<string, { name: string; description: string }>,
  });

  const TRANSLATION_LANGS = [
    { id: "en", label: "English" },
    { id: "de", label: "Deutsch" },
    { id: "ru", label: "Русский" },
    { id: "ar", label: "العربية" },
    { id: "fr", label: "Français" },
    { id: "es", label: "Español" },
  ] as const;

  const fetchRestaurant = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/restaurant");
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, { name: string; description: string }> = {
          en: { name: "", description: "" },
          de: { name: "", description: "" },
          ru: { name: "", description: "" },
          ar: { name: "", description: "" },
          fr: { name: "", description: "" },
          es: { name: "", description: "" },
        };
        const ts = Array.isArray(data.translations) ? data.translations : [];
        for (const t of ts) {
          const lang = String(t.language || "").toLowerCase();
          if (!map[lang]) continue;
          map[lang] = { name: t.name || "", description: t.description || "" };
        }
        setFormData({
          name: data.name,
          description: data.description || "",
          logo: data.logo || "",
          theme: data.theme || "default",
          slug: data.slug,
          language: data.language || "tr",
          enableTakeaway: data.enableTakeaway ?? true,
          translations: map,
        });
      }
    } catch (error) {
      toast.error("Restoran bilgileri yüklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        fetchRestaurant();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRestaurant]);

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
          language: formData.language,
          enableTakeaway: formData.enableTakeaway,
          translations: Object.entries(formData.translations).map(([language, t]) => ({
            language,
            name: (t?.name || "").trim(),
            description: (t?.description || "").trim() || null,
          })),
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

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const res = await fetch("/api/admin/restaurant", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Hesabınız başarıyla silindi");
        clearSessionFromStorage();

        // Logout API'sini de çağır
        try {
          await fetch("/api/admin/logout", { method: "POST" });
        } catch (error) {
          // Logout hatası önemli değil, session zaten temizlendi
        }

        // Ana sayfaya yönlendir
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        const data = await res.json();
        toast.error(data.error || "Hesap silinirken bir hata oluştu!");
        setDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Bir hata oluştu! Lütfen tekrar deneyin.");
      setDeleting(false);
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
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center gap-4 py-5">
            <Button variant="ghost" asChild className="premium-btn-secondary px-4 py-2">
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Link>
            </Button>
            <h1 className="premium-heading-3">Restoran Ayarları</h1>
          </div>
        </div>
      </header>

      <main className="premium-container py-10 max-w-2xl mx-auto">
        <div className="premium-card p-10 animate-premium-fade-in">
          <div className="mb-8">
            <h2 className="premium-heading-3 mb-2">Genel Bilgiler</h2>
            <p className="text-gray-600 font-medium">Restoran bilgilerinizi güncelleyin</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-gray-700">Restoran Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Restoran Adı"
                className="premium-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-bold text-gray-700">Menü Linki (Slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                disabled
                className="premium-input bg-gray-50"
              />
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Menü linkiniz: <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">/menu/{formData.slug}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-gray-700">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Restoran hakkında bilgi..."
                rows={4}
                className="premium-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-bold text-gray-700">Varsayılan Menü Dili</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="premium-input h-11 flex items-center py-0"
                style={{ lineHeight: '2.75rem' }}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Müşteri menüsü dil seçimi yoksa bu dil kullanılır.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme" className="text-sm font-bold text-gray-700">Menü Tasarım Teması</Label>
              <select
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="premium-input h-11 flex items-center py-0"
                style={{ lineHeight: '2.75rem' }}
              >
                <option value="premium">Premium Menü</option>
                <option value="paper">Kağıt Menü</option>
                <option value="paper-image">Resimli Kağıt Menü</option>
                <option value="swipe">Modern Swipe Menu</option>
                <option value="premium-plus">Premium+ QR Menu</option>
                <option value="pro">Pro QR Menu</option>
                <option value="soft-ui">Soft UI Menü</option>
                <option value="ultra-plus">Ultra+ Menü</option>
              </select>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Menünüzün görsel tasarımını seçin. Değişiklikler kaydedildikten sonra menü sayfanızda görünecektir.
              </p>
              <div className="mt-3">
                <Link
                  href={`/menu/${formData.slug}?theme=${formData.theme}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Tema Önizlemesi
                </Link>
              </div>
            </div>

            <div className="premium-card p-6 border border-gray-200/70">
              <div className="mb-2">
                <h3 className="font-bold text-gray-900">Sipariş Ayarları</h3>
                <p className="text-sm text-gray-600 font-medium">
                  Müşterinin QR menüden hangi sipariş türlerini seçebileceğini belirleyin.
                </p>
              </div>

              <label className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">Gel Al</div>
                  <div className="text-xs text-gray-600 font-medium">
                    Açık olursa müşteri “Gel Al” seçebilir. Kapalı olursa bu seçenek gösterilmez.
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-300 shadow-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.enableTakeaway)}
                    onChange={(e) => setFormData((s) => ({ ...s, enableTakeaway: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {formData.enableTakeaway ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </label>
            </div>

            <div className="premium-card p-6 border border-gray-200/70">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900">Çeviriler</h3>
                <p className="text-sm text-gray-600 font-medium">
                  Türkçe alanlar ana alanlardan gelir. Diğer diller için isim/açıklama girebilirsiniz.
                </p>
              </div>
              <div className="space-y-6">
                {TRANSLATION_LANGS.map((l) => (
                  <div key={l.id} className="space-y-3">
                    <div className="text-sm font-bold text-gray-800">{l.label}</div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700">İsim</Label>
                      <Input
                        value={formData.translations[l.id]?.name || ""}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            translations: {
                              ...s.translations,
                              [l.id]: { ...(s.translations[l.id] || { name: "", description: "" }), name: e.target.value },
                            },
                          }))
                        }
                        placeholder={`${formData.name || "Restoran adı"} (${l.label})`}
                        className="premium-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700">Açıklama</Label>
                      <Textarea
                        value={formData.translations[l.id]?.description || ""}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            translations: {
                              ...s.translations,
                              [l.id]: { ...(s.translations[l.id] || { name: "", description: "" }), description: e.target.value },
                            },
                          }))
                        }
                        placeholder="Opsiyonel"
                        rows={3}
                        className="premium-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-bold text-gray-700">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="premium-input"
              />
              {formData.logo && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="w-24 h-24 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button type="submit" disabled={saving} className="premium-btn-primary flex-1">
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="premium-btn-secondary flex-1"
              >
                İptal
              </Button>
            </div>
          </form>
        </div>

        {/* Premium Hesap Durumu */}
        <div className="premium-card p-8 mt-8 animate-premium-fade-in">
          <div className="mb-6">
            <h2 className="premium-heading-3 mb-2">Hesap Durumu</h2>
            <p className="text-gray-600 font-medium">
              Hesabınızın onay durumu
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Hesabınız platform yöneticileri tarafından incelenmektedir.
              Belgeleriniz ve bilgileriniz kontrol edildikten sonra hesabınız aktif hale gelecektir.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Belgelerinizi görmek için platform yöneticileri ile iletişime geçiniz.
            </p>
          </div>
        </div>

        {/* Premium Danger Zone - Account Deletion */}
        <div className="premium-card p-8 mt-8 border-2 border-red-200 animate-premium-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Tehlikeli Bölge</h2>
            <p className="text-gray-600 font-medium">
              Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.
            </p>
          </div>
          <div className="flex items-center justify-between p-6 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-200 rounded-xl blur-lg opacity-30"></div>
                <div className="relative w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div>
                <p className="font-bold text-red-900 mb-1">Hesabı Sil</p>
                <p className="text-sm text-red-700 font-medium">
                  Tüm restoran bilgileri, ürünler, kategoriler ve siparişler kalıcı olarak silinecektir.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="premium-btn-secondary bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Hesabı Sil
            </Button>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Hesabı Silmek İstediğinize Emin misiniz?
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir:
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Restoran bilgileri</li>
              <li>Tüm ürünler ve kategoriler</li>
              <li>Tüm siparişler</li>
              <li>Kampanyalar ve kuponlar</li>
              <li>Admin hesabı</li>
            </ul>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900">
                Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
              className="border-slate-300"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Siliniyor..." : "Evet, Hesabı Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
