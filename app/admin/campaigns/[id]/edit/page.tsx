"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { checkAuth } from "@/lib/auth-client";

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    value: "",
    minAmount: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  const toLocalInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  };

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      if (params?.id) {
        fetchCampaign();
      }
    });
  }, [params?.id]);

  const fetchCampaign = async () => {
    if (!params?.id) {
      setLoading(false);
      toast.error("Geçersiz kampanya ID'si!");
      router.push("/admin/campaigns");
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/campaigns/${params.id}`);
      if (res.ok) {
        const campaign = await res.json();
        setFormData({
          name: campaign.name,
          code: campaign.code,
          type: campaign.type,
          value: campaign.value.toString(),
          minAmount: campaign.minAmount?.toString() || "",
          maxDiscount: campaign.maxDiscount?.toString() || "",
          startDate: toLocalInput(new Date(campaign.startDate)),
          endDate: toLocalInput(new Date(campaign.endDate)),
          usageLimit: campaign.usageLimit?.toString() || "",
          isActive: campaign.isActive,
        });
      } else {
        const errorData = await res.json().catch(() => ({ error: "Bilinmeyen hata" }));
        toast.error(errorData.error || "Kampanya bulunamadı!");
        router.push("/admin/campaigns");
      }
    } catch (error: any) {
      console.error("Error fetching campaign:", error);
      toast.error("Kampanya yüklenirken bir hata oluştu!");
      router.push("/admin/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.id) return;
    
    setSaving(true);

    try {
      const startIso = formData.startDate ? new Date(formData.startDate).toISOString() : undefined;
      const endIso = formData.endDate ? new Date(formData.endDate).toISOString() : undefined;
      const res = await fetch(`/api/admin/campaigns/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          startDate: startIso,
          endDate: endIso,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Kampanya başarıyla güncellendi!");
        router.push("/admin/campaigns");
      } else {
        toast.error(data.error || "Kampanya güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
            <Link href="/admin/campaigns">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Kampanyayı Düzenle</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Kampanya Bilgileri</CardTitle>
            <CardDescription>Kampanya bilgilerini güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Kampanya Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Örn: Yaz İndirimi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Kupon Kodu *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="Örn: YAZ2024"
                  className="uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">İndirim Tipi *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">İndirim Değeri *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    placeholder={formData.type === "percentage" ? "10" : "50"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Sipariş Tutarı (₺)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    placeholder="Opsiyonel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">Maksimum İndirim (₺)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Bitiş Tarihi *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Kullanım Limiti</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Boş = Sınırsız"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <Label htmlFor="isActive" className="cursor-pointer text-sm font-medium text-slate-700">
                  Aktif (müşteriler görebilir)
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1 bg-slate-900 hover:bg-slate-800">
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
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
