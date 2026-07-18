"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
  index?: number;
  showBadge?: string;
  /** Extra badge shown stacked below showBadge (e.g. "HERBAL") */
  showSubBadge?: string;
  imageAspectClassName?: string;
}

export default function ProductCard({
  product,
  index = 0,
  showBadge,
  showSubBadge,
  imageAspectClassName = "aspect-square",
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const isSoldOut = product.stock === 0;

  const addProduct = () => {
    if (isSoldOut) return;
    addItem({
      product_id: product.id,
      name: product.name,
      variant_name: product.variant_name,
      price: product.price,
      image: product.images[0] || "",
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct();
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willBeWishlisted = !isWishlisted;
    toggleItem(product);
    toast.success(
      willBeWishlisted
        ? `${product.name} added to wishlist`
        : `${product.name} removed from wishlist`,
    );
  };

  const categoryLabel = product.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <>
      <article
        className="flex flex-col group cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Image Container ── */}
        <Link
          href={`/products/${product.slug}`}
          className={`relative ${imageAspectClassName} rounded-xl overflow-hidden mb-2.5 block`}
          style={{
            background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)",
            boxShadow: isHovered
              ? "0 20px 52px -10px rgba(176,96,128,0.24), 0 6px 18px -6px rgba(42,26,20,0.08)"
              : "0 4px 16px -4px rgba(176,96,128,0.10), 0 1px 4px rgba(42,26,20,0.04)",
            transition: "box-shadow 0.45s cubic-bezier(0.22,1,0.36,1)",
          }}
          aria-label={`View ${product.name}`}
        >
          {/* Product Image — uses ProductImage for skeleton + fallback */}
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            imageStyle={{
              transform: isHovered && !isSoldOut ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
            }}
          />

          {/* Bottom vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 115%, rgba(42,26,20,0.14) 0%, transparent 65%)",
              opacity: isHovered ? 0.8 : 0.4,
              transition: "opacity 0.4s ease",
            }}
          />

          {/* SOLD OUT overlay */}
          {isSoldOut && (
            <div
              className="absolute inset-0 flex items-center justify-center z-[4]"
              style={{ background: "rgba(26,14,10,0.38)", backdropFilter: "blur(1px)" }}
            >
              <span
                className="font-body text-[11px] md:text-[13px] tracking-[0.14em] uppercase font-bold px-4 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,252,247,0.94)",
                  color: "#1A0E0A",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                }}
              >
                Sold Out
              </span>
            </div>
          )}

          {/* Badge(s) — top left */}
          {showBadge && !isSoldOut && (
            <div className="absolute top-2.5 left-2.5 z-[2] flex flex-col gap-1 pointer-events-none">
              <span
                className="px-2 py-0.5 rounded-full font-body text-[9px] tracking-[0.10em] font-semibold uppercase"
                style={{
                  background:
                    showBadge === "New" || showBadge === "New Arrival"
                      ? "linear-gradient(135deg, rgba(176,96,128,0.92), rgba(138,64,96,0.92))"
                      : "linear-gradient(135deg, rgba(42,26,20,0.88), rgba(42,26,20,0.78))",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              >
                {showBadge}
              </span>
              {showSubBadge && (
                <span
                  className="px-2 py-0.5 rounded-full font-body text-[9px] tracking-[0.10em] font-semibold uppercase"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(74,124,89,0.90), rgba(50,100,65,0.90))",
                    color: "#fff",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {showSubBadge}
                </span>
              )}
            </div>
          )}

          {/* Wishlist button — top right */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 z-[3] w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isWishlisted
                ? "opacity-100"
                : "opacity-100 md:opacity-0 md:translate-y-1.5 md:group-hover:opacity-100 md:group-hover:translate-y-0"
            }`}
            style={{
              background: isWishlisted ? "rgba(176,96,128,0.95)" : "rgba(255,250,247,0.90)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 10px rgba(42,26,20,0.14)",
              border: isWishlisted
                ? "1px solid rgba(255,255,255,0.22)"
                : "1px solid rgba(201,167,77,0.18)",
            }}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{
                color: isWishlisted ? "#fff" : "#B06080",
                fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}`,
              }}
            >
              favorite
            </span>
          </button>

          {/* Quick view — desktop hover */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="hidden md:flex absolute top-2.5 right-[44px] z-[3] w-8 h-8 rounded-full items-center justify-center transition-all duration-300 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
            style={{
              background: "rgba(255,250,247,0.90)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 10px rgba(42,26,20,0.14)",
              border: "1px solid rgba(201,167,77,0.18)",
            }}
            aria-label={`Quick view ${product.name}`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ color: "#8A6A5A" }}>
              visibility
            </span>
          </button>
        </Link>

        {/* ── Card Info ── */}
        <div className="flex flex-col flex-grow px-0.5">
          <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow">
            {/* Category tag */}
            <p
              className="font-body text-[9.5px] tracking-[0.12em] uppercase mb-1 transition-colors duration-300"
              style={{ color: isHovered ? "#B06080" : "rgba(138,106,90,0.65)" }}
            >
              {categoryLabel}
              {product.variant_name ? ` · ${product.variant_name}` : ""}
            </p>

            {/* Product name */}
            <h3
              className="font-display leading-tight mb-2 transition-colors duration-300"
              style={{
                fontSize: "clamp(17px, 1.7vw, 22px)",
                fontWeight: 600,
                color: isHovered ? "#8A3A60" : "#2A1A14",
                letterSpacing: "-0.01em",
              }}
            >
              {product.name}
            </h3>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Price row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="font-body"
                style={{
                  fontSize: "clamp(14px, 1.3vw, 16px)",
                  fontWeight: 600,
                  color: isSoldOut ? "rgba(42,26,20,0.35)" : "#8B3A5E",
                  letterSpacing: "-0.01em",
                }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span
                  className="font-body text-[11px] line-through"
                  style={{ color: "rgba(138,106,90,0.40)" }}
                >
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {product.compare_price && (
                <span
                  className="font-body text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(176,96,128,0.08)",
                    color: "#B06080",
                  }}
                >
                  {Math.round((1 - product.price / product.compare_price) * 100)}% off
                </span>
              )}
            </div>

            {/* Always-visible Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-body text-[10px] tracking-[0.10em] font-semibold uppercase transition-all duration-200 active:scale-[0.97]"
              style={{
                background: isSoldOut
                  ? "rgba(42,26,20,0.10)"
                  : "linear-gradient(135deg, #B06080, #8A4060)",
                color: isSoldOut ? "rgba(42,26,20,0.35)" : "#fff",
                boxShadow: isSoldOut ? "none" : "0 2px 8px rgba(176,96,128,0.30)",
                cursor: isSoldOut ? "not-allowed" : "pointer",
              }}
              aria-label={
                isSoldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`
              }
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
                  Add to Cart
                </>
              )}
            </button>
          </Link>
        </div>
      </article>

      {/* ── Quick View Modal ── */}
      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{ background: "rgba(42,26,20,0.55)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewOpen(false)}
          >
            <motion.div
              className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "#FDF6F0",
                border: "1px solid rgba(201,167,77,0.2)",
                boxShadow: "0 40px 100px rgba(42,26,20,0.25)",
              }}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view — ${product.name}`}
            >
              {/* Image panel */}
              <div
                className="relative aspect-[4/5] md:aspect-auto min-h-[320px]"
                style={{ background: "linear-gradient(145deg, #F4E4DA, #EDD5C8)" }}
              >
                {product.images[0] && (
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="absolute inset-0 w-full h-full"
                  />
                )}
                {isSoldOut && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-[2]"
                    style={{ background: "rgba(26,14,10,0.35)" }}
                  >
                    <span
                      className="font-body text-[13px] tracking-[0.14em] uppercase font-bold px-5 py-2 rounded-full"
                      style={{ background: "rgba(255,252,247,0.94)", color: "#1A0E0A" }}
                    >
                      Sold Out
                    </span>
                  </div>
                )}
                {showBadge && !isSoldOut && (
                  <div
                    className="absolute top-4 left-4 px-3 py-1 rounded-full font-body text-[10px] tracking-[0.12em] font-semibold uppercase"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(176,96,128,0.92), rgba(138,64,96,0.92))",
                      color: "#fff",
                    }}
                  >
                    {showBadge}
                  </div>
                )}
              </div>

              {/* Content panel */}
              <div className="p-7 md:p-9 flex flex-col">
                {/* Close */}
                <button
                  type="button"
                  onClick={() => setQuickViewOpen(false)}
                  className="self-end w-9 h-9 rounded-full flex items-center justify-center mb-4 transition-colors duration-200"
                  style={{ color: "#8A6A5A", border: "1px solid rgba(138,106,90,0.2)" }}
                  aria-label="Close quick view"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* Category */}
                <p
                  className="font-body text-[10px] tracking-[0.16em] uppercase mb-3"
                  style={{ color: "#C9A74D" }}
                >
                  {categoryLabel}
                  {product.variant_name ? ` · ${product.variant_name}` : ""}
                </p>

                {/* Name */}
                <h3
                  className="font-display text-[#2A1A14] mb-4"
                  style={{
                    fontSize: "clamp(26px, 3.5vw, 36px)",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="font-body text-[22px] md:text-[26px]"
                      style={{ fontWeight: 600, color: isSoldOut ? "rgba(42,26,20,0.35)" : "#B06080" }}
                    >
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <>
                        <span
                          className="font-body text-[15px] line-through"
                          style={{ color: "rgba(138,106,90,0.45)" }}
                        >
                          {formatPrice(product.compare_price)}
                        </span>
                        <span
                          className="font-body text-[11px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(176,96,128,0.1)", color: "#B06080" }}
                        >
                          {Math.round(
                            (1 - product.price / product.compare_price) * 100,
                          )}
                          % off
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <p
                    className="font-body text-[14px] leading-relaxed mb-6"
                    style={{ color: "rgba(90,58,44,0.7)" }}
                  >
                    {product.description}
                  </p>
                )}

                {/* Ingredients teaser */}
                {product.ingredients && (
                  <div
                    className="mb-6 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(201,167,77,0.08)",
                      border: "1px solid rgba(201,167,77,0.15)",
                    }}
                  >
                    <p className="font-body text-[10px] tracking-[0.12em] uppercase text-[#8A6A00] mb-1.5">
                      Key Ingredients
                    </p>
                    <p className="font-body text-[13px] leading-relaxed text-[#5A3A2C]/70 line-clamp-2">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  {!isSoldOut ? (
                    <button
                      type="button"
                      onClick={() => {
                        addProduct();
                        setQuickViewOpen(false);
                      }}
                      className="flex-1 py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
                      style={{
                        background: "linear-gradient(135deg, #B06080, #8A4060)",
                        color: "#fff",
                        boxShadow: "0 6px 20px rgba(176,96,128,0.3)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[17px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        shopping_bag
                      </span>
                      Add to Cart
                    </button>
                  ) : (
                    <div
                      className="flex-1 py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-semibold flex items-center justify-center"
                      style={{
                        background: "rgba(42,26,20,0.06)",
                        color: "rgba(42,26,20,0.35)",
                        border: "1px solid rgba(42,26,20,0.12)",
                      }}
                    >
                      Sold Out
                    </div>
                  )}
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-medium text-center transition-all duration-200"
                    style={{
                      border: "1.5px solid rgba(42,26,20,0.2)",
                      color: "rgba(42,26,20,0.7)",
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
