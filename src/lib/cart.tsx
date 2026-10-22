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
import { useAuth } from "@/lib/auth";
import type { CartItem, CartState, AppliedPromo } from "./types";

const CART_STORAGE_KEY = "saaral-cart";
const PROMO_STORAGE_KEY = "saaral-promo";
const MAX_QTY = 20;

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

/**
 * Merge a guest cart into a user's DB cart.
 * For each guest item:
 *   - If the same product_id exists in userDbItems, sum quantities (capped at MAX_QTY).
 *   - Otherwise, insert the guest item directly.
 * Returns the merged list.
 */
function mergeGuestIntoDb(guestItems: CartItem[], dbItems: CartItem[]): CartItem[] {
  const merged: CartItem[] = [...dbItems];

  for (const guestItem of guestItems) {
    const existing = merged.find((i) => i.product_id === guestItem.product_id);
    if (existing) {
      existing.quantity = Math.min(MAX_QTY, existing.quantity + guestItem.quantity);
    } else {
      merged.push({ ...guestItem });
    }
  }

  return merged;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Current auth user id from central AuthContext — tracks login/logout
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Track previous item count for re-validation trigger
  const prevItemsRef = useRef<CartItem[]>([]);
  // Prevent concurrent DB sync
  const syncingRef = useRef(false);
  // Track last synced items to avoid unnecessary writes
  const lastSyncedRef = useRef<string>("");

  // ── Load cart from localStorage on mount ─────────────────────────────────
  useEffect(() => {
    let active = true;
    const storedItems = getStoredCart();
    const storedPromo = getStoredPromo();
    if (active) {
      setItems(storedItems);
      setAppliedPromo(storedPromo);
      setMounted(true);
    }
    return () => { active = false; };
  }, []);

  // ── On login: load DB cart and merge guest cart into it ───────────────────
  useEffect(() => {
    if (!mounted || !userId) return;

    let active = true;

    async function syncOnLogin() {
      if (!userId) return;
      try {
        // 1. Fetch DB cart
        const res = await fetch("/api/cart");
        if (!res.ok) return;
        const { items: dbRaw } = await res.json();
        const dbItems: CartItem[] = (dbRaw ?? []).map((r: any) => ({
          product_id: r.product_id,
          name: r.name,
          variant_name: r.variant_name,
          price: r.price,
          quantity: r.quantity,
          image: r.image,
          slug: r.slug,
          is_combo: r.is_combo,
        }));

        // 2. Get current localStorage (guest) cart
        const guestItems = getStoredCart();

        // 3. Merge guest into DB (if there's a guest cart)
        let finalItems = dbItems;
        if (guestItems.length > 0) {
          finalItems = mergeGuestIntoDb(guestItems, dbItems);

          // 4. Persist merged items back to DB
          await Promise.all(
            finalItems.map((item) =>
              fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              })
            )
          );

          // 5. Clear guest localStorage ONLY after successful merge
          localStorage.removeItem(CART_STORAGE_KEY);
        }

        if (active) {
          setItems(finalItems);
          lastSyncedRef.current = JSON.stringify(finalItems);
        }
      } catch {
        // Network error — leave cart as-is
      }
    }

    syncOnLogin();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mounted]);

  // ── On logout: clear state (don't delete DB data) ─────────────────────────
  const prevUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const prevId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    // User just logged out
    if (prevId !== null && userId === null) {
      setItems([]);
      setAppliedPromo(null);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [userId, mounted]);

  // ── Persist to localStorage (guest) or DB (authenticated) ─────────────────
  useEffect(() => {
    if (!mounted) return;

    if (!userId) {
      // Guest: write to localStorage
      storeCart(items);
      return;
    }

    // Authenticated: skip if items haven't changed or already syncing
    const serialized = JSON.stringify(items);
    if (serialized === lastSyncedRef.current) return;
    if (syncingRef.current) return;

    lastSyncedRef.current = serialized;
    // Fire-and-forget individual item syncs — handled by item-level actions
  }, [items, mounted, userId]);

  // ── Persist promo to localStorage ────────────────────────────────────────
  useEffect(() => {
    if (mounted) {
      storePromo(appliedPromo);
    }
  }, [appliedPromo, mounted]);

  // ── Auto-revalidate promo when cart items change ──────────────────────────
  useEffect(() => {
    if (!mounted || !appliedPromo) {
      prevItemsRef.current = items;
      return;
    }

    const prevItems = prevItemsRef.current;
    const itemsChanged =
      JSON.stringify(items.map((i) => ({ id: i.product_id, qty: i.quantity }))) !==
      JSON.stringify(prevItems.map((i) => ({ id: i.product_id, qty: i.quantity })));

    prevItemsRef.current = items;
    if (!itemsChanged) return;

    const currentTotal = calculateTotal(items);
    const code = appliedPromo.code;

    fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, cartItems: items, subtotal: currentTotal }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (!result.valid) {
          setAppliedPromo(null);
          const reason: string = result.reason ?? "Code is no longer applicable.";
          toast.error(`${code} removed — ${reason}`, { duration: 5000 });
        } else if (result.discount_amount !== appliedPromo.discount_amount) {
          setAppliedPromo({
            code: result.code,
            discount_type: result.discount_type,
            discount_amount: result.discount_amount,
          });
        }
      })
      .catch(() => { /* Network error — leave promo as-is */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mounted]);

  // ── DB sync helpers ───────────────────────────────────────────────────────
  const syncAddToDb = useCallback(async (item: CartItem) => {
    if (!userId) return;
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  }, [userId]);

  const syncRemoveFromDb = useCallback(async (productId: string) => {
    if (!userId) return;
    await fetch(`/api/cart?product_id=${encodeURIComponent(productId)}`, { method: "DELETE" });
  }, [userId]);

  const syncClearDb = useCallback(async () => {
    if (!userId) return;
    await fetch("/api/cart?clear=true", { method: "DELETE" });
  }, [userId]);

  // ── Cart actions ──────────────────────────────────────────────────────────
  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === newItem.product_id);
      let nextItems: CartItem[];
      if (existing) {
        nextItems = prev.map((i) =>
          i.product_id === newItem.product_id
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + 1) }
            : i
        );
      } else {
        nextItems = [...prev, { ...newItem, quantity: 1 }];
      }

      // Sync the updated item to DB asynchronously
      const updatedItem = nextItems.find((i) => i.product_id === newItem.product_id);
      if (updatedItem) {
        syncAddToDb(updatedItem);
      }

      return nextItems;
    });
  }, [syncAddToDb]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
    syncRemoveFromDb(productId);
  }, [syncRemoveFromDb]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      syncRemoveFromDb(productId);
      return;
    }
    const clampedQty = Math.min(MAX_QTY, quantity);
    setItems((prev) => {
      const next = prev.map((i) => (i.product_id === productId ? { ...i, quantity: clampedQty } : i));
      const updated = next.find((i) => i.product_id === productId);
      if (updated) syncAddToDb(updated);
      return next;
    });
  }, [syncRemoveFromDb, syncAddToDb]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
    syncClearDb();
  }, [syncClearDb]);

  // ── Apply promo code ──────────────────────────────────────────────────────
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
