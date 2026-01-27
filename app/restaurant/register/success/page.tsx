"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const paymentSuccess = searchParams?.get("payment") === "success";

  useEffect(() => {
    const id = searchParams?.get("restaurantId");
    if (id) {
      setRestaurantId(id);
    }
  }, [searchParams]);

  if (!paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-bg-gradient p-4">
        <div className="premium-card p-8 md:p-12 text-center max-w-md animate-premium-scale-in">
          <h2 className="premium-heading-3 mb-4">Ödeme Bekleniyor</h2>
          <p className="text-gray-600 font-medium mb-8">
            Ödeme işleminiz tamamlanıyor...
          </p>
          <Button
            onClick={() => router.push("/restaurant/register")}
            className="bg-[#FF6F00] text-white hover:bg-[#FF8F33]"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center premium-bg-gradient p-4">
      <div className="premium-card p-8 md:p-12 text-center max-w-md animate-premium-scale-in">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-green-200 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="premium-heading-3 mb-4">Kayıt Başarılı!</h2>
        <p className="text-gray-600 font-medium mb-8">
          Ödemeniz başarıyla tamamlandı. Hesabınız aktif edildi ve kullanıma hazır.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/admin/login">
            <Button className="w-full sm:w-auto bg-[#FF6F00] text-white hover:bg-[#FF8F33] flex items-center gap-2">
              Giriş Yap
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen premium-bg-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
