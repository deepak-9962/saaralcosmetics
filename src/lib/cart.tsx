"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";
import type { CartItem, CartState, AppliedPromo } from "./types";

const CART_STORAGE_KEY = "saaral-cart";
const PROMO_STORAGE_KEY = "saaral-promo";

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Promo
  appliedPromo: AppliedPromo | null;
  isValidatingPromo: boolean;
  promoError: string | null;
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => void;
  /** Discounted grand total (subtotal - discount) */
  discountedTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getStoredPromo(): AppliedPromo | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(PROMO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function storePromo(promo: AppliedPromo | null) {
  if (typeof window === "undefined") return;
  if (promo) {
    localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promo));
  } else {
    localStorage.removeItem(PROMO_STORAGE_KEY);
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Track previous item count for re-validation trigger
  const prevItemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(getStoredCart());
      setAppliedPromo(getStoredPromo());
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (mounted) {
      storeCart(items);
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      storePromo(appliedPromo);
    }
  }, [appliedPromo, mounted]);

  // ── Auto-revalidate promo when cart items change ─────────────────────────
  useEffect(() => {
    if (!mounted || !appliedPromo) {
      prevItemsRef.current = items;
      return;
    }

    // Only re-validate if items actually changed
    const prevItems = prevItemsRef.current;
    const itemsChanged =
      JSON.stringify(items.map((i) => ({ id: i.product_id, qty: i.quantity }))) !==
      JSON.stringify(prevItems.map((i) => ({ id: i.product_id, qty: i.quantity })));

    prevItemsRef.current = items;

    if (!itemsChanged) return;

    const currentTotal = calculateTotal(items);
    const code = appliedPromo.code;

    // Re-validate silently
    fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, cartItems: items, subtotal: currentTotal }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (!result.valid) {
          // Code no longer valid — auto-remove and toast
          setAppliedPromo(null);
          const reason: string = result.reason ?? "Code is no longer applicable.";
          toast.error(`${code} removed — ${reason}`, { duration: 5000 });
        } else if (result.discount_amount !== appliedPromo.discount_amount) {
          // Still valid but discount changed (e.g., qty changed) — silently update
          setAppliedPromo({
            code: result.code,
            discount_type: result.discount_type,
            discount_amount: result.discount_amount,
          });
        }
      })
      .catch(() => {
        // Network error — leave promo as-is, don't penalise the user
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mounted]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === newItem.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === newItem.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
  }, []);

  // ── Apply promo code ─────────────────────────────────────────────────────
  const applyPromo = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      setIsValidatingPromo(true);
      setPromoError(null);

      try {
        const currentTotal = calculateTotal(items);
        const res = await fetch("/api/promo/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim().toUpperCase(),
            cartItems: items,
            subtotal: currentTotal,
          }),
        });
        const result = await res.json();

        if (result.valid) {
          setAppliedPromo({
            code: result.code,
            discount_type: result.discount_type,
            discount_amount: result.discount_amount,
          });
          setPromoError(null);
          toast.success(`${result.code} applied — ₹${result.discount_amount.toFixed(0)} off!`);
        } else {
          setPromoError(result.reason ?? "Invalid promo code.");
          toast.error(result.reason ?? "Invalid promo code.");
        }
      } catch {
        const msg = "Could not validate code. Please try again.";
        setPromoError(msg);
        toast.error(msg);
      } finally {
        setIsValidatingPromo(false);
      }
    },
    [items]
  );

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoError(null);
  }, []);

  const rawTotal = calculateTotal(items);
  const discountAmount = appliedPromo?.discount_amount ?? 0;
  const discountedTotal = Math.max(0, rawTotal - discountAmount);

  const value: CartContextType = {
    items,
    total: rawTotal,
    itemCount: calculateItemCount(items),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    appliedPromo,
    isValidatingPromo,
    promoError,
    applyPromo,
    removePromo,
    discountedTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
