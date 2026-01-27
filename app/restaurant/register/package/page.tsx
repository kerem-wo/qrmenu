"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, CreditCard } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import PremiumCreditCard from "@/components/PremiumCreditCard";

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
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [mockPaymentId, setMockPaymentId] = useState<string | null>(null);
  const [mockAmount, setMockAmount] = useState<number>(0);

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

  const showMockPaymentForm = (paymentId: string, amount: number) => {
    setMockPaymentId(paymentId);
    setMockAmount(amount);
    setShowMockPayment(true);
  };

  const handleMockPaymentSubmit = async (data: {
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
  }) => {
    if (!mockPaymentId || !restaurantId) return;

    try {
      // Mock callback'i simüle et
      const paymentRes = await fetch(`/api/payment/paytr/mock-info?paymentId=${mockPaymentId}`);
      const paymentInfo = await paymentRes.json();
      const merchantOid = paymentInfo.merchantOid || `sub_${restaurantId}_${Date.now()}`;
      
      const callbackRes = await fetch("/api/payment/paytr/callback", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          merchant_oid: merchantOid,
          status: "success",
          total_amount: mockAmount.toFixed(2),
          hash: "mock_hash_" + Date.now(),
        }),
      });

      if (callbackRes.ok) {
        setShowMockPayment(false);
        window.location.href = `/restaurant/register/success?payment=success&restaurantId=${restaurantId}`;
      } else {
        throw new Error("Mock ödeme başarısız");
      }
    } catch (error) {
      console.error("Mock payment error:", error);
      alert("Mock ödeme simülasyonu başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleMockPaymentCancel = () => {
    setShowMockPayment(false);
    setMockPaymentId(null);
    setMockAmount(0);
  };

  const showPayTRIframe = (token: string, iframeUrl: string) => {
    // PayTR iframe modal oluştur
    const modal = document.createElement("div");
    modal.id = "paytr-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50";
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 relative">
        <button onclick="document.getElementById('paytr-modal').remove()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h3 class="text-xl font-bold mb-4">Ödeme</h3>
        <iframe 
          name="paytriframe" 
          id="paytriframe" 
          width="100%" 
          height="600" 
          scrolling="no" 
          style="border: none;"
          allowtransparency="true"
        ></iframe>
      </div>
    `;
    document.body.appendChild(modal);

    // PayTR iframe formu oluştur ve submit et
    const form = document.createElement("form");
    form.method = "POST";
    form.action = iframeUrl;
    form.target = "paytriframe";
    form.style.display = "none";
    
    const tokenInput = document.createElement("input");
    tokenInput.type = "hidden";
    tokenInput.name = "token";
    tokenInput.value = token;
    form.appendChild(tokenInput);
    
    document.body.appendChild(form);
    form.submit();
    
    // Form submit sonrası formu kaldır
    setTimeout(() => {
      document.body.removeChild(form);
    }, 1000);

    // PayTR callback sonrası yönlendirme için kontrol (5 saniye sonra başla)
    setTimeout(() => {
      const checkInterval = setInterval(() => {
        // URL parametrelerini kontrol et (callback sayfadan geldiyse)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("payment") === "success") {
          clearInterval(checkInterval);
          modal.remove();
          window.location.href = `/restaurant/register/success?payment=success&restaurantId=${restaurantId}`;
        }
      }, 2000);

      // 5 dakika sonra interval'i temizle
      setTimeout(() => clearInterval(checkInterval), 300000);
    }, 5000);
  };

  const handlePayment = async () => {
    if (!restaurantId || !selectedTheme || processingPayment) return;

    setProcessingPayment(true);

    try {
      const res = await fetch("/api/payment/paytr/subscription/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurantId,
          themeId: selectedTheme,
          packageType: selectedPackage,
          customerName: "Restoran Sahibi", // Bu bilgiyi restaurant kaydından alabilirsiniz
          customerPhone: "",
          customerEmail: "",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Ödeme başlatılamadı");
      }

      const data = await res.json();

      if (data.mockMode) {
        // Mock mode: Simüle edilmiş ödeme formu göster
        const selectedThemeData = themes.find((t) => t.id === selectedTheme);
        const calculatedPrice = selectedThemeData
          ? selectedPackage === "monthly"
            ? selectedThemeData.monthlyPrice
            : selectedThemeData.yearlyPrice * (1 - selectedThemeData.yearlyDiscount / 100)
          : 0;
        showMockPaymentForm(data.paymentId, calculatedPrice);
      } else if (data.token && data.iframeUrl) {
        // PayTR iframe'i göster
        showPayTRIframe(data.token, data.iframeUrl);
      } else {
        throw new Error("Ödeme sayfası bilgisi alınamadı");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Ödeme başlatılırken bir hata oluştu");
      setProcessingPayment(false);
    }
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
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPackage === "monthly"
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
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPackage === "yearly"
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
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedTheme === theme.id
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
            onClick={handlePayment}
            disabled={!selectedTheme || processingPayment}
            className="w-full h-14 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#FF8F33] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Ödeme sayfası açılıyor...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Ödemeye Geç</span>
              </>
            )}
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
