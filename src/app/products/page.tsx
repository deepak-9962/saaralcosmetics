"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { listProducts } from "@/lib/supabase/data";
import { CATEGORIES, type CategoryFilter, type Product } from "@/lib/types";

type SortMode = "featured" | "price-low-high" | "price-high-low" | "name-a-z";
type PriceFilter = "all-prices" | "under-500" | "500-999" | "1000-plus";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = (searchParams.get("category") as CategoryFilter) || "all";
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all-prices");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setError(null);
        const data = await listProducts(activeCategory);
        setProducts(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
      }
    }

    loadProducts();
  }, [activeCategory]);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let next = products.filter((product) => {
      if (!normalizedSearch) {
        return true;
      }
      const haystack = `${product.name} ${product.category} ${product.variant_name} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });

    next = next.filter((product) => {
      if (priceFilter === "all-prices") {
        return true;
      }
      if (priceFilter === "under-500") {
        return product.price < 500;
      }
      if (priceFilter === "500-999") {
        return product.price >= 500 && product.price <= 999;
      }
      return product.price >= 1000;
    });

    if (sortMode === "price-low-high") {
      return [...next].sort((a, b) => a.price - b.price);
    }
    if (sortMode === "price-high-low") {
      return [...next].sort((a, b) => b.price - a.price);
    }
    if (sortMode === "name-a-z") {
      return [...next].sort((a, b) => a.name.localeCompare(b.name));
    }
    return next;
  }, [priceFilter, products, searchTerm, sortMode]);

  const activeCategoryLabel = CATEGORIES.find((cat) => cat.slug === activeCategory)?.label ?? "All";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-8 md:py-[var(--spacing-stack-lg)] pb-24 md:pb-[var(--spacing-stack-lg)] flex flex-col gap-8 md:gap-[var(--spacing-stack-lg)]">
        <motion.section
          className="flex flex-col items-start gap-4 pt-3 md:pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-[34px] md:text-[48px] leading-[1.15] md:tracking-[-0.01em] text-primary">
            Best Sellers
          </h1>
          <p className="font-body text-[16px] md:text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl">
            Authentic • Transparent • Sustainable
          </p>

          <div className="w-full relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search in ${activeCategoryLabel}`}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest pl-11 pr-4 py-3 font-body text-[15px] text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary/60"
            />
          </div>
        </motion.section>

        <section className="-mx-[var(--spacing-margin-mobile)] md:-mx-[var(--spacing-margin-desktop)] px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-3 border-y border-outline-variant/25 bg-surface-container-lowest/95 backdrop-blur">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full gap-2 pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    const nextUrl =
                      cat.slug === "all" ? "/products" : `/products?category=${cat.slug}`;
                    router.push(nextUrl);
                  }}
                  className={`px-4 py-2 rounded-full border font-body text-[12px] tracking-[0.08em] uppercase whitespace-nowrap transition-colors ${
                    activeCategory === cat.slug
                      ? "border-tertiary-container bg-surface-container-low text-primary"
                      : "border-outline-variant bg-transparent text-on-surface-variant hover:border-outline hover:text-on-surface"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 md:hidden">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex-1 h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest font-body text-[12px] tracking-[0.08em] uppercase flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filter
            </button>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex-1 h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest font-body text-[12px] tracking-[0.08em] uppercase flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">swap_vert</span>
              Sort
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 mt-2">
            <label className="font-body text-[14px] text-on-surface-variant">Sort</label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 font-body text-[14px] text-on-surface focus:outline-none focus:border-primary/60"
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
            </select>
            <label className="font-body text-[14px] text-on-surface-variant">Price</label>
            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
              className="h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 font-body text-[14px] text-on-surface focus:outline-none focus:border-primary/60"
            >
              <option value="all-prices">All prices</option>
              <option value="under-500">Under ₹500</option>
              <option value="500-999">₹500 - ₹999</option>
              <option value="1000-plus">₹1000+</option>
            </select>
          </div>
        </section>

        <div className="font-body text-[14px] text-on-surface-variant">
          Showing <span className="text-on-surface font-medium">{visibleProducts.length}</span> product
          {visibleProducts.length === 1 ? "" : "s"}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={`${activeCategory}-${sortMode}-${priceFilter}-${searchTerm}`}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[var(--spacing-gutter)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {visibleProducts.map((product, index) => (
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

        {visibleProducts.length === 0 && !error && (
          <p className="font-body text-[15px] leading-[1.6] text-on-surface-variant text-center py-8">
            No products found. Try another keyword or filter.
          </p>
        )}

        {error && (
          <p className="font-body text-[16px] leading-[1.6] text-error text-center">
            {error}
          </p>
        )}
      </main>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.button
              aria-label="Close filters"
              className="fixed inset-0 z-[90] bg-black/35 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 inset-x-0 z-[91] md:hidden bg-surface rounded-t-3xl border-t border-outline-variant/30 p-5 pb-8"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="w-10 h-1 rounded-full bg-outline-variant/40 mx-auto mb-4" />
              <h3 className="font-display text-[24px] text-on-surface mb-4">Sort & Filter</h3>

              <div className="space-y-3 mb-6">
                <p className="font-body text-[12px] tracking-[0.08em] uppercase text-on-surface-variant">Sort</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Featured", value: "featured" },
                    { label: "Price ↑", value: "price-low-high" },
                    { label: "Price ↓", value: "price-high-low" },
                    { label: "Name A-Z", value: "name-a-z" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortMode(opt.value as SortMode)}
                      className={`h-10 rounded-xl border font-body text-[13px] ${
                        sortMode === opt.value
                          ? "border-primary bg-primary-container/30 text-primary"
                          : "border-outline-variant/40 text-on-surface-variant"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-body text-[12px] tracking-[0.08em] uppercase text-on-surface-variant">Price</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "All", value: "all-prices" },
                    { label: "Under ₹500", value: "under-500" },
                    { label: "₹500-₹999", value: "500-999" },
                    { label: "₹1000+", value: "1000-plus" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPriceFilter(opt.value as PriceFilter)}
                      className={`h-10 rounded-xl border font-body text-[13px] ${
                        priceFilter === opt.value
                          ? "border-primary bg-primary-container/30 text-primary"
                          : "border-outline-variant/40 text-on-surface-variant"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFiltersOpen(false)}
                className="mt-6 w-full h-11 rounded-full bg-primary text-on-primary font-body text-[13px] tracking-[0.08em] uppercase"
              >
                Apply
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex flex-col">
          <GradientBackground />
          <TopNavBar />
          <main className="flex-grow" />
          <Footer />
          <MobileBottomNav />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
