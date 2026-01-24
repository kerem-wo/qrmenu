export function formatTry(cents: number) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalize(s: string) {
  return (s ?? "").toLocaleLowerCase("tr-TR").trim();
}

