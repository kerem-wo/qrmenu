"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { BoltCategory, BoltMenuItem } from "./types";
import { initialBoltMenu } from "./menu-data";

type BoltCartState = {
  itemCount: number;
  totalCents: number;
};

type BoltContextValue = {
  categories: BoltCategory[];
  menu: BoltMenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<BoltMenuItem[]>>;
  cart: BoltCartState;
  addToOrder: (item: BoltMenuItem, quantity: number) => void;
  addProduct: (item: Omit<BoltMenuItem, "id">) => BoltMenuItem;
};

const BoltContext = createContext<BoltContextValue | null>(null);

function uid(prefix = "item") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

export function BoltProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<BoltMenuItem[]>(initialBoltMenu);
  const [cart, setCart] = useState<BoltCartState>({ itemCount: 0, totalCents: 0 });

  const categories = useMemo<BoltCategory[]>(() => {
    // Keep the exact order requested.
    return ["Most Popular", "Starters", "Salads", "Main Courses", "Drinks"];
  }, []);

  const value = useMemo<BoltContextValue>(() => {
    return {
      categories,
      menu,
      setMenu,
      cart,
      addToOrder: (item, quantity) => {
        const qty = Math.max(1, Math.floor(quantity || 1));
        setCart((c) => ({
          itemCount: c.itemCount + qty,
          totalCents: c.totalCents + item.priceCents * qty,
        }));
      },
      addProduct: (item) => {
        const created: BoltMenuItem = { ...item, id: uid("bolt") };
        setMenu((m) => [created, ...m]);
        return created;
      },
    };
  }, [cart, categories, menu]);

  return <BoltContext.Provider value={value}>{children}</BoltContext.Provider>;
}

export function useBolt() {
  const ctx = useContext(BoltContext);
  if (!ctx) throw new Error("useBolt must be used within BoltProvider");
  return ctx;
}

