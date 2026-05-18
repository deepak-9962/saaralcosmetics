"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
    if (!Array.isArray(parsed)) {
      return [];
    }
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

  useEffect(() => {
    queueMicrotask(() => {
      setItems(getStoredWishlist());
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (mounted) {
      storeWishlist(items);
    }
  }, [items, mounted]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [product, ...prev];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleItem = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [product, ...prev];
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items],
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
