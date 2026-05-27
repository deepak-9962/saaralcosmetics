"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductInteractivePanelProps {
  initialProduct: Product;
  variants: Product[];
}

export default function ProductInteractivePanel({
  initialProduct,
  variants,
}: ProductInteractivePanelProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const handleVariantChange = (selectedVariant: Product) => {
    setProduct(selectedVariant);
    setSelectedImage(0);
    setQuantity(1);
    // Update the browser URL without scrolling or page re-fetches
    window.history.replaceState(null, "", `/products/${selectedVariant.slug}`);
  };

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i += 1) {
      addItem({
        product_id: product.id,
        name: product.name,
        variant_name: product.variant_name,
        price: product.price,
        image: product.images[0] || "",
        slug: product.slug,
      });
    }
    toast.success(`${product.name} added to cart`);
  };

  const categoryLabel = product.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-[var(--spacing-gutter)] mb-[var(--spacing-stack-lg)]">
        {/* Left Gallery Panel */}
        <motion.div
          className="md:col-span-7 flex flex-col gap-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            {product.compare_price && (
              <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium px-3 py-1 rounded-full custom-shadow">
                Bestseller
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === i
                      ? "border-tertiary-container"
                      : "border-outline-variant opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Product Details Selection Panel */}
        <motion.div
          className="md:col-span-5 flex flex-col pt-2 md:pt-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-display text-[32px] md:text-[48px] leading-[1.2] text-on-surface mb-2">
            {product.name}
          </h1>
          <p className="font-body text-[16px] md:text-[18px] leading-[1.6] text-on-surface-variant mb-6">
            {categoryLabel} • {product.variant_name}
          </p>

          <div className="flex items-end gap-3 mb-6">
            <span className="font-display text-[28px] md:text-[32px] leading-[1.3] text-on-surface font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className="font-body text-[16px] md:text-[18px] leading-[1.6] text-outline line-through mb-1">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          <div className="w-full h-px bg-outline-variant/50 my-4" />

          {/* Description with Read More toggle */}
          {product.description && (
            <div className="mb-8">
              <p
                className={`font-body text-[15px] md:text-[16px] leading-[1.7] text-on-surface-variant transition-all duration-300 ${
                  isDescExpanded ? "" : "line-clamp-3"
                }`}
              >
                {product.description}
              </p>
              <button
                onClick={() => setIsDescExpanded((prev) => !prev)}
                className="mt-2 font-body text-[13px] leading-[1.0] tracking-[0.05em] font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1 transition-all"
              >
                {isDescExpanded ? "Show less" : "Read more"}
                <span
                  className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                    isDescExpanded ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
            </div>
          )}

          {/* Variants selector */}
          {variants.length > 1 && (
            <div className="mb-8">
              <h3 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => {
                  const isActive = v.id === product.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVariantChange(v)}
                      className={`px-5 py-2.5 rounded-xl font-body text-[15px] transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(176,96,128,0.25)] border border-primary"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary/50"
                      }`}
                    >
                      {v.variant_name || "Standard"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Desktop Add To Cart Button */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center border border-outline-variant/50 rounded-lg w-fit">
              <button
                className="p-3 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="font-body text-[16px] leading-[1.6] px-4 w-12 text-center select-none">
                {quantity}
              </span>
              <button
                className="p-3 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                onClick={() => setQuantity(quantity + 1)}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="hidden md:flex w-full bg-primary hover:bg-[#9d4d6e] text-on-primary font-body text-[16px] leading-[1.6] py-4 rounded-lg items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Add to Cart
            </button>
          </div>

          {/* Details Accordion Toggles — Description removed (shown inline above with Read more) */}
          <div className="flex flex-col border-t border-outline-variant/50">
            <details className="group py-4 border-b border-outline-variant/50">
              <summary className="flex justify-between items-center cursor-pointer list-none font-body text-[16px] leading-[1.6] font-medium text-on-surface select-none">
                <span>Ingredients</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="pt-4 font-body text-[16px] leading-[1.6] text-on-surface-variant">
                {product.ingredients}
              </div>
            </details>
            <details className="group py-4 border-b border-outline-variant/50">
              <summary className="flex justify-between items-center cursor-pointer list-none font-body text-[16px] leading-[1.6] font-medium text-on-surface select-none">
                <span>How to Use</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="pt-4 font-body text-[16px] leading-[1.6] text-on-surface-variant">
                {product.how_to_use}
              </div>
            </details>
          </div>
        </motion.div>
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-20 inset-x-0 z-40 px-3">
        <div className="bg-surface-container-lowest/95 backdrop-blur rounded-xl border border-outline-variant/30 shadow-[0_8px_16px_-8px_rgba(42,26,20,0.28)] px-2.5 py-1.5 flex items-center gap-2">
          <div className="flex flex-col min-w-[72px]">
            <span className="font-body text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">Price</span>
            <span className="font-display text-[18px] leading-[1] text-on-surface">{formatPrice(product.price)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 rounded-lg bg-primary hover:bg-[#9d4d6e] text-on-primary font-body text-[12px] tracking-[0.08em] uppercase font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            Add {quantity > 1 ? `${quantity} items` : "to cart"}
          </button>
        </div>
      </div>
    </>
  );
}
