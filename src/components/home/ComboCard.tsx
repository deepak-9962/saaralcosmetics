"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import type { ComboWithProducts } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ComboCardProps {
  combo: ComboWithProducts;
  index?: number;
}

export default function ComboCard({ combo, index = 0 }: ComboCardProps) {
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isSoldOut = !combo.isAvailable;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    addItem({
      product_id: combo.id,
      name: combo.name,
      variant_name: "Combo Pack",
      price: combo.price,
      image: combo.image_url,
      slug: combo.slug,
      is_combo: true,
    });
    toast.success(`${combo.name} added to cart!`);
  };

  const discountPercent =
    combo.compare_price && combo.compare_price > combo.price
      ? Math.round((1 - combo.price / combo.compare_price) * 100)
      : null;

  return (
    <>
      <article
        className="flex flex-col group cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setQuickViewOpen(true)}
      >
        {/* ── Image Container ── */}
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-2.5 block"
          style={{
            background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)",
            boxShadow: isHovered
              ? "0 20px 48px -10px rgba(176,96,128,0.22), 0 6px 16px -6px rgba(42,26,20,0.08)"
              : "0 4px 16px -4px rgba(176,96,128,0.08), 0 1px 4px rgba(42,26,20,0.04)",
            transition: "box-shadow 0.35s ease",
          }}
          aria-label={`View combo ${combo.name}`}
        >
          {/* Main Combo Image */}
          <Image
            src={combo.image_url}
            alt={combo.name}
            fill
            sizes="(max-width: 768px) 60vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            unoptimized={combo.image_url.startsWith("http")}
          />

          {/* Soft bottom vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 115%, rgba(42,26,20,0.18) 0%, transparent 65%)",
            }}
          />

          {/* Badge: top left */}
          {combo.badge && !isSoldOut && (
            <div className="absolute top-2.5 left-2.5 z-[2] flex flex-col gap-1 pointer-events-none">
              <span
                className="px-2.5 py-0.5 rounded-full font-body text-[9px] tracking-[0.10em] font-bold uppercase shadow-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(176,96,128,0.95), rgba(138,64,96,0.95))",
                  color: "#fff",
                  backdropFilter: "blur(6px)",
                }}
              >
                {combo.badge}
              </span>
            </div>
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div
              className="absolute inset-0 flex items-center justify-center z-[4]"
              style={{ background: "rgba(26,14,10,0.42)", backdropFilter: "blur(2px)" }}
            >
              <span
                className="font-body text-[11px] md:text-[13px] tracking-[0.14em] uppercase font-bold px-4 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,252,247,0.95)",
                  color: "#1A0E0A",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                }}
              >
                Sold Out
              </span>
            </div>
          )}

          {/* Quick view button — desktop hover */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="hidden md:flex absolute top-2.5 right-2.5 z-[3] w-8 h-8 rounded-full items-center justify-center transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
            style={{
              background: "rgba(255,250,247,0.90)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 10px rgba(42,26,20,0.14)",
              border: "1px solid rgba(201,167,77,0.2)",
            }}
            aria-label={`Quick view ${combo.name}`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ color: "#8A6A5A" }}>
              visibility
            </span>
          </button>
        </div>

        {/* ── Card Info ── */}
        <div className="flex flex-col flex-grow px-0.5">
          {/* Eyebrow: Combo item count */}
          <p
            className="font-body text-[9.5px] tracking-[0.12em] uppercase mb-1 font-semibold"
            style={{ color: "#B06080" }}
          >
            COMBO PACK ({combo.items.length} PRODUCTS)
          </p>

          {/* Combo name */}
          <h3
            className="font-display leading-tight mb-1.5 transition-colors duration-200 line-clamp-1"
            style={{
              fontSize: "clamp(16px, 1.6vw, 20px)",
              fontWeight: 600,
              color: isHovered ? "#8A3A60" : "#2A1A14",
              letterSpacing: "-0.01em",
            }}
          >
            {combo.name}
          </h3>

          {/* Included products summary */}
          <p className="font-body text-[11px] text-on-surface-variant/70 leading-snug line-clamp-1 mb-2">
            Includes: {combo.items.map((it) => it.product?.name ?? "Product").join(" + ")}
          </p>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Price row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="font-body"
              style={{
                fontSize: "clamp(15px, 1.4vw, 17px)",
                fontWeight: 700,
                color: isSoldOut ? "rgba(42,26,20,0.35)" : "#8B3A5E",
                letterSpacing: "-0.01em",
              }}
            >
              {formatPrice(combo.price)}
            </span>
            {combo.compare_price && (
              <span
                className="font-body text-[11px] line-through"
                style={{ color: "rgba(138,106,90,0.45)" }}
              >
                {formatPrice(combo.compare_price)}
              </span>
            )}
            {discountPercent && (
              <span
                className="font-body text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: "rgba(176,96,128,0.1)",
                  color: "#B06080",
                }}
              >
                {discountPercent}% off
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-body text-[10px] tracking-[0.10em] font-semibold uppercase transition-all duration-200 active:scale-[0.97]"
            style={{
              background: isSoldOut
                ? "rgba(42,26,20,0.10)"
                : "linear-gradient(135deg, #B06080, #8A4060)",
              color: isSoldOut ? "rgba(42,26,20,0.35)" : "#fff",
              boxShadow: isSoldOut ? "none" : "0 2px 8px rgba(176,96,128,0.25)",
              cursor: isSoldOut ? "not-allowed" : "pointer",
            }}
            aria-label={isSoldOut ? `${combo.name} is sold out` : `Add ${combo.name} to cart`}
          >
            {isSoldOut ? (
              "Sold Out"
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shopping_bag
                </span>
                Add Combo to Cart
              </>
            )}
          </button>
        </div>
      </article>

      {/* ── Quick View Modal ── */}
      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
            style={{ background: "rgba(42,26,20,0.6)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewOpen(false)}
          >
            <motion.div
              className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "#FDF6F0",
                border: "1px solid rgba(201,167,77,0.25)",
                boxShadow: "0 40px 100px rgba(42,26,20,0.3)",
              }}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view — ${combo.name}`}
            >
              {/* Image panel */}
              <div
                className="relative aspect-[4/5] md:aspect-auto min-h-[300px]"
                style={{ background: "linear-gradient(145deg, #F4E4DA, #EDD5C8)" }}
              >
                <Image
                  src={combo.image_url}
                  alt={combo.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized={combo.image_url.startsWith("http")}
                />
                {isSoldOut && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-[2]"
                    style={{ background: "rgba(26,14,10,0.4)" }}
                  >
                    <span
                      className="font-body text-[13px] tracking-[0.14em] uppercase font-bold px-5 py-2 rounded-full"
                      style={{ background: "rgba(255,252,247,0.95)", color: "#1A0E0A" }}
                    >
                      Sold Out
                    </span>
                  </div>
                )}
                {combo.badge && !isSoldOut && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full font-body text-[10px] tracking-[0.12em] font-semibold uppercase bg-primary text-white shadow-md">
                    {combo.badge}
                  </div>
                )}
              </div>

              {/* Content panel */}
              <div className="p-6 md:p-8 flex flex-col">
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setQuickViewOpen(false)}
                  className="self-end w-8 h-8 rounded-full flex items-center justify-center mb-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                {/* Eyebrow */}
                <p className="font-body text-[10px] tracking-[0.16em] uppercase mb-2 font-semibold text-[#C9A74D]">
                  Curated Ritual Combo
                </p>

                {/* Name */}
                <h3
                  className="font-display text-[#2A1A14] mb-3 leading-snug"
                  style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700 }}
                >
                  {combo.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span
                    className="font-body text-[22px] font-bold"
                    style={{ color: isSoldOut ? "rgba(42,26,20,0.35)" : "#B06080" }}
                  >
                    {formatPrice(combo.price)}
                  </span>
                  {combo.compare_price && (
                    <>
                      <span className="font-body text-[14px] line-through text-on-surface-variant/50">
                        {formatPrice(combo.compare_price)}
                      </span>
                      {discountPercent && (
                        <span className="font-body text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                          {discountPercent}% off
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Description */}
                {combo.description && (
                  <p className="font-body text-[13px] leading-relaxed text-[#5A3A2C]/80 mb-5">
                    {combo.description}
                  </p>
                )}

                {/* Included Products List */}
                <div className="mb-6 space-y-2">
                  <p className="font-body text-[11px] font-bold tracking-wider uppercase text-on-surface-variant">
                    Included Products ({combo.items.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {combo.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white/70 border border-outline-variant/30"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                          {it.product?.images?.[0] && (
                            <Image
                              src={it.product.images[0]}
                              alt={it.product?.name || "Product"}
                              fill
                              className="object-cover"
                              unoptimized={it.product.images[0].startsWith("http")}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-[12px] font-semibold text-on-surface truncate">
                            {it.product?.name || "Product"}
                          </p>
                          <p className="font-body text-[10px] text-on-surface-variant">
                            Qty: {it.quantity} · {it.product?.category || "Special"}
                          </p>
                        </div>
                        {it.product && it.product.stock <= 0 && (
                          <span className="text-[10px] font-bold text-red-500 uppercase">
                            Out of stock
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  {!isSoldOut ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        handleAddToCart(e);
                        setQuickViewOpen(false);
                      }}
                      className="w-full py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #B06080, #8A4060)",
                        color: "#fff",
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        shopping_bag
                      </span>
                      Add Combo to Cart
                    </button>
                  ) : (
                    <div className="w-full py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-semibold text-center bg-black/10 text-on-surface/40">
                      Combo Currently Unavailable
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
