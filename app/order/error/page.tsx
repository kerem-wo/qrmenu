"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string>("Ödeme işlemi başarısız");

  useEffect(() => {
    const errorMessage = searchParams?.get("message");
    if (errorMessage) {
      setMessage(decodeURIComponent(errorMessage));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center premium-bg-gradient p-4">
      <div className="premium-card p-8 md:p-12 text-center max-w-md animate-premium-scale-in">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-red-200 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h2 className="premium-heading-3 mb-4">Ödeme Başarısız</h2>
        <p className="text-gray-600 font-medium mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-[#FF6F00] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#FF8F33] transition-all"
          >
            Ana Sayfa
          </button>
        </div>
      </div>
    </div>
  );
}
