"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  admin?: {
    email: string;
  };
}

export default function PlatformAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const session = localStorage.getItem("platform_admin_session");
    if (!session) {
      router.push("/platform-admin/login");
    } else {
      fetchRestaurants();
    }
  }, [filter, router]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/platform-admin/restaurants");
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      } else {
        if (res.status === 401) {
          router.push("/platform-admin/login");
        } else {
          toast.error("Restoranlar yüklenirken bir hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> Beklemede</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Onaylandı</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" /> Reddedildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredRestaurants = filter === 'all' 
    ? restaurants 
    : restaurants.filter(r => r.status === filter);

  const stats = {
    total: restaurants.length,
    pending: restaurants.filter(r => r.status === 'pending').length,
    approved: restaurants.filter(r => r.status === 'approved').length,
    rejected: restaurants.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <h1 className="premium-heading-3">Platform Yönetimi</h1>
            </div>
            <Button
              variant="ghost"
            onClick={() => {
              localStorage.removeItem("platform_admin_session");
              router.push("/platform-admin/login");
            }}
            className="text-slate-600 hover:text-slate-900"
          >
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="premium-container py-10">
        {/* Premium İstatistikler */}
        <div className="premium-grid premium-grid-4 mb-10">
          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in">
            <div className="text-4xl font-black text-gray-900 mb-2">{stats.total}</div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Toplam Restoran</p>
          </div>
          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl font-black text-yellow-600 mb-2">{stats.pending}</div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Bekleyen</p>
          </div>
          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl font-black text-green-600 mb-2">{stats.approved}</div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Onaylanan</p>
          </div>
          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl font-black text-red-600 mb-2">{stats.rejected}</div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Reddedilen</p>
          </div>
        </div>

        {/* Premium Filtreler */}
        <div className="premium-card p-6 mb-10 animate-premium-fade-in">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
              className={filter === 'all' ? 'premium-btn-primary px-4 py-2' : 'premium-btn-secondary px-4 py-2'}
            >
              Tümü ({stats.total})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
              className={filter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 px-4 py-2' : 'premium-btn-secondary px-4 py-2'}
            >
              Bekleyen ({stats.pending})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              size="sm"
              className={filter === 'approved' ? 'bg-green-500 hover:bg-green-600 px-4 py-2' : 'premium-btn-secondary px-4 py-2'}
            >
              Onaylanan ({stats.approved})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
              size="sm"
              className={filter === 'rejected' ? 'bg-red-500 hover:bg-red-600 px-4 py-2' : 'premium-btn-secondary px-4 py-2'}
            >
              Reddedilen ({stats.rejected})
            </Button>
          </div>
        </div>

        {/* Premium Restoran Listesi */}
        <div className="premium-card p-8 animate-premium-fade-in">
          <div className="mb-6">
            <h2 className="premium-heading-3 mb-2">Restoran Kayıtları</h2>
            <p className="text-gray-600 font-medium">Tüm restoran kayıtlarını görüntüleyin ve yönetin</p>
          </div>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <h3 className="premium-heading-3 mb-4">Henüz restoran kaydı bulunmuyor</h3>
              <p className="text-gray-600 font-medium">Restoranlar kayıt olduğunda burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="premium-card p-6 premium-hover-lift animate-premium-fade-in flex items-center justify-between"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gray-200 rounded-xl blur-lg opacity-30"></div>
                        <div className="relative w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">{restaurant.name}</h3>
                      {getStatusBadge(restaurant.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 font-medium">
                      <p>E-posta: <span className="text-gray-900 font-semibold">{restaurant.admin?.email || 'N/A'}</span></p>
                      <p>Slug: <span className="text-gray-900 font-semibold">/menu/{restaurant.slug}</span></p>
                      <p>Kayıt Tarihi: <span className="text-gray-900 font-semibold">{new Date(restaurant.createdAt).toLocaleDateString('tr-TR')}</span></p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="premium-btn-secondary ml-4"
                  >
                    <Link href={`/platform-admin/restaurants/${restaurant.id}`}>
                      <Eye className="w-5 h-5 mr-2" />
                      Detayları Gör
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
