"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function QRCodePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchRestaurant(session.restaurantId);
    });
  }, [router]);

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
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center gap-4 py-5">
            <Button variant="ghost" asChild className="premium-btn-secondary px-4 py-2">
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Link>
            </Button>
            <h1 className="premium-heading-3">QR Kod</h1>
          </div>
        </div>
      </header>

      <main className="premium-container py-10 max-w-2xl mx-auto">
        <div className="premium-card p-10 animate-premium-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-lg opacity-30"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="premium-heading-3">Menü QR Kodu</h2>
            </div>
            <p className="text-gray-600 font-medium">
              Müşterileriniz bu QR kodu okutarak menünüze erişebilir
            </p>
          </div>
          <div className="space-y-6">
            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 premium-shadow-md">
                  <Image src={qrCodeUrl} alt="QR Code" width={256} height={256} className="w-64 h-64" />
                </div>
                <Button onClick={downloadQRCode} className="premium-btn-primary w-full md:w-auto">
                  <Download className="w-5 h-5 mr-2" />
                  QR Kodu İndir
                </Button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Menü Linki:</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={menuUrl}
                  readOnly
                  className="flex-1 premium-input font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl);
                    toast.success("Link kopyalandı!");
                  }}
                  className="premium-btn-secondary px-6"
                >
                  Kopyala
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Kullanım Önerileri:</h4>
              <ul className="text-sm text-gray-700 space-y-2 font-medium">
                <li>• QR kodunu yazdırıp masalara yerleştirin</li>
                <li>• Menü panosuna asın</li>
                <li>• Müşterilerinize WhatsApp veya e-posta ile gönderin</li>
                <li>• Sosyal medya hesaplarınızda paylaşın</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
