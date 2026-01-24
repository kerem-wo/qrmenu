"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Plus, Search, X } from "lucide-react";
import type { BoltCategory, BoltMenuItem } from "../types";
import { useBolt } from "../bolt-provider";
import { formatTry, normalize } from "../utils";

function catId(cat: BoltCategory) {
  return `bolt-cat-${cat.toLowerCase().replaceAll(" ", "-")}`;
}

function matchItem(item: BoltMenuItem, q: string) {
  const query = normalize(q);
  if (!query) return true;
  return (
    normalize(item.name).includes(query) ||
    normalize(item.shortDescription).includes(query) ||
    normalize(item.description).includes(query)
  );
}

export function BoltMenuClient() {
  const { categories, menu, cart, addToOrder } = useBolt();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BoltCategory>("Most Popular");
  const [selected, setSelected] = useState<BoltMenuItem | null>(null);

  const filteredMenu = useMemo(() => {
    return menu.filter((i) => matchItem(i, query));
  }, [menu, query]);

  const popular = useMemo(() => {
    return filteredMenu.filter((i) => i.isPopular || i.category === "Most Popular");
  }, [filteredMenu]);

  const grouped = useMemo(() => {
    const byCat: Record<BoltCategory, BoltMenuItem[]> = {
      "Most Popular": [],
      Starters: [],
      Salads: [],
      "Main Courses": [],
      Drinks: [],
    };
    for (const item of filteredMenu) byCat[item.category].push(item);
    return byCat;
  }, [filteredMenu]);

  // Keep active tab in sync with scroll position.
  useEffect(() => {
    const els = categories
      .map((c) => document.getElementById(catId(c)))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        const cat = visible?.target?.getAttribute("data-cat") as BoltCategory | null;
        if (cat) setActiveCategory(cat);
      },
      {
        root: null,
        threshold: [0.15, 0.3, 0.5, 0.7],
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [categories]);

  const scrollToCategory = (cat: BoltCategory) => {
    const el = document.getElementById(catId(cat));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(cat);
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-4">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in menu..."
          className="bolt-search-input h-12 pl-12 pr-4 rounded-full"
        />

        <Link
          href="/bolt/add-product"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-900"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
            <Plus className="h-4 w-4 text-emerald-600" />
          </span>
          Add product
        </Link>
      </div>

      {/* Sticky category tabs */}
      <div className="sticky top-0 z-30 mt-4 -mx-4 px-4 py-3 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex gap-5 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={[
                  "relative pb-2 text-sm font-semibold transition-colors",
                  active ? "text-gray-950" : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
              >
                {cat}
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

      {/* Most Popular */}
      <section
        id={catId("Most Popular")}
        data-cat="Most Popular"
        className="scroll-mt-24"
      >
        <div className="mt-6 flex items-end justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">Most Popular</h2>
        </div>

        <div className="mt-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {popular.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="snap-start shrink-0 w-[240px] rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden text-left"
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

      {/* Vertical menu list by category */}
      <div className="mt-8 space-y-10">
        {categories
          .filter((c) => c !== "Most Popular")
          .map((cat) => {
            const items = grouped[cat];
            return (
              <section
                key={cat}
                id={catId(cat)}
                data-cat={cat}
                className="scroll-mt-24"
              >
                <h3 className="text-lg font-extrabold text-gray-950">{cat}</h3>
                <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                  {items.map((item) => (
                    <MenuRow key={item.id} item={item} onOpen={() => setSelected(item)} />
                  ))}
                  {items.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No items.</div>
                  ) : null}
                </div>
              </section>
            );
          })}
      </div>

      {/* Floating mini cart bar */}
      <AnimatePresence>
        {cart.totalCents > 0 ? (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed inset-x-0 bottom-4 z-40 px-4"
          >
            <button
              className="mx-auto flex w-full max-w-[720px] items-center justify-between rounded-full bg-emerald-500 px-5 py-4 text-white shadow-lg"
              aria-label="View order"
            >
              <span className="text-sm font-extrabold">View Order</span>
              <span className="text-sm font-extrabold">{formatTry(cart.totalCents)}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ProductSheet
        item={selected}
        onClose={() => setSelected(null)}
        onAdd={(item, qty) => addToOrder(item, qty)}
      />
    </div>
  );
}

function MenuRow({ item, onOpen }: { item: BoltMenuItem; onOpen: () => void }) {
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
          <div className="mt-1 text-xs text-gray-500 line-clamp-2">
            {item.shortDescription}
          </div>
          <div className="mt-2 text-sm font-extrabold text-gray-950">
            {formatTry(item.priceCents)}
          </div>
        </div>

        <div className="relative h-[86px] w-[98px] shrink-0">
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
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
  item: BoltMenuItem | null;
  onClose: () => void;
  onAdd: (item: BoltMenuItem, qty: number) => void;
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
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
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
                  <div className="w-8 text-center text-sm font-extrabold text-gray-950">
                    {qty}
                  </div>
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
                    onAdd(item, qty);
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

