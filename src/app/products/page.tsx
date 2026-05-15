"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { getProductsByCategory } from "@/lib/products";
import { CATEGORIES, type CategoryFilter } from "@/lib/types";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CategoryFilter) || "all";
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(initialCategory);

  useEffect(() => {
    const cat = searchParams.get("category") as CategoryFilter;
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const products = getProductsByCategory(activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] flex flex-col gap-[var(--spacing-stack-lg)]">
        {/* Page Header */}
        <motion.section
          className="flex flex-col items-center text-center gap-[var(--spacing-stack-sm)] pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] md:tracking-[-0.01em] text-primary">
            Apothecary Collection
          </h1>
          <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Discover our meticulously crafted rituals, blending ancient
            apothecary heritage with modern organic chemistry for your
            skin&apos;s perfect balance.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-6 py-2 rounded-full border font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium transition-colors duration-200 ${
                  activeCategory === cat.slug
                    ? "border-tertiary-container bg-surface-container-low text-primary"
                    : "border-outline-variant bg-transparent text-on-surface-variant hover:border-outline hover:text-on-surface"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.section
            key={activeCategory}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-gutter)] mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                showBadge={
                  index === 0
                    ? "New"
                    : product.slug === "turmeric-sandalwood-soap"
                    ? "Bestseller"
                    : undefined
                }
              />
            ))}
          </motion.section>
        </AnimatePresence>

        {/* Load More */}
        <div className="flex justify-center mt-12 mb-8">
          <button className="border border-primary text-primary px-8 py-3 rounded-full font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors duration-300">
            Discover More
          </button>
        </div>
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
