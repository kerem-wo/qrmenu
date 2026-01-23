"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Building2, FileText, Download, Eye, CheckCircle, XCircle, Clock, Mail, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  kvkkConsent: boolean;
  privacyConsent: boolean;
  marketingSmsConsent: boolean;
  taxDocument: string | null;
  businessLicense: string | null;
  tradeRegistry: string | null;
  identityDocument: string | null;
  admin?: {
    email: string;
    createdAt: string;
  };
}

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("platform_admin_session");
    if (!session) {
      router.push("/platform-admin/login");
      return;
    }
    if (params.id) {
      fetchRestaurant(params.id as string);
    }
  }, [params.id]);

  const fetchRestaurant = async (id: string) => {
    try {
      const res = await fetch(`/api/platform-admin/restaurants/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
      } else {
        if (res.status === 401) {
          router.push("/platform-admin/login");
        } else {
          toast.error("Restoran bilgileri yüklenirken bir hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!restaurant) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`/api/platform-admin/restaurants/${restaurant.id}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Restoran onaylandı!");
        fetchRestaurant(restaurant.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Onaylama sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Error approving restaurant:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!restaurant || !rejectionReason.trim()) {
      toast.error("Lütfen red nedeni giriniz");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/platform-admin/restaurants/${restaurant.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.ok) {
        toast.success("Restoran reddedildi");
        setShowRejectDialog(false);
        setRejectionReason("");
        fetchRestaurant(restaurant.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Reddetme sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Error rejecting restaurant:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    if (!url) return;
    
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank');
    }
  };

  const handlePreviewDocument = (url: string) => {
    if (!url) return;
    
    if (url.startsWith('data:')) {
      const newWindow = window.open();
      if (newWindow) {
        const isImage = url.startsWith('data:image/');
        const isPdf = url.startsWith('data:application/pdf');
        
        if (isImage) {
          newWindow.document.write(`
            <html>
              <head><title>Belge Önizleme</title></head>
              <body style="margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
                <img src="${url}" style="max-width:100%;max-height:100vh;box-shadow:0 4px 6px rgba(0,0,0,0.1);border-radius:8px;" />
              </body>
            </html>
          `);
        } else if (isPdf) {
          newWindow.document.write(`
            <html>
              <head><title>Belge Önizleme</title></head>
              <body style="margin:0;padding:0;height:100vh;overflow:hidden;">
                <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
              </body>
            </html>
          `);
        }
      }
    } else {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Restoran bulunamadı</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="premium-btn-secondary px-4 py-2">
                <Link href="/platform-admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Link>
              </Button>
              <h1 className="premium-heading-3">Restoran Detayları</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="premium-container py-10 max-w-6xl mx-auto">
        {/* Premium Durum ve Aksiyonlar */}
        <div className="premium-card p-8 mb-10 animate-premium-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-gray-600" />
                </div>
              </div>
              <div>
                <h2 className="premium-heading-3 mb-1">{restaurant.name}</h2>
                <p className="text-sm text-gray-600 font-medium">Slug: /menu/{restaurant.slug}</p>
              </div>
              {getStatusBadge(restaurant.status)}
            </div>
            {restaurant.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="premium-btn-primary bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Onayla
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                  variant="destructive"
                  className="premium-btn-secondary bg-red-600 hover:bg-red-700 border-red-600"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reddet
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="premium-grid premium-grid-2 gap-6 mb-10">
          {/* Premium Genel Bilgiler */}
          <div className="premium-card p-8 animate-premium-fade-in">
            <h2 className="premium-heading-3 mb-6">Genel Bilgiler</h2>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 block">E-posta</Label>
                <p className="font-bold text-gray-900">{restaurant.admin?.email || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 block">Açıklama</Label>
                <p className="font-medium text-gray-900">{restaurant.description || 'Açıklama yok'}</p>
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 block">Kayıt Tarihi</Label>
                <p className="font-medium text-gray-900">{new Date(restaurant.createdAt).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              {restaurant.reviewedAt && (
                <div>
                  <Label className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 block">İnceleme Tarihi</Label>
                  <p className="font-medium text-gray-900">{new Date(restaurant.reviewedAt).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              )}
              {restaurant.rejectionReason && (
                <div>
                  <Label className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2 block">Red Nedeni</Label>
                  <p className="font-medium text-red-600">{restaurant.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Yasal Onaylar */}
          <div className="premium-card p-8 animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="premium-heading-3 mb-6">Yasal Onaylar</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-700">KVKK Aydınlatma Metni</span>
                {restaurant.kvkkConsent ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-700">Gizlilik Politikası</span>
                {restaurant.privacyConsent ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-700">SMS Pazarlama Bildirimi</span>
                {restaurant.marketingSmsConsent ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Belgeler */}
        <div className="premium-card p-8 animate-premium-fade-in">
          <div className="mb-6">
            <h2 className="premium-heading-3 mb-2">Yüklenen Belgeler</h2>
            <p className="text-gray-600 font-medium">Restoran tarafından yüklenen resmi belgeler</p>
          </div>
          <div className="premium-grid premium-grid-2 gap-4">
            {/* Premium Vergi Levhası */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 premium-hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-200 rounded-xl blur-lg opacity-30"></div>
                    <div className="relative w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">Vergi Levhası</span>
                </div>
                {restaurant.taxDocument ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              {restaurant.taxDocument ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewDocument(restaurant.taxDocument!)}
                    className="premium-btn-secondary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Önizle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(restaurant.taxDocument!, 'vergi-levhasi')}
                    className="premium-btn-secondary"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    İndir
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">Belge yüklenmemiş</p>
              )}
            </div>

            {/* Premium İşletme Ruhsatı */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 premium-hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-200 rounded-xl blur-lg opacity-30"></div>
                    <div className="relative w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">İşletme Ruhsatı</span>
                </div>
                {restaurant.businessLicense ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              {restaurant.businessLicense ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewDocument(restaurant.businessLicense!)}
                    className="premium-btn-secondary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Önizle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(restaurant.businessLicense!, 'isletme-ruhsati')}
                    className="premium-btn-secondary"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    İndir
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">Belge yüklenmemiş</p>
              )}
            </div>

            {/* Premium Ticaret Sicil Belgesi */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 premium-hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-200 rounded-xl blur-lg opacity-30"></div>
                    <div className="relative w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">Ticaret Sicil Belgesi</span>
                </div>
                {restaurant.tradeRegistry ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Opsiyonel</span>
                )}
              </div>
              {restaurant.tradeRegistry ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewDocument(restaurant.tradeRegistry!)}
                    className="premium-btn-secondary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Önizle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(restaurant.tradeRegistry!, 'ticaret-sicil-belgesi')}
                    className="premium-btn-secondary"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    İndir
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">Belge yüklenmemiş</p>
              )}
            </div>

            {/* Premium Kimlik Belgesi */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 premium-hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-200 rounded-xl blur-lg opacity-30"></div>
                    <div className="relative w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">Kimlik Belgesi</span>
                </div>
                {restaurant.identityDocument ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              {restaurant.identityDocument ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewDocument(restaurant.identityDocument!)}
                    className="premium-btn-secondary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Önizle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(restaurant.identityDocument!, 'kimlik-belgesi')}
                    className="premium-btn-secondary"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    İndir
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">Belge yüklenmemiş</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Red Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restoranı Reddet</DialogTitle>
            <DialogDescription>
              Lütfen red nedeni giriniz. Bu neden restoran sahibine bildirilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Red Nedeni *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Örn: Belgeler eksik veya geçersiz..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              disabled={processing}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? "Reddediliyor..." : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
