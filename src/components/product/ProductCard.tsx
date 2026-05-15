"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
  showBadge?: string;
}

export default function ProductCard({
  product,
  index = 0,
  showBadge,
}: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      variant_name: product.variant_name,
      price: product.price,
      image: product.images[0] || "",
      slug: product.slug,
    });
  };

  return (
    <motion.article
      className="flex flex-col group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow">
        <div className="relative aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden mb-4">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {showBadge && (
            <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium">
              {showBadge}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="font-display text-[24px] leading-[1.4] text-on-surface mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-2">
            {product.category
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}{" "}
            • {product.variant_name}
          </p>
          <div className="mt-auto flex items-center gap-2">
            <span className="font-body text-[18px] leading-[1.6] text-primary font-medium">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_price && (
              <span className="font-body text-[16px] leading-[1.6] text-outline line-through">
                ${product.compare_price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        className="mt-4 w-full bg-surface-container-highest hover:bg-tertiary-container hover:text-on-tertiary-container text-on-surface font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
      >
        Add to Cart
      </button>
    </motion.article>
  );
}
