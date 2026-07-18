export type BillingCycle = "monthly" | "yearly";
export type PackageTier = "starter" | "plus" | "pro" | "ultra";

export type ThemePackage = {
  theme: string;
  displayName: string;
  shortName: string;
  tier: PackageTier;
  tierName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: string[];
  accent: string;
  popular?: boolean;
  isNew?: boolean;
};

export const PACKAGE_TIERS: Record<
  PackageTier,
  {
    name: string;
    rank: number;
    monthlyPrice: number;
    yearlyPrice: number;
    yearlyDiscount: number;
    features: string[];
  }
> = {
  starter: {
    name: "Başlangıç",
    rank: 1,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    yearlyDiscount: 17,
    features: [
      "Dijital QR menü yayını",
      "Ürün, kategori, fiyat ve stok yönetimi",
      "Masa ve gel al sipariş akışı",
      "Mobil uyumlu menü deneyimi",
    ],
  },
  plus: {
    name: "Plus",
    rank: 2,
    monthlyPrice: 499,
    yearlyPrice: 4990,
    yearlyDiscount: 17,
    features: [
      "Başlangıç paketindeki her şey",
      "Garson çağır ve hesap iste bildirimleri",
      "Kampanya ve kupon yönetimi",
      "7 dilde restoran, kategori ve ürün çevirisi",
    ],
  },
  pro: {
    name: "Pro",
    rank: 3,
    monthlyPrice: 799,
    yearlyPrice: 7990,
    yearlyDiscount: 17,
    features: [
      "Plus paketindeki her şey",
      "Analitik raporlar ve en çok satan ürünler",
      "Sipariş CSV dışa aktarma",
      "Gelişmiş premium tema ailesi",
    ],
  },
  ultra: {
    name: "Ultra",
    rank: 4,
    monthlyPrice: 1199,
    yearlyPrice: 11990,
    yearlyDiscount: 17,
    features: [
      "Pro paketindeki her şey",
      "Tüm tema ailesi ve Ultra+ görünüm",
      "Lüks restoranlar için koyu/premium menü deneyimi",
      "Öne çıkan kampanya vitrini ve çok dilli menü birlikte",
    ],
  },
};

