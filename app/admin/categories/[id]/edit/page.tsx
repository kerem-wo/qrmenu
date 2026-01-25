"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

type CategoryTranslation = {
  language: string;
  name: string;
  description: string | null;
};

const TRANSLATION_LANGS = [
  { id: "en", label: "English" },
  { id: "de", label: "Deutsch" },
  { id: "ru", label: "Русский" },
  { id: "ar", label: "العربية" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
] as const;

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    order: "0",
    translations: {
      en: { name: "", description: "" },
      de: { name: "", description: "" },
      ru: { name: "", description: "" },
      ar: { name: "", description: "" },
      fr: { name: "", description: "" },
      es: { name: "", description: "" },
    } as Record<string, { name: string; description: string }>,
  });

  useEffect(() => {
    if (params?.id) {
      fetchCategory();
    }
  }, [params?.id]);

  const fetchCategory = async () => {
    if (!params?.id) return;
    
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`);
      if (res.ok) {
        const category = (await res.json()) as any;
        const map: Record<string, { name: string; description: string }> = {
          en: { name: "", description: "" },
          de: { name: "", description: "" },
          ru: { name: "", description: "" },
          ar: { name: "", description: "" },
          fr: { name: "", description: "" },
          es: { name: "", description: "" },
        };
        const ts: CategoryTranslation[] = Array.isArray(category.translations) ? category.translations : [];
        for (const t of ts) {
          const lang = String(t.language || "").toLowerCase();
          if (!map[lang]) continue;
          map[lang] = { name: t.name || "", description: t.description || "" };
        }
        setFormData({
          name: category.name,
          description: category.description || "",
          image: category.image || "",
          order: category.order.toString(),
          translations: map,
        });
      } else {
        toast.error("Kategori yüklenirken bir hata oluştu!");
      }
    } catch (error) {
      toast.error("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.id) return;
    
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order) || 0,
          translations: Object.entries(formData.translations).map(([language, t]) => ({
            language,
            name: (t?.name || "").trim(),
            description: (t?.description || "").trim() || null,
          })),
        }),
      });

      if (res.ok) {
        toast.success("Kategori başarıyla güncellendi!");
        router.push("/admin/categories");
      } else {
        const data = await res.json();
        toast.error(data.error || "Kategori güncellenirken bir hata oluştu!");
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
            <Link href="/admin/categories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Kategoriyi Düzenle</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Kategori Bilgileri</CardTitle>
            <CardDescription className="text-slate-600">Kategori bilgilerini güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Kategori Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Örn: Pizzalar"
                  className="h-11 border-slate-300 focus:border-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori hakkında bilgi..."
                  rows={4}
                  className="border-slate-300 focus:border-slate-900"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <div className="text-sm font-bold text-slate-900">Çeviriler</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Türkçe alanlar ana alanlardan gelir. Diğer diller için isim/açıklama girebilirsiniz.
                  </div>
                </div>
                <div className="space-y-5">
                  {TRANSLATION_LANGS.map((l) => (
                    <div key={l.id} className="grid gap-3">
                      <div className="text-xs font-bold text-slate-700">{l.label}</div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-slate-600">İsim</Label>
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
                          placeholder={`${formData.name || "Kategori adı"} (${l.label})`}
                          className="h-11 border-slate-300 focus:border-slate-900"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-slate-600">Açıklama</Label>
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
                          className="border-slate-300 focus:border-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order" className="text-sm font-medium text-slate-700">Sıra</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="0"
                    className="h-11 border-slate-300 focus:border-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium text-slate-700">Görsel URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="h-11 border-slate-300 focus:border-slate-900"
                  />
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
