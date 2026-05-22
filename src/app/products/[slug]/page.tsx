"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/lib/cart";
import { getProductBySlug, listRelatedProducts } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProductData() {
      try {
        setIsLoading(true);
        setError(null);
        const currentProduct = await getProductBySlug(slug);

        if (!currentProduct) {
          setProduct(null);
          return;
        }

        setProduct(currentProduct);
        const related = await listRelatedProducts(slug, currentProduct.category);
        setRelatedProducts(related);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load product.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProductData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

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

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col grain-overlay">
        <GradientBackground />
        <TopNavBar />
        <main className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] flex-grow">
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Loading product...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col grain-overlay">
        <GradientBackground />
        <TopNavBar />
        <main className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] flex-grow">
          <p className="font-body text-[16px] leading-[1.6] text-error">{error}</p>
          <Link
            href="/products"
            className="mt-4 inline-flex border border-on-surface text-on-surface px-5 py-2 rounded-full font-body text-[14px]"
          >
            Back to Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[100dvh] flex flex-col grain-overlay">
        <GradientBackground />
        <TopNavBar />
        <main className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] flex-grow">
          <h1 className="font-display text-[32px] leading-[1.3] text-on-surface">Product not found</h1>
          <Link
            href="/products"
            className="mt-4 inline-flex border border-on-surface text-on-surface px-5 py-2 rounded-full font-body text-[14px]"
          >
            Back to Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col grain-overlay">
      <GradientBackground />
      <TopNavBar />

        <main className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-10 md:py-[var(--spacing-stack-lg)] pb-24 md:pb-[var(--spacing-stack-lg)] flex-grow">
        <div className="mb-[var(--spacing-stack-md)] flex flex-wrap items-center gap-2 font-body text-[11px] md:text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface truncate max-w-[180px] md:max-w-none">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-[var(--spacing-gutter)] mb-[var(--spacing-stack-lg)]">
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
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
                {product.category
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}{" "}
              • {product.variant_name}
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

            <p className="font-body text-[15px] md:text-[16px] leading-[1.6] text-on-surface mb-8">
              {product.description}
            </p>

            <div className="mb-8">
              <h3 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface mb-3">
                Size
              </h3>
              <div className="flex gap-3">
                <button className="px-6 py-3 border border-primary/30 rounded-lg font-body text-[16px] leading-[1.6] bg-surface text-on-surface shadow-[0_2px_8px_rgba(176,96,128,0.06)] active:scale-98 transition-transform">
                  {product.variant_name}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center border border-outline-variant/50 rounded-lg w-fit">
                <button
                  className="p-3 text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="font-body text-[16px] leading-[1.6] px-4 w-12 text-center">
                  {quantity}
                </span>
                <button
                  className="p-3 text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
                <button
                  onClick={handleAddToCart}
                  className="hidden md:flex w-full bg-primary hover:bg-[#9d4d6e] text-on-primary font-body text-[16px] leading-[1.6] py-4 rounded-lg items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
                  Add to Cart
                </button>
              </div>

            <div className="flex flex-col border-t border-outline-variant/50">
              <details className="group py-4 border-b border-outline-variant/50" open>
                <summary className="flex justify-between items-center cursor-pointer list-none font-body text-[16px] leading-[1.6] font-medium text-on-surface">
                  <span>Description</span>
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <div className="pt-4 font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  {product.description}
                </div>
              </details>
              <details className="group py-4 border-b border-outline-variant/50">
                <summary className="flex justify-between items-center cursor-pointer list-none font-body text-[16px] leading-[1.6] font-medium text-on-surface">
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
                <summary className="flex justify-between items-center cursor-pointer list-none font-body text-[16px] leading-[1.6] font-medium text-on-surface">
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

        {relatedProducts.length > 0 && (
          <section className="mt-[var(--spacing-stack-lg)] pt-[var(--spacing-stack-lg)] border-t border-outline-variant/50">
              <h2 className="font-display text-[22px] md:text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-md)] text-center">
                Complete Your Ritual
              </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, i) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="md:hidden fixed bottom-20 inset-x-0 z-40 px-3">
        <div className="bg-surface-container-lowest/95 backdrop-blur rounded-xl border border-outline-variant/30 shadow-[0_8px_16px_-8px_rgba(42,26,20,0.28)] px-2.5 py-1.5 flex items-center gap-2">
          <div className="flex flex-col min-w-[72px]">
            <span className="font-body text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">Price</span>
            <span className="font-display text-[18px] leading-[1] text-on-surface">{formatPrice(product.price)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 rounded-lg bg-primary hover:bg-[#9d4d6e] text-on-primary font-body text-[12px] tracking-[0.08em] uppercase font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            Add {quantity > 1 ? `${quantity} items` : "to cart"}
          </button>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
