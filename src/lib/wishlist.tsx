"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { Product, WishlistState } from "./types";

const WISHLIST_STORAGE_KEY = "saaral-wishlist";

interface WishlistContextType extends WishlistState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

function getStoredWishlist(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed as Product[];
  } catch {
    return [];
  }
}

function storeWishlist(items: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const prevUserIdRef = useRef<string | null>(null);

  // ── Mount: load from localStorage ────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const stored = getStoredWishlist();
    if (active) {
      setItems(stored);
      setMounted(true);
    }
    return () => { active = false; };
  }, []);

  // ── On login: sync DB wishlist (merge guest items) ────────────────────────
  useEffect(() => {
    if (!mounted || !userId) return;

    let active = true;

    async function syncOnLogin() {
      try {
        // 1. Fetch DB wishlist (just product_ids)
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const { items: dbProductIds } = await res.json();
        const dbIds = new Set<string>(dbProductIds ?? []);

        // 2. Get current localStorage wishlist
        const guestItems = getStoredWishlist();

        // 3. Upload any guest items not already in DB
        const toUpload = guestItems.filter((p) => !dbIds.has(p.id));
        await Promise.all(
          toUpload.map((p) =>
            fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_id: p.id }),
            })
          )
        );

        // 4. Build merged ID set
        const mergedIds = new Set([...dbIds, ...guestItems.map((p) => p.id)]);

        // 5. Keep full product objects for guest items we have locally
        // For DB-only ids we don't have the full product yet — they'll appear
        // on next product page visit (acceptable for now)
        const mergedItems = guestItems.filter((p) => mergedIds.has(p.id));
        // Add DB-only products we don't have locally yet (empty for now)

        if (active) {
          setItems(mergedItems);
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        }
      } catch {
        // Network error — leave as-is
      }
    }

    syncOnLogin();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mounted]);

  // ── On logout: clear state ────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const prevId = prevUserIdRef.current;
    prevUserIdRef.current = userId;
    if (prevId !== null && userId === null) {
      setItems([]);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  }, [userId, mounted]);

  // ── Persist to localStorage when guest ───────────────────────────────────
  useEffect(() => {
    if (mounted && !userId) {
      storeWishlist(items);
    }
  }, [items, mounted, userId]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [product, ...prev];
    });
    if (userId) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id }),
      });
    }
  }, [userId]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    if (userId) {
      fetch(`/api/wishlist?product_id=${encodeURIComponent(productId)}`, { method: "DELETE" });
    }
  }, [userId]);

  const toggleItem = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        if (userId) {
          fetch(`/api/wishlist?product_id=${encodeURIComponent(product.id)}`, { method: "DELETE" });
        }
        return prev.filter((item) => item.id !== product.id);
      }
      if (userId) {
        fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
      }
      return [product, ...prev];
    });
  }, [userId]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items]
  );

  const value: WishlistContextType = {
    items,
    itemCount: items.length,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
