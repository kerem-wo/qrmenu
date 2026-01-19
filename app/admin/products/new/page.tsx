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
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    stock: "",
    isAvailable: true,
    order: "0",
  });

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchCategories();
    });
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Ürün adı gereklidir!");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Geçerli bir fiyat giriniz!");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Kategori seçiniz!");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          categoryId: formData.categoryId,
          image: formData.image.trim() || null,
          stock: formData.stock ? parseInt(formData.stock) : null,
          isAvailable: formData.isAvailable,
          order: parseInt(formData.order) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save variants if any
        if (variants.length > 0) {
          for (const variant of variants) {
            if (variant.name.trim()) {
              await fetch(`/api/admin/products/${data.id}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: variant.name.trim(),
                  price: parseFloat(variant.price) || 0,
                }),
              });
            }
          }
        }
        toast.success("Ürün başarıyla eklendi!");
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Ürün eklenirken bir hata oluştu!");
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Bir hata oluştu! Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "0" }]);
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Ürün Ekle</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Ürün Bilgileri</CardTitle>
            <CardDescription className="text-slate-600">Yeni ürün eklemek için formu doldurun</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Örn: Margherita Pizza"
                  className="h-11 border-slate-300 focus:border-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün hakkında detaylı bilgi..."
                  rows={4}
                  className="border-slate-300 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-slate-700">Fiyat (₺) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                    className="h-11 border-slate-300 focus:border-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium text-slate-700">Stok (Boş = Sınırsız)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Sınırsız"
                    className="h-11 border-slate-300 focus:border-slate-900"
                  />
                </div>
              </div>

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
                <Label htmlFor="categoryId" className="text-sm font-medium text-slate-700">Kategori *</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Ürün Görseli"
              />

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label htmlFor="isAvailable" className="cursor-pointer text-sm font-medium text-slate-700">
                  Ürün aktif (müşteriler görebilir)
                </Label>
              </div>

              {/* Ürün Varyantları */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-slate-700">Ürün Varyantları</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Varyant Ekle
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Örn: Küçük (+0₺), Büyük (+10₺), Ekstra Peynir (+5₺)
                </p>
                {variants.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Henüz varyant eklenmemiş
                  </p>
                ) : (
                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Varyant adı (örn: Büyük)"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                          className="flex-1 h-9"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ek fiyat"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          className="w-32 h-9"
                        />
                        <span className="text-sm text-slate-600">₺</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          className="h-9 w-9 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800 h-11">
                  {loading ? "Ekleniyor..." : "Ürünü Ekle"}
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
