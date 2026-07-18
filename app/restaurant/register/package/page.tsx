"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { formatTry } from "@/lib/package-catalog";

interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: string[];
  tierName?: string;
  accent?: string;
  popular?: boolean;
  isNew?: boolean;
}

interface BillingPackage {
  id: string;
  name: "monthly" | "yearly";
  displayName: string;
  period?: string;
  startingPrice?: number;
  discountPercent: number;
}

function PackageSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams?.get("restaurantId");
  const requestedTheme = searchParams?.get("theme");

  const [themes, setThemes] = useState<Theme[]>([]);
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!restaurantId) {
      toast.error("Restoran bilgisi bulunamadı");
      router.push("/restaurant/register");
      return;
    }

    let cancelled = false;

    async function fetchThemesAndPackages() {
      try {
        const [themesRes, packagesRes] = await Promise.all([fetch("/api/themes"), fetch("/api/packages")]);

        if (!themesRes.ok || !packagesRes.ok) {
          toast.error("Tema ve paket bilgileri yüklenemedi");
          return;
        }

        const themesData = (await themesRes.json()) as Theme[];
        const packagesData = (await packagesRes.json()) as BillingPackage[];

        if (cancelled) return;

        setThemes(themesData);
        setPackages(packagesData);

        if (themesData.length > 0) {
          const requested = themesData.find((theme) => theme.name === requestedTheme);
          setSelectedTheme((requested || themesData[0]).name);
        }
      } catch (error) {
        console.error("Error fetching themes/packages:", error);
        toast.error("Bir hata oluştu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchThemesAndPackages();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, requestedTheme, router]);

  const selectedThemeData = themes.find((theme) => theme.name === selectedTheme || theme.id === selectedTheme);
  const calculatedPrice = selectedThemeData
    ? selectedPackage === "monthly"
      ? selectedThemeData.monthlyPrice
      : selectedThemeData.yearlyPrice
    : 0;
  const yearlySavings = selectedThemeData
    ? Math.max(0, selectedThemeData.monthlyPrice * 12 - selectedThemeData.yearlyPrice)
    : 0;
  const selectedBillingLabel =
    packages.find((pkg) => pkg.name === selectedPackage)?.displayName ||
    (selectedPackage === "monthly" ? "Aylık Paket" : "Yıllık Paket");

  const handleContinue = async () => {
    if (!restaurantId || !selectedTheme) return;

    setSaving(true);
    try {
      const res = await fetch("/api/restaurant/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          theme: selectedTheme,
          packageType: selectedPackage,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Paket seçimi kaydedilemedi");
        return;
      }

      toast.success("Paket seçimi kaydedildi");
      window.location.href = `/restaurant/register/success?restaurantId=${restaurantId}&package=success`;
    } catch (error) {
      console.error("Package selection error:", error);
      toast.error("Paket seçimi kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-bg-gradient">
        <div className="text-center">
          <div className="premium-spinner mx-auto" />
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
          <h1 className="text-4xl font-black text-gray-900 mb-2">Tema ve Paket Seçimi</h1>
          <p className="text-gray-600 text-lg">
            Daha yüksek paketlerde, panelde gerçekten bulunan gelişmiş özellikler aktif edilir.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Paket Tipi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => setSelectedPackage("monthly")}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPackage === "monthly"
                  ? "border-[#FF6F00] bg-[#FF6F00]/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Aylık Paket</h3>
                <div className="mb-1 text-3xl font-black text-gray-900">
                  {selectedThemeData ? `${formatTry(selectedThemeData.monthlyPrice)} ₺` : "..."}
                </div>
                <p className="text-sm text-gray-600">Her ay yenilenen abonelik</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPackage("yearly")}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPackage === "yearly"
                  ? "border-[#FF6F00] bg-[#FF6F00]/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Yıllık Paket</h3>
                <div className="mb-1 text-3xl font-black text-gray-900">
                  {selectedThemeData ? `${formatTry(selectedThemeData.yearlyPrice)} ₺` : "..."}
                </div>
                <p className="text-sm text-gray-600">
                  {selectedThemeData && yearlySavings > 0
                    ? `${formatTry(yearlySavings)} ₺ yıllık avantaj`
                    : "1 yıllık abonelik"}
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tema ve Özellik Paketi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themes.map((theme) => {
              const active = selectedTheme === theme.name || selectedTheme === theme.id;
              const price = selectedPackage === "monthly" ? theme.monthlyPrice : theme.yearlyPrice;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.name)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    active ? "border-[#FF6F00] bg-[#FF6F00]/10" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{theme.displayName}</h3>
                      {theme.tierName ? (
                        <span className="mt-2 inline-flex rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white">
                          {theme.tierName}
                        </span>
                      ) : null}
                    </div>
                    {active ? <Check className="w-5 h-5 text-[#FF6F00]" /> : null}
                  </div>

                  {theme.description ? <p className="text-sm text-gray-600 mb-4">{theme.description}</p> : null}

                  <div className="space-y-2 mb-4">
                    {theme.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">{formatTry(price)} ₺</span>
                      <span className="text-sm text-gray-600">/ {selectedPackage === "monthly" ? "ay" : "yıl"}</span>
                    </div>
                    {selectedPackage === "yearly" && theme.yearlyDiscount > 0 ? (
                      <p className="text-xs text-green-600 mt-1">
                        Aylığa göre yaklaşık %{theme.yearlyDiscount} avantaj
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Özet</h3>
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Tema:</span>
                <span className="font-semibold text-gray-900 text-right">{selectedThemeData?.displayName || "Seçilmedi"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Paket:</span>
                <span className="font-semibold text-gray-900 text-right">{selectedBillingLabel}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center gap-4">
                <span className="text-lg font-bold text-gray-900">Toplam:</span>
                <span className="text-2xl font-black text-[#FF6F00]">{formatTry(calculatedPrice)} ₺</span>
              </div>
              {selectedThemeData?.features?.length ? (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-bold text-gray-900 mb-2">Aktif olacak özellikler</div>
                  <div className="grid gap-2">
                    {selectedThemeData.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedTheme || saving}
            className="w-full h-14 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#FF8F33] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{saving ? "Kaydediliyor..." : "Paketi Kaydet ve Devam Et"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PackageSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen premium-bg-gradient flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <PackageSelectionContent />
    </Suspense>
  );
}
