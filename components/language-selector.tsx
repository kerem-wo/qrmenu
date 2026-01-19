"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-600" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-sm border border-slate-300 rounded px-2 py-1 bg-white h-9"
      >
        <option value="tr">TR</option>
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
    </div>
  );
}
