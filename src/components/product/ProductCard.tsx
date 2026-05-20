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

  return (
    <>
      <motion.article
        className="flex flex-col group"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -6 }}
      >
        <div
          className={`relative ${imageAspectClassName} bg-surface-container-low rounded-2xl overflow-hidden mb-4 transition-shadow duration-500 group-hover:shadow-[0_24px_60px_-12px_rgba(176,96,128,0.22)]`}
          style={{ boxShadow: "0 8px 32px -8px rgba(176,96,128,0.10)" }}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
           className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-[1]"
            aria-label={`View ${product.name}`}
          />
          {showBadge && (
            <div className="absolute top-3 left-3 z-[2] px-3 py-1 rounded-full font-body text-[10px] tracking-[0.12em] font-semibold uppercase" style={{ background: "rgba(201,167,77,0.92)", color: "#2A1D00", backdropFilter: "blur(8px)" }}>
              {showBadge}
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-[3] w-9 h-9 rounded-full backdrop-blur-sm shadow-lg flex items-center justify-center opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ${
              isWishlisted
                ? "bg-white text-primary"
                : "bg-white/90 text-[#2A1A14] hover:text-primary hover:bg-white"
            }`}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}` }}
            >
              favorite
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="absolute top-3 right-14 z-[3] w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-[#2A1A14] shadow-lg flex items-center justify-center opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 hover:text-primary hover:bg-white"
            aria-label={`Quick view ${product.name}`}
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          <div className="hidden md:block absolute inset-x-0 bottom-0 z-[3] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4">
            <motion.button
              type="button"
              onClick={handleAddToCart}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-on-primary font-body text-[11px] leading-[1.0] tracking-[0.14em] font-semibold uppercase py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:opacity-90 hover:gap-3"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              Add to Cart
            </motion.button>
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow">
            <h3 className="font-display text-[20px] md:text-[24px] leading-[1.3] md:leading-[1.4] text-on-surface mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="font-body text-[14px] md:text-[16px] leading-[1.6] text-on-surface-variant mb-2">
              {product.category
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}{" "}
              • {product.variant_name}
            </p>
            <div className="mt-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-body text-[18px] leading-[1.6] text-primary font-medium">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && (
                  <span className="font-body text-[13px] leading-[1.6] text-outline line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="md:hidden shrink-0 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform"
                aria-label={`Add ${product.name} to cart`}
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </button>
            </div>
          </Link>
        </div>
      </motion.article>

      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewOpen(false)}
          >
            <motion.div
              className="bg-surface rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view for ${product.name}`}
            >
              <div className="relative aspect-[4/5] md:aspect-auto min-h-[320px] bg-surface-container-low">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col">
                <button
                  type="button"
                  onClick={() => setQuickViewOpen(false)}
                  className="self-end w-9 h-9 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
                  aria-label="Close quick view"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] uppercase text-tertiary mb-3">
                  {product.category.split("-").join(" ")} • {product.variant_name}
                </p>
                <h3 className="font-display text-[28px] md:text-[32px] leading-[1.2] text-on-surface mb-4">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-display text-[28px] text-on-surface">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <span className="font-body text-[16px] text-outline line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                  )}
                </div>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-6">
                  {product.description}
                </p>
                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      addProduct();
                      setQuickViewOpen(false);
                    }}
                    className="flex-1 bg-primary hover:opacity-90 text-on-primary rounded-full px-6 py-3 font-body font-medium transition-all"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 border border-on-surface text-on-surface rounded-full px-6 py-3 font-body font-medium text-center hover:bg-on-surface hover:text-surface transition-colors"
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
