"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import {
  X,
  Minus,
  Plus,
  Trash2,
  Tag,
  ChevronRight,
  IndianRupee,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
} from "lucide-react";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { getActiveProductIds, listProducts } from "@/lib/supabase/data";
import { MOCK_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 50;

// ─── Animation variants ───────────────────────────────────────────────────────
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      type: "spring" as const,
      stiffness: 280,
      damping: 26,
    },
  }),
  exit: { opacity: 0, x: -24, transition: { duration: 0.22 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Mobile pill-shaped quantity stepper */
function QuantityPill({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8] overflow-hidden">
      <motion.button
        whileTap={{ scale: 0.82 }}
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center text-[#444] hover:bg-[#e4e4e4] transition-colors duration-150 rounded-full"
        aria-label="Decrease quantity"
      >
        <Minus size={13} strokeWidth={2.5} />
      </motion.button>
      <span className="w-7 text-center font-body text-[13px] font-semibold text-on-surface select-none tabular-nums">
        {value}
      </span>
      <motion.button
        whileTap={{ scale: 0.82 }}
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center text-[#444] hover:bg-[#e4e4e4] transition-colors duration-150 rounded-full"
        aria-label="Increase quantity"
      >
        <Plus size={13} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

/** Desktop square quantity stepper (matches old design) */
function QuantityBox({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center border border-outline-variant rounded-lg p-1 bg-surface">
      <button
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-75 transition-all duration-150"
        aria-label="Decrease quantity"
      >
        <span className="material-symbols-outlined text-sm">remove</span>
      </button>
      <span className="w-8 text-center font-body text-[16px] leading-[1.6]">{value}</span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-75 transition-all duration-150"
        aria-label="Increase quantity"
      >
        <span className="material-symbols-outlined text-sm">add</span>
      </button>
    </div>
  );
}

/** Empty cart state */
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="flex flex-col items-center justify-center py-24 gap-6"
    >
      {/* Mobile version */}
      <div className="md:hidden flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center">
          <ShieldCheck size={32} strokeWidth={1.2} className="text-[#bbb]" />
        </div>
        <div className="space-y-1.5">
          <p className="font-display text-[19px] font-semibold text-on-surface tracking-tight">Your cart is empty</p>
          <p className="font-body text-[13px] text-on-surface-variant leading-relaxed max-w-[220px] mx-auto">
            Discover our natural skincare range and add your favourites.
          </p>
        </div>
        <Link
          href="/products"
          className="bg-primary text-on-primary font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium px-8 py-3 rounded-full hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200"
        >
          Shop Now
        </Link>
      </div>
      {/* Desktop version */}
      <div className="hidden md:flex flex-col items-center gap-6">
        <span className="material-symbols-outlined text-6xl text-outline-variant">shopping_bag</span>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant">Your cart is empty</p>
        <Link
          href="/products"
          className="bg-primary text-on-primary font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium px-8 py-3 rounded-full hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200"
        >
          Shop Now
        </Link>
      </div>
    </motion.div>
  );
}

/** Mobile coupon section */
function CouponSection() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (code.trim().length === 0) return;
    setApplied(true);
    toast.success("Coupon applied!");
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#ebebeb] p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-[#f7f7f7] border border-[#e8e8e8] rounded-[12px] px-3.5 py-2.5">
          <Tag size={15} strokeWidth={1.8} className="text-[#aaa] shrink-0" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Coupon Code"
            className="flex-1 bg-transparent font-body text-[13px] text-on-surface placeholder:text-[#bbb] outline-none font-medium tracking-wide"
          />
          {code.length > 0 && !applied && (
            <button onClick={() => setCode("")} className="text-[#ccc] hover:text-[#999] transition-colors" aria-label="Clear">
              <X size={14} />
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleApply}
          className={`px-4 py-2.5 rounded-[12px] font-body text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
            applied
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-[#1a1a1a] text-white hover:bg-[#333]"
          }`}
        >
          {applied ? "Applied" : "Apply"}
        </motion.button>
      </div>
      <div className="my-3 border-t border-dashed border-[#e8e8e8]" />
      <div className="flex items-center justify-between">
        <span className="font-body text-[12px] text-on-surface-variant/70">3 coupons available</span>
        <button className="flex items-center gap-1 font-body text-[12px] font-semibold text-on-surface hover:text-[#555] transition-colors">
          View Coupons
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/** Mobile recommended horizontal scroll */
function RecommendedSection({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-[20px] border border-[#ebebeb] overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-display text-[15px] font-semibold text-on-surface tracking-tight">You Might Also Like</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-4 pt-1">
        {products.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 240, damping: 22 }}
            className="flex-shrink-0 w-[130px] flex flex-col gap-2.5 bg-[#fafafa] border border-[#ebebeb] rounded-[16px] p-2.5"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] overflow-hidden bg-[#f0f0f0] relative">
              {rec.images?.[0] && (
                <Image src={rec.images[0]} alt={rec.name} fill className="object-cover" sizes="130px" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-[12px] font-medium text-on-surface leading-snug line-clamp-2">{rec.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-body text-[12px] font-bold text-primary">{formatPrice(rec.price)}</span>
                {rec.compare_price && (
                  <span className="font-body text-[10px] text-on-surface-variant/40 line-through">{formatPrice(rec.compare_price)}</span>
                )}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => onAdd(rec)}
              className="w-full py-1.5 rounded-full border border-primary/20 font-body text-[11px] font-semibold text-primary bg-white hover:bg-primary/5 transition-colors duration-150"
            >
              + Add
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Mobile trust badges */
function TrustBadges() {
  const badges = [
    { icon: <Truck size={14} strokeWidth={1.6} />, label: "Free above ₹999" },
    { icon: <RotateCcw size={14} strokeWidth={1.6} />, label: "Easy returns" },
    { icon: <ShieldCheck size={14} strokeWidth={1.6} />, label: "100% natural" },
  ];
  return (
    <div className="flex items-center justify-around py-3 px-4 bg-white rounded-[16px] border border-[#ebebeb]">
      {badges.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[#888]">{b.icon}</span>
          <span className="text-[10px] text-[#888] font-medium text-center leading-tight">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { items, total, updateQuantity, removeItem, addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const validatedRef = useRef(false);
  const isCheckoutDisabled = process.env.NEXT_PUBLIC_CHECKOUT_MODE === "disabled";

  const shippingCharge = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const grandTotal = total + shippingCharge;

  // Load all active products on mount to generate recommendations
  useEffect(() => {
    listProducts("all")
      .then((prods) => {
        if (prods && prods.length > 0) {
          setAllProducts(prods);
        } else {
          setAllProducts(MOCK_PRODUCTS);
        }
      })
      .catch((err) => {
        console.error("Failed to load products, falling back to mock data", err);
        setAllProducts(MOCK_PRODUCTS);
      });
  }, []);

  // On mount: validate all cart items against Supabase.
  // Auto-remove any that have been deactivated or deleted.
  useEffect(() => {
    if (validatedRef.current || items.length === 0) return;
    validatedRef.current = true;
    const productIds = items.map((i) => i.product_id);
    getActiveProductIds(productIds)
      .then((activeIds) => {
        items.forEach((item) => {
          if (!activeIds.has(item.product_id)) {
            removeItem(item.product_id);
            toast.error(`"${item.name}" is no longer available and was removed from your cart.`, { duration: 5000 });
          }
        });
      })
      .catch(() => {
        // Silently ignore network errors — don't block the cart page
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const handleAddRecommended = (product: Product) => {
    addItem({
      product_id: product.id,
      name: product.name,
      variant_name: product.variant_name,
      price: product.price,
      image: product.images?.[0] || "",
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  const recommendations = (() => {
    if (allProducts.length === 0) return [];

    const cartProductIds = new Set(items.map((i) => i.product_id));
    const cartCategories = new Set<string>();

    // Extract categories of products currently in the cart
    items.forEach((item) => {
      const prod = allProducts.find((p) => p.id === item.product_id || p.slug === item.slug);
      if (prod && prod.category) {
        cartCategories.add(prod.category);
      }
    });

    // Filter out products already in the cart and inactive ones
    const candidates = allProducts.filter((p) => !cartProductIds.has(p.id) && p.is_active !== false);

    // Group: similar products first (matching any category in cart, e.g. face-cream)
    const similarProducts = candidates.filter((p) => cartCategories.has(p.category));
    const otherProducts = candidates.filter((p) => !cartCategories.has(p.category));

    // Combine them: similar products first, then others to fill up the list
    const combined = [...similarProducts, ...otherProducts];

    // Limit to 4 recommendations
    return combined.slice(0, 4);
  })();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* GradientBackground only on desktop */}
      <div className="hidden md:block">
        <GradientBackground />
      </div>
      {/* Mobile plain bg */}
      <div className="md:hidden fixed inset-0 bg-[#f5f5f5] -z-10" />

      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto">

        {/* ══════════════════════════════════════════════════════
            MOBILE LAYOUT  (hidden on md+)
        ══════════════════════════════════════════════════════ */}
        <div className="md:hidden">
          {/* Sticky compact header bar */}
          <div className="bg-white border-b border-[#ebebeb] sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[17px] font-semibold text-on-surface tracking-tight">Your Cart</h1>
              {items.length > 0 && (
                <span className="font-body text-[12px] text-on-surface-variant/70 font-medium">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              )}
            </div>
            <Link
              href="/products"
              aria-label="Continue shopping"
              className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
            >
              <X size={16} strokeWidth={2} className="text-[#444]" />
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-6">
              <EmptyCart />
            </div>
          ) : (
            <>
              {/* Scrollable content */}
              <div className="px-3 pt-3 pb-52 flex flex-col gap-3">
                {/* Cart cards */}
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
                  <AnimatePresence>
                    {items.map((item, i) => {
                      const itemTotal = item.price * item.quantity;
                      return (
                        <motion.div
                          key={item.product_id}
                          custom={i}
                          variants={cardVariants}
                          layout
                          exit="exit"
                          className="bg-white rounded-[20px] border border-[#ebebeb] p-3.5 flex gap-3"
                        >
                          {/* Image */}
                          <div className="relative w-[84px] h-[100px] rounded-[14px] bg-[#f5f5f5] overflow-hidden shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="84px" />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <p className="font-display text-[14px] font-semibold text-on-surface leading-snug line-clamp-2 tracking-tight">
                              {item.name}
                            </p>
                            {item.variant_name && (
                              <span className="font-body inline-block self-start px-2.5 py-0.5 rounded-full bg-[#f5f5f5] border border-[#e8e8e8] text-[10px] text-[#777] font-medium">
                                {item.variant_name}
                              </span>
                            )}
                            <div className="mt-auto">
                              <QuantityPill
                                value={item.quantity}
                                onDecrement={() => updateQuantity(item.product_id, item.quantity - 1)}
                                // eslint-disable-next-line react-hooks/exhaustive-deps
                                onIncrement={() => updateQuantity(item.product_id, item.quantity + 1)}
                              />
                            </div>
                          </div>
                          {/* Price + delete */}
                          <div className="flex flex-col items-end justify-between shrink-0">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => removeItem(item.product_id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center bg-[#f5f5f5] hover:bg-red-50 text-[#bbb] hover:text-red-400 transition-colors duration-200"
                              aria-label="Remove item"
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </motion.button>
                            <div className="text-right">
                              <p className="font-body text-[16px] font-bold text-on-surface leading-tight">{formatPrice(itemTotal)}</p>
                              {item.quantity > 1 && (
                                <p className="font-body text-[10px] text-on-surface-variant/50 mt-0.5">{formatPrice(item.price)} each</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>

                <TrustBadges />

                {/* Free shipping nudge */}
                {amountNeeded > 0 ? (
                  <div className="bg-white rounded-[20px] border border-[#ebebeb] px-4 py-3.5 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Truck size={14} strokeWidth={1.8} className="text-[#888]" />
                      <p className="font-body text-[12px] text-on-surface-variant">
                        Add{" "}
                        <span className="font-semibold text-on-surface">{formatPrice(amountNeeded)}</span>{" "}
                        more for{" "}
                        <span className="font-semibold text-emerald-600">Free Shipping</span>{" "}
                        across India
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#1a1a1a] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${freeShippingProgress}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-[20px] border border-emerald-200/70 px-4 py-3 flex items-center gap-2.5">
                    <Truck size={15} strokeWidth={1.8} className="text-emerald-600 shrink-0" />
                    <p className="font-body text-[12px] font-medium text-emerald-700">Free Shipping unlocked for your order!</p>
                  </div>
                )}

                <CouponSection />
                <RecommendedSection products={recommendations} onAdd={handleAddRecommended} />
              </div>

              {/* Sticky mobile footer */}
              <div className="fixed bottom-[64px] inset-x-0 z-40">
                <div className="bg-white border-t border-[#ebebeb] rounded-t-[24px] shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.08)] px-4 pt-4 pb-5 space-y-3">
                  {/* Total row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                        <IndianRupee size={14} strokeWidth={2} className="text-[#555]" />
                      </div>
                      <div>
                        <p className="font-body text-[12px] text-on-surface-variant leading-none">Estimated Total</p>
                        <p className="font-body text-[10px] text-on-surface-variant/50 mt-0.5">(MRP inclusive of taxes)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-[21px] font-bold text-on-surface leading-none tracking-tight">
                        {formatPrice(grandTotal)}
                      </p>
                      {shippingCharge === 0 && (
                        <p className="font-body text-[10px] text-emerald-600 font-medium mt-0.5">+ Free Shipping</p>
                      )}
                      {shippingCharge > 0 && (
                        <p className="font-body text-[10px] text-on-surface-variant/40 mt-0.5">+ {formatPrice(shippingCharge)} shipping</p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  {isCheckoutDisabled ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 bg-[#f9f9f9] border border-[#ebebeb] rounded-[14px] p-3">
                        <ShieldCheck size={16} strokeWidth={1.8} className="text-[#aaa] mt-0.5 shrink-0" />
                        <p className="font-body text-[12px] text-[#888] leading-relaxed">
                          Online checkout is temporarily paused while we integrate our secure payment gateway.
                        </p>
                      </div>
                      <div className="w-full py-4 bg-[#e8e8e8] text-[#aaa] font-body text-[13px] font-semibold rounded-[14px] flex items-center justify-center cursor-not-allowed">
                        Checkout Unavailable
                      </div>
                    </div>
                  ) : (
                    <>
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/checkout"
                          className="group w-full py-4 bg-primary text-on-primary font-body text-[13px] font-semibold rounded-[14px] grid grid-cols-[1fr_auto_1fr] items-center px-4 hover:bg-[#9d4d6e] active:bg-[#8a3a5e] active:scale-[0.98] transition-all duration-200 shadow-sm"
                        >
                          <span />
                          <span className="text-center">Proceed to Checkout</span>
                          <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-75 transition-opacity">
                            <ShieldCheck size={13} strokeWidth={2} />
                            <span className="font-body text-[10px] font-normal">Secure</span>
                          </div>
                        </Link>
                      </motion.div>
                      <p className="font-body text-center text-[11px] text-on-surface-variant/40 font-medium">
                        Continue Shopping —{" "}
                        <Link href="/products" className="text-on-surface-variant underline underline-offset-2 hover:text-[#555] transition-colors">
                          browse products
                        </Link>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            DESKTOP LAYOUT  (hidden on mobile, shown on md+)
            — Original design restored exactly —
        ══════════════════════════════════════════════════════ */}
        <div className="hidden md:block px-[var(--spacing-margin-desktop)] py-10 md:py-[var(--spacing-stack-lg)]">
          {/* Page heading */}
          <div className="mb-[var(--spacing-stack-lg)] flex flex-col md:flex-row justify-between items-start md:items-end gap-[var(--spacing-stack-sm)]">
            <motion.h1
              className="font-display text-[32px] md:text-[48px] leading-[1.2] text-on-surface"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Your Cart
            </motion.h1>
            <Link
              href="/products"
              className="font-body text-[16px] leading-[1.6] text-on-surface-variant hover:text-on-surface underline underline-offset-4 decoration-outline-variant hover:decoration-on-surface transition-all duration-200"
            >
              Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-stack-lg)] items-start">

              {/* ── Items list ──────────────────────────────────── */}
              <div className="lg:col-span-8 flex flex-col gap-[var(--spacing-stack-md)]">
                {/* Column headers */}
                <div className="hidden md:grid grid-cols-12 gap-[var(--spacing-gutter)] pb-[var(--spacing-stack-sm)] border-b border-outline-variant/30 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>

                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product_id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="py-3 border-b border-outline-variant/30"
                    >
                      {/* Desktop row */}
                      <div className="grid grid-cols-12 gap-[var(--spacing-gutter)] items-center">
                        {/* Product info */}
                        <div className="col-span-6 flex gap-[var(--spacing-gutter)] items-center">
                          <div className="w-24 h-32 flex-shrink-0 bg-surface-container-low rounded-lg overflow-hidden relative">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <h3 className="font-display text-[24px] leading-[1.4] text-on-surface">{item.name}</h3>
                            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">{item.variant_name}</p>
                          </div>
                        </div>
                        {/* Qty */}
                        <div className="col-span-3 flex items-center justify-center">
                          <QuantityBox
                            value={item.quantity}
                            onDecrement={() => updateQuantity(item.product_id, item.quantity - 1)}
                            onIncrement={() => updateQuantity(item.product_id, item.quantity + 1)}
                          />
                        </div>
                        {/* Total */}
                        <div className="col-span-2 text-right font-body text-[18px] leading-[1.6] text-on-surface">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {/* Remove */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="text-outline hover:text-error active:scale-75 transition-all duration-150 p-2"
                            aria-label="Remove item"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Dynamic similar products recommendation on desktop */}
                <div className="mt-8">
                  <RecommendedSection products={recommendations} onAdd={handleAddRecommended} />
                </div>
              </div>

              {/* ── Order Summary sidebar ───────────────────────── */}
              <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-6 md:p-[var(--spacing-stack-md)] ambient-shadow-sm border border-outline-variant/20 lg:sticky lg:top-32">
                <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-md)] pb-[var(--spacing-stack-sm)] border-b border-outline-variant/30">
                  Order Summary
                </h2>

                <div className="flex flex-col gap-[var(--spacing-stack-sm)] font-body text-[16px] leading-[1.6] text-on-surface-variant mb-[var(--spacing-stack-md)]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-on-surface">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCharge === 0 ? "text-emerald-600 font-medium" : "text-on-surface"}>
                      {shippingCharge === 0 ? "Free" : formatPrice(shippingCharge)}
                    </span>
                  </div>

                  {/* Free shipping nudge */}
                  {amountNeeded > 0 ? (
                    <div className="mt-1 p-3 rounded-xl bg-primary/5 border border-primary/15">
                      <p className="font-body text-[12px] leading-[1.5] text-on-surface-variant mb-2">
                        Add <span className="font-semibold text-primary">{formatPrice(amountNeeded)}</span> more for
                        <span className="font-semibold text-primary"> Free Shipping</span> all over India
                      </p>
                      <div className="w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${freeShippingProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                      <p className="font-body text-[12px] leading-[1.5] text-emerald-700">
                        You have unlocked <span className="font-semibold">Free Shipping</span> all over India!
                      </p>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex flex-col gap-1 py-[var(--spacing-stack-sm)] border-t border-outline-variant/30 mb-[var(--spacing-stack-lg)]">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-[18px] leading-[1.6] text-on-surface">Estimated Total</span>
                    <span className="font-body text-[22px] md:text-[24px] leading-[1.4] text-on-surface font-semibold">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  <p className="font-body text-[10px] leading-[1] text-on-surface-variant/60 text-right">
                    (MRP inclusive of taxes)
                  </p>
                </div>

                {/* Checkout CTA */}
                {isCheckoutDisabled ? (
                  <>
                    <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 items-start">
                      <span className="material-symbols-outlined text-[20px] text-primary mt-0.5 animate-pulse">info</span>
                      <p className="font-body text-[13px] leading-[1.6] text-on-surface-variant text-left">
                        Online checkout is temporarily paused as we integrate our secure payment gateway. We will be live soon!
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="w-full py-4 bg-outline-variant/30 text-on-surface-variant/50 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium rounded-lg cursor-not-allowed flex justify-center items-center gap-2 border border-outline-variant/20"
                    >
                      Checkout Disabled
                    </button>
                  </>
                ) : (
                  <Link
                    href="/checkout"
                    className="w-full py-4 bg-primary text-on-primary font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium rounded-lg hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200 flex justify-center items-center gap-2"
                  >
                    Proceed to Checkout
                  </Link>
                )}

                <div className="mt-[var(--spacing-stack-sm)] text-center">
                  <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant flex items-center justify-center gap-2">
                    <Lock size={14} strokeWidth={1.8} />
                    Secure Encrypted Checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