const themeGroups: Array<{
  tier: PackageTier;
  themes: Array<{
    theme: string;
    displayName: string;
    shortName: string;
    description: string;
    accent: string;
    popular?: boolean;
    isNew?: boolean;
  }>;
}> = [
  {
    tier: "starter",
    themes: [
      {
        theme: "default",
        displayName: "Başlangıç Menü",
        shortName: "Başlangıç",
        description: "Hızlı açılan, sade QR menü. Ürün, kategori, stok ve sipariş akışını tek panelden yönetmek isteyen işletmeler için.",
        accent: "#10b981",
      },
      {
        theme: "paper",
        displayName: "Kağıt Menü",
        shortName: "Kağıt",
        description: "Klasik menü hissini koruyan temiz ve okunabilir dijital menü.",
        accent: "#8c5b25",
      },
      {
        theme: "warm-cafe",
        displayName: "Warm Café",
        shortName: "Warm Café",
        description: "Butik kafe ve pastaneler için sıcak, sakin ve okunabilir menü düzeni.",
        accent: "#4a7c59",
        isNew: true,
      },
    ],
  },
  {
    tier: "plus",
    themes: [
      {
        theme: "premium",
        displayName: "Premium Menü",
        shortName: "Premium",
        description: "Modern restoranlar için daha güçlü görsel dil, kampanya ve çok dilli menü desteğiyle birlikte.",
        accent: "#2563eb",
      },
      {
        theme: "paper-image",
        displayName: "Resimli Kağıt Menü",
        shortName: "Resimli Kağıt",
        description: "Ürün fotoğraflarını öne çıkaran kafe ve hızlı servis menüsü.",
        accent: "#d97706",
      },
      {
        theme: "swipe",
        displayName: "Modern Swipe Menü",
        shortName: "Swipe",
        description: "Kartlı, hızlı taranan ve siparişe yakın duran modern menü deneyimi.",
        accent: "#7c3aed",
      },
      {
        theme: "bento",
        displayName: "Bento Menü",
        shortName: "Bento",
        description: "Modern kafe ve yeni nesil restoranlar için ferah ızgara düzeni.",
        accent: "#111827",
        isNew: true,
      },
      {
        theme: "soft-ui",
        displayName: "Soft UI Menü",
        shortName: "Soft UI",
        description: "Pastane ve tatlı işletmeleri için yumuşak renkli, rahat okunur menü.",
        accent: "#db5c7a",
      },
    ],
  },
  {
    tier: "pro",
    themes: [
      {
        theme: "pro",
        displayName: "Pro QR Menü",
        shortName: "Pro",
        description: "Analitik, sipariş dışa aktarma ve iş odaklı tema isteyen profesyonel işletmeler için.",
        accent: "#1f4d91",
        popular: true,
      },
      {
        theme: "editorial",
        displayName: "Editorial Menü",
        shortName: "Editorial",
        description: "Fine dining ve tasarım odaklı mekanlar için sakin, editoryal ve premium menü dili.",
        accent: "#c2885b",
        isNew: true,
      },
      {
        theme: "night-luxe",
        displayName: "Night Luxe Menü",
        shortName: "Night Luxe",
        description: "Bar, steakhouse ve gece mekanları için koyu, bakır aksanlı premium menü.",
        accent: "#d3a16f",
        isNew: true,
      },
      {
        theme: "neo-retro",
        displayName: "Neo Retro Menü",
        shortName: "Neo Retro",
        description: "Burger, food truck ve genç hedef kitleli mekanlar için cesur görsel dil.",
        accent: "#ff4b86",
        isNew: true,
      },
      {
        theme: "glass",
        displayName: "Glass Menü",
        shortName: "Glass",
        description: "Butik otel, lounge ve modern kafe için cam efektli çağdaş menü.",
        accent: "#6857d8",
        isNew: true,
      },
      {
        theme: "premium-plus",
        displayName: "Premium+ QR Menü",
        shortName: "Premium+",
        description: "Lüks restoranlar için koyu zemin, premium vurgu ve güçlü ürün sunumu.",
        accent: "#c48745",
        popular: true,
      },
    ],
  },
  {
    tier: "ultra",
    themes: [
      {
        theme: "ultra-plus",
        displayName: "Ultra+ Menü",
        shortName: "Ultra+",
        description: "Tüm gelişmiş özellikleri ve en yüksek görsel etkiyi isteyen restoranlar için.",
        accent: "#7c3aed",
      },
    ],
  },
];

export const THEME_PACKAGES: ThemePackage[] = themeGroups.flatMap((group) =>
  group.themes.map((item) => {
    const tier = PACKAGE_TIERS[group.tier];

    return {
      ...item,
      tier: group.tier,
      tierName: tier.name,
      monthlyPrice: tier.monthlyPrice,
      yearlyPrice: tier.yearlyPrice,
      yearlyDiscount: tier.yearlyDiscount,
      features: tier.features,
    };
  })
);

export const VALID_THEME_NAMES = THEME_PACKAGES.map((item) => item.theme);

export function getThemePackage(theme: string | null | undefined) {
  const key = String(theme || "").trim().toLowerCase();
  return THEME_PACKAGES.find((item) => item.theme === key);
}

export function getThemePackageOrDefault(theme: string | null | undefined) {
  return getThemePackage(theme) || THEME_PACKAGES[0];
}

export function getBillingPrice(item: Pick<ThemePackage, "monthlyPrice" | "yearlyPrice">, cycle: BillingCycle) {
  return cycle === "monthly" ? item.monthlyPrice : item.yearlyPrice;
}

export function getPackageTierRank(tier: PackageTier | null | undefined) {
  return tier ? PACKAGE_TIERS[tier]?.rank || 0 : 0;
}

export function getThemePackageRank(theme: string | null | undefined) {
  return getPackageTierRank(getThemePackage(theme)?.tier);
}

export function getThemeUpgradeAmount(
  currentTheme: string | null | undefined,
  targetTheme: string | null | undefined,
  cycle: BillingCycle,
  hasActivePackage = true
) {
  const targetPackage = getThemePackage(targetTheme);
  if (!targetPackage) return 0;

  const currentPackage = getThemePackage(currentTheme);
  const currentAmount = hasActivePackage && currentPackage ? getBillingPrice(currentPackage, cycle) : 0;
  return Math.max(0, getBillingPrice(targetPackage, cycle) - currentAmount);
}

export function formatTry(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(amount);
}
