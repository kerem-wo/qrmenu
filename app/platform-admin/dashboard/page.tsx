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
      return;
    }
    fetchRestaurants();
  }, [filter]);

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Platform Yönetimi</h1>
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

      <main className="container mx-auto px-6 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-sm text-slate-600">Toplam Restoran</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-slate-600">Bekleyen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-sm text-slate-600">Onaylanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-sm text-slate-600">Reddedilen</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Tümü ({stats.total})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Bekleyen ({stats.pending})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                Onaylanan ({stats.approved})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                size="sm"
                className="bg-red-500 hover:bg-red-600"
              >
                Reddedilen ({stats.rejected})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restoran Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Restoran Kayıtları</CardTitle>
            <CardDescription>Tüm restoran kayıtlarını görüntüleyin ve yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Henüz restoran kaydı bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        <h3 className="font-semibold text-slate-900">{restaurant.name}</h3>
                        {getStatusBadge(restaurant.status)}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>E-posta: {restaurant.admin?.email || 'N/A'}</p>
                        <p>Slug: /menu/{restaurant.slug}</p>
                        <p>Kayıt Tarihi: {new Date(restaurant.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="ml-4"
                    >
                      <Link href={`/platform-admin/restaurants/${restaurant.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Detayları Gör
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
