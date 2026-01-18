"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import toast from "react-hot-toast";

interface Campaign {
  id: string;
  name: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usedCount: number;
  usageLimit: number | null;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchCampaigns();
    });
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Kampanya silindi!");
        fetchCampaigns();
      } else {
        toast.error("Kampanya silinirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Bir hata oluştu!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Kampanyalar</h1>
          <Link href="/admin/campaigns/new">
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </Button>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">Henüz kampanya eklenmemiş.</p>
              <Link href="/admin/campaigns/new">
                <Button className="bg-slate-900 hover:bg-slate-800">
                  İlk Kampanyayı Oluştur
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const isExpired = new Date(campaign.endDate) < new Date();
              const isActive = campaign.isActive && !isExpired;

              return (
                <Card key={campaign.id} className="card-modern">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                        <p className="text-sm font-mono text-slate-600 mt-1">{campaign.code}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">İndirim:</span>{" "}
                        {campaign.type === "percentage"
                          ? `%${campaign.value}`
                          : `${campaign.value} ₺`}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Kullanım:</span> {campaign.usedCount}
                        {campaign.usageLimit ? ` / ${campaign.usageLimit}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(campaign.startDate).toLocaleDateString("tr-TR")} -{" "}
                        {new Date(campaign.endDate).toLocaleDateString("tr-TR")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/campaigns/${campaign.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Düzenle
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
