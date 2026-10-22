"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Heart,
  Check,
  Truck,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import ProductGallery, { type GalleryImage } from "@/components/product/ProductGallery";
import { getProductWithImages } from "@/lib/supabase/data";
import { useProductRatings } from "@/lib/useProductRatings";

function contentItems(text: string | null | undefined) {
  if (!text) return [];

  const explicitItems = text
    .split(/\n+|•/)
    .map((item) => item.replace(/^[\-*]\s*/, "").trim())
    .filter(Boolean);

  if (explicitItems.length > 1) return explicitItems;

  return (explicitItems[0] ?? "")
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-3 font-body text-[14px] md:text-[15px] leading-[1.65] text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 mt-2.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface ProductInteractivePanelProps {
  initialProduct: Product;
  variants: Product[];
}

export default function ProductInteractivePanel({
  initialProduct,
  variants,
}: ProductInteractivePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { getRating } = useProductRatings();

  const [product, setProduct] = useState<Product>(initialProduct);
  const ratingData = getRating(product.id);
  const [quantity, setQuantity] = useState(1);

  // ── Delivery Pincode Estimator State ──────────────────────────────────────
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    status: "idle" | "valid" | "invalid";
    message?: string;
    subtext?: string;
  }>({ status: "idle" });

  // ── Gallery images — fetched from product_images table ────────────────────
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    initialProduct.images.map((url, i) => ({
      url,
      alt: `${initialProduct.name} — image ${i + 1}`,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    getProductWithImages(product.id)
      .then((result) => {
        if (cancelled || !result) return;
        if (result.product_images.length > 0) {
          setGalleryImages(
            result.product_images.map((img) => ({
              url: img.image_url,
              alt: img.alt_text ?? `${product.name} — image ${img.display_order + 1}`,
            }))
          );
        }
      })
      .catch(() => {
        // Non-fatal: fallback images already set in initial state
      });
    return () => {
      cancelled = true;
    };
  }, [product.id, product.name]);

  const handleVariantChange = (selectedVariant: Product) => {
    setProduct(selectedVariant);
    setGalleryImages(
      selectedVariant.images.map((url, i) => ({
        url,
        alt: `${selectedVariant.name} — image ${i + 1}`,
      }))
    );
    setQuantity(1);
    window.history.replaceState(null, "", `/products/${selectedVariant.slug}`);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cartImage = galleryImages[0]?.url || product.images[0] || "";
    for (let i = 0; i < quantity; i += 1) {
      addItem({
        product_id: product.id,
        name: product.name,
        variant_name: product.variant_name,
        price: product.price,
        image: cartImage,
        slug: product.slug,
      });
    }
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const cartImage = galleryImages[0]?.url || product.images[0] || "";
    for (let i = 0; i < quantity; i += 1) {
      addItem({
        product_id: product.id,
        name: product.name,
        variant_name: product.variant_name,
        price: product.price,
        image: cartImage,
        slug: product.slug,
      });
    }
    router.push("/checkout");
  };

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem(product);
    if (isWishlisted) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Saved to wishlist");
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeResult({
        status: "invalid",
        message: "Please enter a valid 6-digit Indian PIN code.",
      });
      return;
    }
    // Calculate 3-5 days delivery estimate
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const dateStr = d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    setPincodeResult({
      status: "valid",
      message: `Expected Delivery by ${dateStr}`,
      subtext: "Free shipping available on orders above ₹999",
    });
  };

  // Pricing & discount calculations
  const hasDiscount = Boolean(product.compare_price && product.compare_price > product.price);
  const savingsAmount = hasDiscount ? (product.compare_price! - product.price) : 0;
  const savingsPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const categoryLabel = product.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const descriptionItems = useMemo(() => contentItems(product.description), [product.description]);
  const benefitItems = descriptionItems.slice(0, 4);
  const ingredientItems = useMemo(() => contentItems(product.ingredients), [product.ingredients]);
  const usageItems = useMemo(() => contentItems(product.how_to_use), [product.how_to_use]);

  return (
    <>
      <section
        aria-label="Product details"
        className="w-full bg-white rounded-[24px] sm:rounded-[28px] md:rounded-[32px] border border-[#EFE8E2] shadow-[0_10px_36px_rgba(42,26,20,0.05),0_2px_8px_rgba(42,26,20,0.02)] p-4 sm:p-6 md:p-8 lg:p-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
          <motion.div
            className="lg:col-span-6 xl:col-span-6 w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="lg:sticky lg:top-[116px]">
              <ProductGallery
                images={galleryImages}
                badges={product.variant_name ? [product.variant_name] : []}
              />

              {benefitItems.length > 0 && (
                <section className="mt-5 rounded-2xl border border-[#EFE5DD] bg-[#FEFBF9] p-4 sm:p-5" aria-labelledby="product-benefits-heading">
                  <div className="flex items-center gap-2 mb-3.5">
                    <span className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center">
                      <Check size={14} strokeWidth={2.8} className="text-primary" />
                    </span>
                    <h2 id="product-benefits-heading" className="font-display text-[19px] leading-[1.2] text-on-surface">
                      Why You&apos;ll Love It
                    </h2>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                    {benefitItems.map((benefit, index) => (
                      <li key={`${benefit}-${index}`} className="flex items-start gap-2.5 font-body text-[12px] sm:text-[13px] leading-[1.5] text-on-surface-variant">
                        <Check size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6 xl:col-span-6 w-full flex flex-col pt-1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3F0] border border-[#ECDCD5] font-body text-[11px] font-semibold text-primary uppercase tracking-[0.06em]">
                  {categoryLabel}
                </span>

                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-body text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-body text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-300 text-rose-600 shadow-xs"
                    : "bg-[#FAF7F5] border-[#E8DEC8]/80 text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-white"
                }`}
              >
                <Heart
                  size={16}
                  strokeWidth={2}
                  className={isWishlisted ? "fill-current text-rose-600" : ""}
                />
              </button>
            </div>

            <h1 className="font-display text-[26px] sm:text-[32px] md:text-[38px] lg:text-[40px] leading-[1.18] text-on-surface font-bold tracking-tight mb-1.5">
              {product.name}
            </h1>

            {/* Authoritative product rating summary */}
            {ratingData && ratingData.total_reviews > 0 ? (
              <a
                href="#customer-reviews"
                className="inline-flex items-center gap-2 mb-3 group/rev cursor-pointer"
                aria-label={`Rated ${ratingData.average_rating} out of 5 based on ${ratingData.total_reviews} reviews`}
              >
                <div className="flex items-center text-[#D48B28] text-[13px] tracking-tight">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[15px]"
                      style={{
                        fontVariationSettings: `'FILL' ${i < Math.round(ratingData.average_rating) ? 1 : 0}`,
                        color: i < Math.round(ratingData.average_rating) ? "#D48B28" : "rgba(212,184,168,0.6)",
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="font-body text-[13px] font-bold text-on-surface">
                  {ratingData.average_rating.toFixed(1)}
                </span>
                <span className="font-body text-[12px] text-on-surface-variant/75 underline decoration-outline-variant/60 group-hover/rev:text-primary transition-colors">
                  ({ratingData.total_reviews} review{ratingData.total_reviews !== 1 ? "s" : ""})
                </span>
              </a>
            ) : (
              <a
                href="#customer-reviews"
                className="inline-flex items-center gap-1.5 mb-3 text-on-surface-variant/70 hover:text-primary transition-colors text-[12px] font-body"
              >
                <span className="material-symbols-outlined text-[15px] text-outline-variant">rate_review</span>
                <span>Be the first to review this product</span>
              </a>
            )}

            {product.variant_name && (
              <p className="font-body text-[14px] md:text-[15px] leading-[1.5] text-on-surface-variant/85 mb-4 pb-4 border-b border-[#F0EBE6]">
                {product.variant_name}
              </p>
            )}

            {/* Price Block with Savings */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-body text-[26px] sm:text-[30px] md:text-[32px] font-bold text-on-surface leading-tight tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="font-body text-[16px] md:text-[18px] text-on-surface-variant/50 line-through">
                      {formatPrice(product.compare_price!)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EBF5EA] border border-[#CCE7CA] font-body text-[12px] font-bold text-[#22672C]">
                      Save {formatPrice(savingsAmount)} ({savingsPercent}% off)
                    </span>
                  </>
                )}
              </div>
              <p className="font-body text-[11px] text-on-surface-variant/60 mt-1">
                (MRP inclusive of all taxes)
              </p>
            </div>

            {/* Variants Selector (Card-Style matching reference screenshot) */}
            {variants.length > 1 && (
              <div className="mb-6">
                <h3 className="font-body text-[12px] uppercase tracking-[0.08em] font-bold text-on-surface-variant mb-2.5">
                  Select Size / Pack:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {variants.map((v) => {
                    const isActive = v.id === product.id;
                    const vSavings =
                      v.compare_price && v.compare_price > v.price
                        ? v.compare_price - v.price
                        : 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantChange(v)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isActive
                            ? "bg-[#FCF8F5] border-primary shadow-xs ring-1 ring-primary/30"
                            : "bg-white border-[#EAE3DC] hover:border-primary/40 hover:bg-[#FAF7F5]"
                        }`}
                      >
                        <span className="font-body text-[13px] font-bold text-on-surface line-clamp-1">
                          {v.variant_name || "Standard Size"}
                        </span>
                        <div className="flex items-baseline justify-between w-full">
                          <span className="font-body text-[14px] font-semibold text-primary">
                            {formatPrice(v.price)}
                          </span>
                          {vSavings > 0 && (
                            <span className="font-body text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              Save ₹{vSavings}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector + Add to Cart + Buy Now Buttons */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-[#FAF7F5] border border-[#E8DEC8] rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Minus size={15} strokeWidth={2.4} />
                  </button>
                  <span className="w-9 text-center font-body text-[15px] font-bold text-on-surface select-none tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock}
                    aria-label="Increase quantity"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Plus size={15} strokeWidth={2.4} />
                  </button>
                </div>

                {/* Primary Add to Cart Button (Desktop & Tablet) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-primary hover:bg-[#9d4d6e] active:scale-[0.98] text-on-primary font-body text-[14px] md:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={17} strokeWidth={2.2} />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                </button>
              </div>

              {/* Buy Now (Instant Checkout) Button */}
              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2A1A14] hover:bg-[#3F281E] active:scale-[0.98] text-white font-body text-[14px] md:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <Zap size={16} strokeWidth={2.4} className="text-amber-400" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              )}
            </div>

            {/* Estimated delivery checker */}
            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E8DEC8]/80 mb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <Truck size={16} strokeWidth={2} className="text-primary" />
                <span className="font-body text-[12px] font-bold text-on-surface tracking-tight uppercase">
                  Estimated Delivery Date
                </span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 bg-white border border-[#E0D4C7] rounded-xl px-3.5 py-2 font-body text-[13px] text-on-surface placeholder:text-[#BBB] focus:outline-none focus:border-primary transition-colors tracking-wide"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8B3A5E] hover:bg-[#9d4d6e] text-white font-body text-[12px] font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeResult.status === "valid" && (
                <div className="mt-2.5 text-[12px] text-emerald-700 font-medium flex flex-col gap-0.5">
                  <p className="font-semibold flex items-center gap-1">
                    <Check size={13} strokeWidth={2.5} />
                    {pincodeResult.message}
                  </p>
                  {pincodeResult.subtext && (
                    <p className="text-[11px] text-on-surface-variant/70">
                      {pincodeResult.subtext}
                    </p>
                  )}
                </div>
              )}

              {pincodeResult.status === "invalid" && (
                <p className="mt-2 text-[12px] text-red-600 font-medium">
                  {pincodeResult.message}
                </p>
              )}

              <p className="mt-2 font-body text-[10px] text-on-surface-variant/50 text-right">
                Powered by Saaral Express Logistics
              </p>
            </div>

          </motion.div>
        </div>
      </section>

      {(product.description || product.ingredients || product.how_to_use) && (
        <section className="mt-10 md:mt-14 border-t border-[#E8DED7] pt-9 md:pt-12" aria-labelledby="product-information-heading">
          <div className="flex flex-col gap-2 mb-7 md:mb-9">
            <span className="font-body text-[11px] uppercase tracking-[0.16em] font-bold text-primary">The complete ritual</span>
            <h2 id="product-information-heading" className="font-display text-[28px] md:text-[34px] leading-[1.2] text-on-surface">
              Product Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {product.description && (
              <section className="md:col-span-2 bg-white rounded-2xl border border-[#EFE8E2] p-6 md:p-8 shadow-[0_4px_20px_rgba(42,26,20,0.03)]" aria-labelledby="ritual-description-heading">
                <h3 id="ritual-description-heading" className="font-display text-[23px] md:text-[26px] leading-[1.25] text-on-surface mb-4">Ritual Description</h3>
                <div className="max-w-4xl font-body text-[15px] md:text-[16px] leading-[1.75] text-on-surface-variant whitespace-pre-line">
                  {product.description}
                </div>
              </section>
            )}

            {ingredientItems.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#EFE8E2] p-6 md:p-8 shadow-[0_4px_20px_rgba(42,26,20,0.03)]" aria-labelledby="ingredients-heading">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[22px] text-primary">spa</span>
                  <h3 id="ingredients-heading" className="font-display text-[22px] md:text-[24px] leading-[1.3] text-on-surface">Ingredients</h3>
                </div>
                <BulletList items={ingredientItems} />
              </section>
            )}

            {usageItems.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#EFE8E2] p-6 md:p-8 shadow-[0_4px_20px_rgba(42,26,20,0.03)]" aria-labelledby="how-to-use-heading">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[22px] text-primary">clean_hands</span>
                  <h3 id="how-to-use-heading" className="font-display text-[22px] md:text-[24px] leading-[1.3] text-on-surface">How to Use</h3>
                </div>
                <ol className="space-y-3">
                  {usageItems.map((step, index) => (
                    <li key={`${step}-${index}`} className="flex items-start gap-3 font-body text-[14px] md:text-[15px] leading-[1.65] text-on-surface-variant">
                      <span className="flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary font-body text-[12px] font-bold">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="md:col-span-2 rounded-2xl border border-[#EFE5DD] bg-[#FEFBF9] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8" aria-label="Product specifications">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.12em] font-bold text-on-surface-variant">Category</p>
                <p className="font-body text-[14px] text-on-surface mt-1">{categoryLabel}</p>
              </div>
              {product.variant_name && (
                <div className="sm:border-l sm:border-[#E6D9D1] sm:pl-8">
                  <p className="font-body text-[10px] uppercase tracking-[0.12em] font-bold text-on-surface-variant">Size / Pack</p>
                  <p className="font-body text-[14px] text-on-surface mt-1">{product.variant_name}</p>
                </div>
              )}
              <div className="sm:border-l sm:border-[#E6D9D1] sm:pl-8">
                <p className="font-body text-[10px] uppercase tracking-[0.12em] font-bold text-on-surface-variant">Availability</p>
                <p className="font-body text-[14px] text-on-surface mt-1">{isOutOfStock ? "Currently out of stock" : "In stock"}</p>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* Mobile Floating Action Bar (Sticky at bottom on small screens) */}
      <div className="md:hidden fixed bottom-20 inset-x-0 z-40 px-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#EAE3DC] shadow-[0_8px_24px_rgba(42,26,20,0.18)] p-2.5 flex items-center gap-3">
          <div className="flex flex-col min-w-[90px] pl-1">
            <span className="font-body text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">Price</span>
            <span className="font-body text-[17px] leading-tight font-bold text-on-surface">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="font-body text-[9px] text-emerald-700 font-bold">
                Save {formatPrice(savingsAmount)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 h-11 rounded-xl bg-primary hover:bg-[#9d4d6e] text-white font-body text-[12px] uppercase tracking-[0.08em] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer shadow-xs disabled:opacity-50"
          >
            <ShoppingBag size={15} strokeWidth={2.4} />
            <span>{isOutOfStock ? "Out of Stock" : `Add ${quantity > 1 ? `(${quantity})` : ""} to Cart`}</span>
          </button>
        </div>
      </div>
    </>
  );
}
