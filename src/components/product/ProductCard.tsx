"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  showBadge?: string;
  imageAspectClassName?: string;
}

export default function ProductCard({
  product,
  index = 0,
  showBadge,
  imageAspectClassName = "aspect-[4/5]",
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const addProduct = () => {
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
        className="flex flex-col group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Image Container ── */}
        <div
          className={`relative ${imageAspectClassName} rounded-2xl overflow-hidden mb-4`}
          style={{
            background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)",
            boxShadow: isHovered
              ? "0 28px 70px -12px rgba(176,96,128,0.28), 0 8px 24px -8px rgba(42,26,20,0.08)"
              : "0 8px 32px -8px rgba(176,96,128,0.12), 0 2px 8px rgba(42,26,20,0.04)",
            transition: "box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Image */}
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              style={{
                transform: isHovered ? "scale(1.07)" : "scale(1)",
                transition: "transform 0.75s cubic-bezier(0.22,1,0.36,1)",
              }}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Link overlay */}
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-[1]"
            aria-label={`View ${product.name}`}
          />

          {/* Subtle warm vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 110%, rgba(42,26,20,0.18) 0%, transparent 70%)",
              opacity: isHovered ? 0.9 : 0.5,
              transition: "opacity 0.5s ease",
            }}
          />

          {/* Badge */}
          {showBadge && (
            <div
              className="absolute top-3 left-3 z-[2] px-3 py-1 rounded-full font-body text-[10px] tracking-[0.14em] font-semibold uppercase"
              style={{
                background: showBadge === "New"
                  ? "linear-gradient(135deg, rgba(176,96,128,0.92), rgba(138,64,96,0.92))"
                  : "linear-gradient(135deg, rgba(201,167,77,0.95), rgba(158,128,40,0.95))",
                color: "#fff",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {showBadge}
            </div>
          )}

          {/* Wishlist button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-[3] w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isWishlisted
                ? "opacity-100 translate-y-0"
                : "opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0"
            }`}
            style={{
              background: isWishlisted ? "rgba(176,96,128,0.95)" : "rgba(255,250,247,0.92)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 12px rgba(42,26,20,0.15)",
              border: isWishlisted ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(201,167,77,0.2)",
            }}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{
                color: isWishlisted ? "#fff" : "#B06080",
                fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}`,
              }}
            >
              favorite
            </span>
          </button>

          {/* Quick view button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
            className="absolute top-3 right-[52px] z-[3] w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0"
            style={{
              background: "rgba(255,250,247,0.92)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 12px rgba(42,26,20,0.15)",
              border: "1px solid rgba(201,167,77,0.2)",
            }}
            aria-label={`Quick view ${product.name}`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: "#8A6A5A" }}>visibility</span>
          </button>

          {/* Add to cart overlay — desktop hover reveal */}
          <div
            className="hidden md:flex absolute inset-x-0 bottom-0 z-[3] flex-col items-stretch px-4 pb-4 pt-12"
            style={{
              background: "linear-gradient(to top, rgba(42,26,20,0.72) 0%, rgba(42,26,20,0.35) 60%, transparent 100%)",
              transform: isHovered ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded-xl py-3 font-body text-[11px] tracking-[0.14em] uppercase font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #B06080, #8A4060)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(176,96,128,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              Add to Cart
            </button>
          </div>
        </div>

        {/* ── Card Content ── */}
        <div className="flex flex-col flex-grow px-0.5">
          <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow">
            {/* Category & variant */}
            <p className="font-body text-[10px] tracking-[0.14em] uppercase mb-1.5 transition-colors duration-300"
              style={{ color: isHovered ? "#B06080" : "rgba(138,106,90,0.6)" }}>
              {categoryLabel}{product.variant_name ? ` · ${product.variant_name}` : ""}
            </p>

            {/* Product name */}
            <h3
              className="font-display leading-tight mb-2 transition-colors duration-300"
              style={{
                fontSize: "clamp(17px, 1.6vw, 21px)",
                color: isHovered ? "#8A3A60" : "#2A1A14",
                letterSpacing: "-0.01em",
              }}
            >
              {product.name}
            </h3>

            {/* Description snippet — desktop only */}
            {product.description && (
              <p className="hidden md:block font-body text-[13px] leading-relaxed mb-3 line-clamp-2"
                style={{ color: "rgba(90,58,44,0.55)" }}>
                {product.description}
              </p>
            )}

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Rating stars */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.36 4.16L10.85 4.49L8.28 6.74L9.06 10.15L6 8.35L2.94 10.15L3.72 6.74L1.15 4.49L4.64 4.16L6 1Z"
                    fill={star <= 4 ? "#C9A74D" : star === 5 ? "url(#halfStar)" : "#E3C8B8"}
                    stroke={star <= 4 ? "#C9A74D" : "#D4B8A8"} strokeWidth="0.5" />
                  {star === 5 && (
                    <defs>
                      <linearGradient id="halfStar">
                        <stop offset="50%" stopColor="#C9A74D" />
                        <stop offset="50%" stopColor="#E3C8B8" />
                      </linearGradient>
                    </defs>
                  )}
                </svg>
              ))}
              <span className="font-body text-[10px] text-[#8A6A5A]/55 ml-0.5">4.8</span>
            </div>

            {/* Price row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[18px] md:text-[20px]" style={{ color: "#B06080", letterSpacing: "-0.01em" }}>
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && (
                  <span className="font-body text-[13px] line-through" style={{ color: "rgba(138,106,90,0.45)" }}>
                    {formatPrice(product.compare_price)}
                  </span>
                )}
                {product.compare_price && (
                  <span className="font-body text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(176,96,128,0.1)", color: "#B06080" }}>
                    {Math.round((1 - product.price / product.compare_price) * 100)}% off
                  </span>
                )}
              </div>

              {/* Mobile add to cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="md:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #B06080, #8A4060)",
                  boxShadow: "0 4px 12px rgba(176,96,128,0.3)",
                }}
                aria-label={`Add ${product.name} to cart`}
              >
                <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shopping_bag
                </span>
              </button>
            </div>
          </Link>

          {/* Hover underline accent */}
          <div
            className="mt-3 h-px rounded-full transition-all duration-500"
            style={{
              width: isHovered ? "100%" : "0%",
              background: "linear-gradient(90deg, #B06080, #C9A74D)",
            }}
          />
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
              <div className="relative aspect-[4/5] md:aspect-auto min-h-[320px]"
                style={{ background: "linear-gradient(145deg, #F4E4DA, #EDD5C8)" }}>
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
                {showBadge && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full font-body text-[10px] tracking-[0.14em] font-semibold uppercase"
                    style={{ background: "linear-gradient(135deg, rgba(176,96,128,0.92), rgba(138,64,96,0.92))", color: "#fff" }}>
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
                <p className="font-body text-[10px] tracking-[0.16em] uppercase mb-3"
                  style={{ color: "#C9A74D" }}>
                  {categoryLabel}{product.variant_name ? ` · ${product.variant_name}` : ""}
                </p>

                {/* Name */}
                <h3 className="font-display text-[#2A1A14] mb-4"
                  style={{ fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1.15, letterSpacing: "-0.015em" }}>
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-display text-[28px]" style={{ color: "#B06080" }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <>
                      <span className="font-body text-[16px] line-through" style={{ color: "rgba(138,106,90,0.45)" }}>
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="font-body text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(176,96,128,0.1)", color: "#B06080" }}>
                        {Math.round((1 - product.price / product.compare_price) * 100)}% off
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="font-body text-[15px] leading-relaxed mb-6"
                    style={{ color: "rgba(90,58,44,0.7)" }}>
                    {product.description}
                  </p>
                )}

                {/* Ingredients teaser */}
                {product.ingredients && (
                  <div className="mb-6 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(201,167,77,0.08)", border: "1px solid rgba(201,167,77,0.15)" }}>
                    <p className="font-body text-[10px] tracking-[0.12em] uppercase text-[#8A6A00] mb-1.5">Key Ingredients</p>
                    <p className="font-body text-[13px] leading-relaxed text-[#5A3A2C]/70 line-clamp-2">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => { addProduct(); setQuickViewOpen(false); }}
                    className="flex-1 py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: "linear-gradient(135deg, #B06080, #8A4060)",
                      color: "#fff",
                      boxShadow: "0 6px 20px rgba(176,96,128,0.3)",
                    }}
                  >
                    <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 py-3.5 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-medium text-center transition-all duration-200"
                    style={{
                      border: "1.5px solid rgba(42,26,20,0.2)",
                      color: "rgba(42,26,20,0.7)",
                    }}
                  >
                    View Full Details
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
