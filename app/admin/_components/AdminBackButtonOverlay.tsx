"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminBackButtonOverlay() {
  const router = useRouter();

  const onBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {
      // ignore
    }
    router.push("/admin/dashboard");
  };

  return (
    <div className="fixed left-4 top-4 z-[60]">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onBack}
        className="rounded-full bg-white/90 backdrop-blur shadow-sm border-gray-200 hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri
      </Button>
    </div>
  );
}

