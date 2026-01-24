"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Minus, Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";

type ApiProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  stock: number | null;
  order: number;
};

type ApiCategory = {
  id: string;
  name: string;
  description: string | null;
  products: ApiProduct[];
  order: number;
};

type ApiRestaurant = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
};

type BoltItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  isVegetarian?: boolean;
};

type CartLine = {
  item: BoltItem;
  quantity: number;
  note?: string;
};

function formatTry(cents: number) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalize(s: string) {
  return (s ?? "").toLocaleLowerCase("tr-TR").trim();
}

function safeCentsFromTry(priceTry: number) {
  const n = Number(priceTry);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function tabId(raw: string) {
  return `menu-tab-${raw.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`;
}

export function BoltMenuForSlugClient() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Most Popular");
  const [selected, setSelected] = useState<BoltItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    tableNumber: "",
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const popularScrollRef = useRef<HTMLDivElement | null>(null);
  const popularDragRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const fetchMenu = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/menu/${slug}`);
        if (!res.ok) throw new Error("Menu fetch failed");
        const data = (await res.json()) as { restaurant: ApiRestaurant; categories: ApiCategory[] };
        setRestaurant(data.restaurant);
        setCategories(data.categories ?? []);
      } catch (e) {
        console.error(e);
        setRestaurant(null);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchMenu();
  }, [slug]);

  const tabs = useMemo(() => {
    const dynamic = [...categories]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({ id: c.id, name: c.name }));
    return [{ id: "most-popular", name: "Most Popular" }, ...dynamic];
  }, [categories]);

  const items = useMemo(() => {
    const fromApi: BoltItem[] = [];
    for (const cat of categories) {
      const ps = (cat.products ?? [])
        .filter((p) => p.isAvailable && (p.stock === null || p.stock > 0))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      for (const p of ps) {
        const desc = (p.description ?? "").trim();
        const short = desc ? desc : "—";
        const looksVeg = /vegan|vejetaryen|vegetarian/i.test(`${p.name} ${p.description ?? ""}`);
        fromApi.push({
          id: p.id,
          categoryId: cat.id,
          categoryName: cat.name,
          name: p.name,
          shortDescription: short,
          description: desc || short,
          priceCents: safeCentsFromTry(p.price),
          imageUrl:
            p.image ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
          isVegetarian: looksVeg || undefined,
        });
      }
    }
    return fromApi;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const q = normalize(query);
    if (!q) return items;
    return items.filter(
      (i) =>
        normalize(i.name).includes(q) ||
        normalize(i.shortDescription).includes(q) ||
        normalize(i.description).includes(q)
    );
  }, [items, query]);

  const popular = useMemo(() => {
    // DB tarafında "popüler" alanı olmadığı için ilk 10 ürünü vitrin olarak gösteriyoruz.
    return filteredItems.slice(0, 10);
  }, [filteredItems]);

  const cartTotals = useMemo(() => {
    const itemCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
    const totalCents = cartLines.reduce((sum, l) => sum + l.item.priceCents * l.quantity, 0);
    return { itemCount, totalCents };
  }, [cartLines]);

  const addLine = (it: BoltItem, qty: number, note?: string) => {
    const q = Math.max(1, Math.floor(qty || 1));
    setCartLines((prev) => {
      const existing = prev.find((l) => l.item.id === it.id);
      if (!existing) return [...prev, { item: it, quantity: q, note: note?.trim() || undefined }];
      return prev.map((l) =>
        l.item.id === it.id
          ? {
              ...l,
              quantity: l.quantity + q,
              note: (note?.trim() ? note.trim() : l.note) || undefined,
            }
          : l
      );
    });
  };

  const setLineQty = (id: string, qty: number) => {
    const q = Math.max(0, Math.floor(qty || 0));
    setCartLines((prev) => prev.filter((l) => l.item.id !== id || q > 0).map((l) => (l.item.id === id ? { ...l, quantity: q } : l)));
  };

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; items: BoltItem[] }>();
    for (const cat of categories) map.set(cat.id, { id: cat.id, name: cat.name, items: [] });
    for (const it of filteredItems) {
      if (!map.has(it.categoryId)) {
        map.set(it.categoryId, { id: it.categoryId, name: it.categoryName, items: [] });
      }
      map.get(it.categoryId)!.items.push(it);
    }
    const arr: Array<{ id: string; name: string; items: BoltItem[] }> = [];
    map.forEach((v) => arr.push(v));
    return arr.filter((g) => g.items.length > 0);
  }, [categories, filteredItems]);

  // Sync active tab with scroll
  useEffect(() => {
    const els = tabs
      .map((t) => document.getElementById(tabId(t.name)))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        const name = visible?.target?.getAttribute("data-tab");
        if (name) setActiveTab(name);
      },
      { threshold: [0.2, 0.35, 0.6], rootMargin: "-20% 0px -70% 0px" }
    );
    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [tabs]);

  const scrollTo = (name: string) => {
    const el = document.getElementById(tabId(name));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab(name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4 pb-6 pt-4">
        {restaurant ? (
          <div className="mb-3">
            <div className="text-xl font-extrabold text-gray-950">{restaurant.name}</div>
            {restaurant.description ? (
              <div className="mt-1 text-sm text-gray-500">{restaurant.description}</div>
            ) : null}
          </div>
        ) : null}

        {/* Search + add product */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in menu..."
            className="h-12 w-full rounded-full border-2 border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4 py-3">
          <div className="flex gap-5 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const active = t.name === activeTab;
              return (
                <button
                  key={t.id}
                  onClick={() => scrollTo(t.name)}
                  className={[
                    "relative pb-2 text-sm font-semibold transition-colors",
                    active ? "text-gray-950" : "text-gray-500 hover:text-gray-800",
                  ].join(" ")}
                >
                  {t.name}
                  <span
                    className={[
                      "absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-opacity",
                      active ? "bg-emerald-500 opacity-100" : "bg-transparent opacity-0",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4">
        {/* Most Popular */}
        <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24">
          <div className="mt-6 flex items-end justify-between">
            <h2 className="text-xl font-extrabold text-gray-950">Most Popular</h2>
          </div>

          <div
            ref={popularScrollRef}
            className="mt-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseDown={(e) => {
              const el = popularScrollRef.current;
              if (!el) return;
              popularDragRef.current.isDown = true;
              popularDragRef.current.startX = e.pageX;
              popularDragRef.current.scrollLeft = el.scrollLeft;
            }}
            onMouseLeave={() => {
              popularDragRef.current.isDown = false;
            }}
            onMouseUp={() => {
              popularDragRef.current.isDown = false;
            }}
            onMouseMove={(e) => {
              const el = popularScrollRef.current;
              if (!el) return;
              if (!popularDragRef.current.isDown) return;
              e.preventDefault();
              const dx = e.pageX - popularDragRef.current.startX;
              el.scrollLeft = popularDragRef.current.scrollLeft - dx;
            }}
          >
            {popular.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="snap-start shrink-0 w-[240px] md:w-[260px] rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden text-left"
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-extrabold text-gray-950 shadow">
                    {formatTry(item.priceCents)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-extrabold text-gray-950">{item.name}</div>
                  <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                    {item.shortDescription}
                  </div>
                </div>
              </button>
            ))}
            {popular.length === 0 ? (
              <div className="px-1 py-8 text-sm text-gray-500">No matches.</div>
            ) : null}
          </div>
        </section>

        {/* Categories */}
        <div className="mt-8 space-y-10">
          {grouped.map((cat) => (
            <section
              key={cat.id}
              id={tabId(cat.name)}
              data-tab={cat.name}
              className="scroll-mt-24"
            >
              <h3 className="text-lg font-extrabold text-gray-950">{cat.name}</h3>
              <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                {cat.items.map((item) => (
                  <MenuRow key={item.id} item={item} onOpen={() => setSelected(item)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Floating mini cart bar */}
      <AnimatePresence>
        {cartTotals.totalCents > 0 ? (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed inset-x-0 bottom-4 z-40 px-4"
          >
            <button
              className="mx-auto flex w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] items-center justify-between rounded-full bg-emerald-500 px-5 py-4 text-white shadow-lg"
              aria-label="View order"
              onClick={() => setCartOpen(true)}
            >
              <span className="text-sm font-extrabold">View Order</span>
              <span className="text-sm font-extrabold">{formatTry(cartTotals.totalCents)}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ProductSheet
        item={selected}
        onClose={() => setSelected(null)}
        onAdd={(it, qty, note) => addLine(it, qty, note)}
      />

      <OrderSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cartLines}
        onSetQty={setLineQty}
        totalCents={cartTotals.totalCents}
        onConfirm={() => {
          if (cartLines.length === 0) {
            toast.error("Sepetiniz boş!");
            return;
          }
          setConfirmOpen(true);
        }}
      />

      <OrderConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        restaurantId={restaurant?.id ?? null}
        lines={cartLines}
        totalCents={cartTotals.totalCents}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        isSubmitting={isSubmittingOrder}
        onSubmit={async () => {
          if (cartLines.length === 0) {
            toast.error("Sepetiniz boş!");
            return;
          }
          if (!restaurant?.id) {
            toast.error("Restoran bilgisi bulunamadı!");
            return;
          }

          if (!orderForm.customerName.trim()) {
            toast.error("Lütfen isminizi girin!");
            return;
          }
          if (!orderForm.customerPhone.trim()) {
            toast.error("Lütfen telefon numaranızı girin!");
            return;
          }
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(orderForm.customerPhone.trim())) {
            toast.error("Lütfen geçerli bir telefon numarası girin!");
            return;
          }

          setIsSubmittingOrder(true);
          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                restaurantId: restaurant.id,
                tableNumber: orderForm.tableNumber.trim() || null,
                customerName: orderForm.customerName.trim(),
                customerPhone: orderForm.customerPhone.trim(),
                items: cartLines.map((l) => ({
                  productId: l.item.id,
                  quantity: l.quantity,
                  price: l.item.priceCents / 100,
                  notes: l.note || null,
                })),
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              toast.error(data?.error || "Sipariş verilirken bir hata oluştu!");
              return;
            }

            const orderNumber = data.orderNumber;
            toast.success(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}`);

            setCartLines([]);
            setConfirmOpen(false);
            setCartOpen(false);
            setOrderForm({ customerName: "", customerPhone: "", tableNumber: "" });

            router.push(`/order/${orderNumber}`);
          } catch (e) {
            console.error(e);
            toast.error("Bir hata oluştu! Lütfen tekrar deneyin.");
          } finally {
            setIsSubmittingOrder(false);
          }
        }}
      />
    </div>
  );
}

