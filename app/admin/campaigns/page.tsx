"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  const fetchCampaigns = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        fetchCampaigns();
      }
    });
  }, [fetchCampaigns, router]);

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
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex justify-between items-center py-5">
            <h1 className="premium-heading-3">Kampanyalar</h1>
            <Link href="/admin/campaigns/new">
              <Button className="premium-btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Yeni Kampanya
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="premium-container py-10">
        {campaigns.length === 0 ? (
          <div className="premium-card p-16 text-center animate-premium-fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                <Plus className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="premium-heading-3 mb-4">Henüz kampanya eklenmemiş</h3>
            <p className="text-gray-600 mb-8 font-medium">İlk kampanyanızı ekleyerek başlayın</p>
            <Link href="/admin/campaigns/new">
              <Button className="premium-btn-primary">
                  İlk Kampanyayı Oluştur
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="premium-grid premium-grid-3">
            {campaigns.map((campaign, index) => {
              const isExpired = new Date(campaign.endDate) < new Date();
              const isActive = campaign.isActive && !isExpired;

              return (
                <div key={campaign.id} className="premium-card p-6 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{campaign.name}</h3>
                      <p className="text-sm font-mono text-gray-600 font-medium">{campaign.code}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-sm text-gray-600 font-medium">
                      <span className="font-bold text-gray-900">İndirim:</span>{" "}
                      {campaign.type === "percentage"
                        ? `%${campaign.value}`
                        : `${campaign.value} ₺`}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      <span className="font-bold text-gray-900">Kullanım:</span> {campaign.usedCount}
                      {campaign.usageLimit ? ` / ${campaign.usageLimit}` : ""}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(campaign.startDate).toLocaleDateString("tr-TR")} -{" "}
                      {new Date(campaign.endDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link href={`/admin/campaigns/${campaign.id}/edit`} prefetch={false} className="flex-1">
                      <Button variant="outline" className="premium-btn-secondary w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="premium-btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 px-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
