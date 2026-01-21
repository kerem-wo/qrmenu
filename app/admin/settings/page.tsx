"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-sm font-medium text-slate-700">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="h-11 border-slate-300 focus:border-slate-900"
                />
                {formData.logo && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg inline-block">
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

        {/* Hesap Durumu */}
        <Card className="card-modern mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Hesap Durumu</CardTitle>
            <CardDescription className="text-slate-600">
              Hesabınızın onay durumu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">
                Hesabınız platform yöneticileri tarafından incelenmektedir. 
                Belgeleriniz ve bilgileriniz kontrol edildikten sonra hesabınız aktif hale gelecektir.
              </p>
              <p className="text-xs text-slate-500">
                Belgelerinizi görmek için platform yöneticileri ile iletişime geçiniz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Account Deletion */}
        <Card className="card-modern mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600">Tehlikeli Bölge</CardTitle>
            <CardDescription className="text-slate-600">
              Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Hesabı Sil</p>
                  <p className="text-sm text-red-700">
                    Tüm restoran bilgileri, ürünler, kategoriler ve siparişler kalıcı olarak silinecektir.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hesabı Sil
              </Button>
            </div>
          </CardContent>
        </Card>
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
