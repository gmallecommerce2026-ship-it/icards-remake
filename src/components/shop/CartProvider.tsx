"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_QTY, getProduct, getVariant } from "@/lib/shop";

export type CartLine = { key: string; slug: string; variantId: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  add: (slug: string, variantId: string, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "icards.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n)));
const lineKey = (slug: string, variantId: string) => `${slug}:${variantId}`;

// Chỉ lưu định danh và số lượng. Giá luôn được tra lại từ danh mục khi hiển thị.
function isValidLine(x: unknown): x is CartLine {
  if (!x || typeof x !== "object") return false;
  const l = x as CartLine;
  const product = typeof l.slug === "string" ? getProduct(l.slug) : undefined;
  return !!product && typeof l.variantId === "string" && !!getVariant(product, l.variantId) && Number.isFinite(l.qty);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(parsed.filter(isValidLine).map((l) => ({ ...l, key: lineKey(l.slug, l.variantId), qty: clamp(l.qty) })));
        }
      }
    } catch {
      /* bộ nhớ trình duyệt bị chặn hoặc dữ liệu hỏng: bắt đầu với giỏ trống */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* bỏ qua */
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, variantId: string, qty: number) => {
    const key = lineKey(slug, variantId);
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: clamp(l.qty + qty) } : l));
      return [...prev, { key, slug, variantId, qty: clamp(qty) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: clamp(qty) } : l)));
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({ lines, ready, count: lines.reduce((s, l) => s + l.qty, 0), add, setQty, remove, clear }),
    [lines, ready, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong CartProvider");
  return ctx;
}
