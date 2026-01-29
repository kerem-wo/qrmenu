"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: string[];
}

interface Package {
  id: string;
  name: string;
  displayName: string;
  discountPercent: number;
}

function PackageSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams?.get("restaurantId");

  const [themes, setThemes] = useState<Theme[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      toast.error("Restoran bilgisi bulunamadı");
      router.push("/restaurant/register");
      return;
    }

    fetchThemesAndPackages();
  }, [restaurantId]);

  const fetchThemesAndPackages = async () => {
    try {
      const [themesRes, packagesRes] = await Promise.all([
        fetch("/api/themes"),
        fetch("/api/packages"),
      ]);

      if (themesRes.ok && packagesRes.ok) {
        const themesData = await themesRes.json();
        const packagesData = await packagesRes.json();

        setThemes(themesData);
        setPackages(packagesData);

        // İlk temayı seç
        if (themesData.length > 0) {
          setSelectedTheme(themesData[0].id);
        }
      } else {
        toast.error("Tema ve paket bilgileri yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching themes/packages:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!restaurantId || !selectedTheme) return;
    window.location.href = `/restaurant/register/success?restaurantId=${restaurantId}`;
  };

  const selectedThemeData = themes.find((t) => t.id === selectedTheme);
  const calculatedPrice = selectedThemeData
    ? selectedPackage === "monthly"
      ? selectedThemeData.monthlyPrice
      : selectedThemeData.yearlyPrice * (1 - selectedThemeData.yearlyDiscount / 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-bg-gradient">
        <div className="text-center">
          <div className="premium-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/restaurant/register" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Tema ve Paket Seçimi
          </h1>
          <p className="text-gray-600 text-lg">
            Dijital menünüz için tema ve paket seçin
          </p>
        </div>

        {/* Paket Tipi Seçimi */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Paket Tipi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedPackage("monthly")}
              className={`p-6 rounded-xl border-2 transition-all ${selectedPackage === "monthly"
                  ? "border-[#FF6F00] bg-[#FF6F00]/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Aylık Paket</h3>
                <p className="text-sm text-gray-600">Her ay yenilenen abonelik</p>
              </div>
            </button>
            <button
              onClick={() => setSelectedPackage("yearly")}
              className={`p-6 rounded-xl border-2 transition-all ${selectedPackage === "yearly"
                  ? "border-[#FF6F00] bg-[#FF6F00]/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Yıllık Paket</h3>
                <p className="text-sm text-gray-600">
                  {selectedThemeData && selectedThemeData.yearlyDiscount > 0
                    ? `%${selectedThemeData.yearlyDiscount} indirim`
                    : "1 yıllık abonelik"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Tema Seçimi */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tema Seçimi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${selectedTheme === theme.id
                    ? "border-[#FF6F00] bg-[#FF6F00]/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{theme.displayName}</h3>
                  {selectedTheme === theme.id && (
                    <Check className="w-5 h-5 text-[#FF6F00]" />
                  )}
                </div>
                {theme.description && (
                  <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  {theme.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900">
                      {selectedPackage === "monthly"
                        ? theme.monthlyPrice.toFixed(2)
                        : (theme.yearlyPrice * (1 - theme.yearlyDiscount / 100)).toFixed(2)}
                      ₺
                    </span>
                    <span className="text-sm text-gray-600">
                      / {selectedPackage === "monthly" ? "ay" : "yıl"}
                    </span>
                  </div>
                  {selectedPackage === "yearly" && theme.yearlyDiscount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      %{theme.yearlyDiscount} indirim kazandınız!
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Özet ve Ödeme */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Özet</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tema:</span>
                <span className="font-semibold text-gray-900">
                  {selectedThemeData?.displayName || "Seçilmedi"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paket:</span>
                <span className="font-semibold text-gray-900">
                  {selectedPackage === "monthly" ? "Aylık" : "Yıllık"}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Toplam:</span>
                <span className="text-2xl font-black text-[#FF6F00]">
                  {calculatedPrice.toFixed(2)} ₺
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedTheme}
            className="w-full h-14 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#FF8F33] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Devam Et</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PackageSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen premium-bg-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PackageSelectionContent />
    </Suspense>
  );
}