function MenuRow({ item, onOpen }: { item: BoltItem; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className="w-full text-left focus:outline-none"
    >
      <div className="flex gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="text-sm font-extrabold text-gray-950">{item.name}</div>
            {item.isVegetarian ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <Leaf className="h-3 w-3" />
                Veg
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-gray-500 line-clamp-2">{item.shortDescription}</div>
          <div className="mt-2 text-sm font-extrabold text-gray-950">{formatTry(item.priceCents)}</div>
        </div>

        <div className="relative h-[86px] w-[98px] shrink-0">
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5"
            aria-label={`Add ${item.name}`}
          >
            <Plus className="h-5 w-5 text-emerald-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSheet({
  item,
  onClose,
  onAdd,
}: {
  item: BoltItem | null;
  onClose: () => void;
  onAdd: (item: BoltItem, qty: number, note?: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const lastItemId = useRef<string | null>(null);

  useEffect(() => {
    if (!item) return;
    if (lastItemId.current !== item.id) {
      setQty(1);
      setNote("");
      lastItemId.current = item.id;
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [item]);

  const totalCents = (item?.priceCents ?? 0) * qty;

  return (
    <AnimatePresence>
      {item ? (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[720px] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="relative">
              <div className="h-[240px] w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/5"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-900" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 pb-28 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-extrabold text-gray-950">{item.name}</div>
                  <div className="mt-2 text-sm font-extrabold text-gray-950">
                    {formatTry(item.priceCents)}
                  </div>
                </div>
                {item.isVegetarian ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Leaf className="h-4 w-4" />
                    Vegetarian
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.description}</p>

              <div className="mt-6">
                <label className="text-sm font-bold text-gray-900">Add a note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything we should know?"
                  className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Sticky bottom action bar */}
            <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gray-50 text-gray-900"
                    aria-label="Decrease quantity"
                  >
                    <span className="text-lg font-extrabold leading-none">-</span>
                  </button>
                  <div className="w-8 text-center text-sm font-extrabold text-gray-950">{qty}</div>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gray-50 text-gray-900"
                    aria-label="Increase quantity"
                  >
                    <span className="text-lg font-extrabold leading-none">+</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onAdd(item, qty, note);
                    onClose();
                  }}
                  className="flex-1 rounded-full bg-emerald-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-600"
                >
                  Add to Order - {formatTry(totalCents)}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OrderSheet({
  open,
  onClose,
  lines,
  onSetQty,
  totalCents,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onSetQty: (itemId: string, qty: number) => void;
  totalCents: number;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[720px] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="text-lg font-extrabold text-gray-950">Your order</div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">Your order is empty.</div>
              ) : (
                <div className="space-y-3">
                  {lines.map((l) => (
                    <div
                      key={l.item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-gray-950 line-clamp-1">
                          {l.item.name}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-gray-500">
                          {formatTry(l.item.priceCents)}
                        </div>
                        {l.note ? (
                          <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                            <span className="font-bold text-gray-600">Not:</span> {l.note}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onSetQty(l.item.id, l.quantity - 1)}
                          className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                          aria-label="Decrease"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <div className="w-8 text-center text-sm font-extrabold text-gray-950">
                          {l.quantity}
                        </div>
                        <button
                          onClick={() => onSetQty(l.item.id, l.quantity + 1)}
                          className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                          aria-label="Increase"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 bg-white/95 backdrop-blur px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-600">Total</div>
                <div className="text-sm font-extrabold text-gray-950">{formatTry(totalCents)}</div>
              </div>
              <button
                onClick={onConfirm}
                className="mt-3 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-600 disabled:opacity-50"
                disabled={lines.length === 0}
              >
                Sipariş Ver
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OrderConfirmSheet({
  open,
  onClose,
  restaurantId,
  lines,
  totalCents,
  orderForm,
  setOrderForm,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  restaurantId: string | null;
  lines: CartLine[];
  totalCents: number;
  orderForm: { customerName: string; customerPhone: string; tableNumber: string };
  setOrderForm: React.Dispatch<
    React.SetStateAction<{ customerName: string; customerPhone: string; tableNumber: string }>
  >;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[720px] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-extrabold text-gray-950">Sipariş Onayı</div>
                <div className="mt-1 text-xs text-gray-500">
                  {restaurantId ? "Bilgileri girip siparişinizi gönderin." : "Restoran bulunamadı."}
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-4 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="text-sm font-extrabold text-gray-950">Sipariş Özeti</div>
                <div className="mt-2 space-y-2 text-sm">
                  {lines.map((l) => (
                    <div key={l.item.id} className="flex justify-between gap-3">
                      <span className="text-gray-700 font-medium">
                        {l.item.name} x {l.quantity}
                      </span>
                      <span className="font-extrabold text-gray-950">
                        {formatTry(l.item.priceCents * l.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Toplam</span>
                  <span className="text-sm font-extrabold text-gray-950">{formatTry(totalCents)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="text-sm font-extrabold text-gray-950">Bilgiler</div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-700">
                    İsim <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm((s) => ({ ...s, customerName: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-700">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm((s) => ({ ...s, customerPhone: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="05XX XXX XX XX"
                    inputMode="tel"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-700">
                    Masa Numarası <span className="text-gray-400">(Opsiyonel)</span>
                  </label>
                  <input
                    value={orderForm.tableNumber}
                    onChange={(e) => setOrderForm((s) => ({ ...s, tableNumber: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="Örn: 5, A12"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white/95 backdrop-blur px-5 py-4">
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !restaurantId || lines.length === 0}
                className="w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500"
              >
                {isSubmitting ? "Gönderiliyor..." : "Siparişi Onayla"}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

