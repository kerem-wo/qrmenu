"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function QRCodePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchRestaurant(session.restaurantId);
    });
  }, []);

  const fetchRestaurant = async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/admin/restaurant`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
        generateQRCode(data.slug);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (slug: string) => {
    if (typeof window === "undefined") return;
    
    try {
      const QRCodeModule = await import("qrcode");
      const menuUrl = `${window.location.origin}/menu/${slug}`;
      const qrCodeDataUrl = await QRCodeModule.default.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement("a");
    link.download = `qr-menu-${restaurant?.slug || "menu"}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  const menuUrl = restaurant ? `${typeof window !== "undefined" ? window.location.origin : ""}/menu/${restaurant.slug}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">QR Kod</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Menü QR Kodu
            </CardTitle>
            <CardDescription>
              Müşterileriniz bu QR kodu okutarak menünüze erişebilir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
                <Button onClick={downloadQRCode} className="w-full md:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  QR Kodu İndir
                </Button>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Menü Linki:</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={menuUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl);
                    alert("Link kopyalandı!");
                  }}
                >
                  Kopyala
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Kullanım Önerileri:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>QR kodunu yazdırıp masalara yerleştirin</li>
                <li>Menü panosuna asın</li>
                <li>Müşterilerinize WhatsApp veya e-posta ile gönderin</li>
                <li>Sosyal medya hesaplarınızda paylaşın</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
