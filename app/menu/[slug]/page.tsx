import { Suspense } from "react";
import { BoltMenuForSlugClient } from "./_components/BoltMenuForSlugClient";

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    }>
      <BoltMenuForSlugClient />
    </Suspense>
  );
}

