"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup, animate } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { CATEGORIES, type CategoryFilter, type Product } from "@/lib/types";

type SortMode = "featured" | "price-low-high" | "price-high-low" | "name-a-z";
type PriceFilter = "all-prices" | "under-500" | "500-999" | "1000-plus";

interface ProductCatalogPanelProps {
  products: Product[];
}

export default function ProductCatalogPanel({ products }: ProductCatalogPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = (searchParams.get("category") as CategoryFilter) || "all";

  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all-prices");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const mobileActiveRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const collectionParam = searchParams.get("collection");
  const searchParam = searchParams.get("search") || searchParams.get("q");

  // Auto-scroll directly to the product catalog when navigating with categories/collections/search
  useEffect(() => {
    const hasFilter =
      searchParams.has("category") ||
      searchParams.has("collection") ||
      searchParams.has("search") ||
      searchParams.has("q") ||
      (typeof window !== "undefined" && window.location.hash === "#catalog");

    if (hasFilter) {
      const scrollToCatalog = () => {
        const el = panelRef.current || document.getElementById("catalog");
        if (el) {
          const navEl = document.querySelector("header") || document.querySelector("nav");
          const navHeight = navEl
            ? navEl.getBoundingClientRect().height
            : window.innerWidth >= 768
            ? 100
            : 88;
          const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight + 2;

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: "smooth",
          });
        }
      };

      const timer1 = setTimeout(scrollToCatalog, 60);
      const timer2 = setTimeout(scrollToCatalog, 260);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [searchParams]);

  // Smooth-scroll active category chip into center view
  useEffect(() => {
    const chip = mobileActiveRef.current;
    if (!chip) return;
    const container = chip.closest(".overflow-x-auto");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const targetScrollLeft =
      container.scrollLeft +
      (chipRect.left - containerRect.left) -
      containerRect.width / 2 +
      chipRect.width / 2;

    const controls = animate(container.scrollLeft, targetScrollLeft, {
      type: "spring",
      stiffness: 180,
      damping: 24,
      mass: 0.9,
      onUpdate: (value) => {
        container.scrollLeft = value;
      },
    });

    return () => controls.stop();
  }, [activeCategory]);

  // Derived counts
  const activeFilterCount =
    (activeCategory !== "all" ? 1 : 0) +
    (priceFilter !== "all-prices" ? 1 : 0) +
    (collectionParam ? 1 : 0) +
    (searchParam ? 1 : 0);

  // Filter and sort products
  const visibleProducts = useMemo(() => {
    let next = products.filter((p) => p.is_active !== false);

    if (activeCategory !== "all") {
      next = next.filter((p) => p.category === activeCategory);
    }

    if (collectionParam) {
      if (
        collectionParam.toLowerCase() !== "bestsellers" &&
        collectionParam.toLowerCase() !== "best-sellers"
      ) {
        const col = collectionParam.toLowerCase().replace(/-/g, " ");
        const colSlug = collectionParam.toLowerCase();
        next = next.filter(
          (p) =>
            p.name.toLowerCase().includes(col) ||
            p.slug.toLowerCase().includes(colSlug) ||
            (p.description && p.description.toLowerCase().includes(col))
        );
      }
    }

    if (searchParam) {
      const s = searchParam.toLowerCase();
      next = next.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.slug.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
      );
    }

    next = next.filter((product) => {
      if (priceFilter === "all-prices") return true;
      if (priceFilter === "under-500") return product.price < 500;
      if (priceFilter === "500-999") return product.price >= 500 && product.price <= 999;
      return product.price >= 1000;
    });

    if (sortMode === "price-low-high") return [...next].sort((a, b) => a.price - b.price);
    if (sortMode === "price-high-low") return [...next].sort((a, b) => b.price - a.price);
    if (sortMode === "name-a-z") return [...next].sort((a, b) => a.name.localeCompare(b.name));

    return next;
  }, [products, activeCategory, collectionParam, searchParam, priceFilter, sortMode]);

  const activeCategoryLabel = useMemo(() => {
    if (collectionParam) {
      if (
        collectionParam.toLowerCase() === "bestsellers" ||
        collectionParam.toLowerCase() === "best-sellers"
      ) {
        return "Best Selling Products";
      }
      return (
        collectionParam
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") + " Collection"
      );
    }
    if (searchParam) {
      return `Results for "${searchParam}"`;
    }
    if (activeCategory === "all") return "All Products";
    return CATEGORIES.find((c) => c.slug === activeCategory)?.label ?? "Products";
  }, [collectionParam, searchParam, activeCategory]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  const sortLabel =
    sortMode === "featured"
      ? "Featured"
      : sortMode === "price-low-high"
      ? "Price ↑"
      : sortMode === "price-high-low"
      ? "Price ↓"
      : "Name A–Z";

  return (
    <div ref={panelRef}>
      {/* ── STICKY FILTER BAR (DermaCo style) ── */}
      <div className="sticky top-[84px] md:top-[98px] z-30 w-full">
        <div
          style={{
            background: "rgba(253,246,240,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(201,167,77,0.14)",
            boxShadow: "0 2px 12px rgba(42,26,20,0.04)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 md:px-[72px]">

            {/* ── Row 1: Filter + Sort ── */}
            <div className="flex items-center gap-2 h-[48px] md:h-[52px]">

              {/* FILTER button with badge */}
              <button
                onClick={() => {
                  setFilterDrawerOpen(!filterDrawerOpen);
                  setSortDropdownOpen(false);
                }}
                className="shrink-0 relative flex items-center gap-1.5 h-8 px-3.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 active:scale-95 cursor-pointer"
                style={{
                  background: filterDrawerOpen
                    ? "rgba(139,58,94,0.10)"
                    : "rgba(255,252,247,0.7)",
                  border: filterDrawerOpen
                    ? "1.5px solid rgba(139,58,94,0.30)"
                    : "1.5px solid rgba(201,167,77,0.25)",
                  color: filterDrawerOpen ? "#8B3A5E" : "#3A2018",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-body text-[9px] font-bold text-white leading-none"
                    style={{ background: "#8B3A5E" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="shrink-0 w-px h-5" style={{ background: "rgba(201,167,77,0.2)" }} />

              {/* SORT dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setSortDropdownOpen(!sortDropdownOpen);
                    setFilterDrawerOpen(false);
                  }}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-full font-body text-[11px] font-medium tracking-[0.04em] transition-all duration-200 active:scale-95 cursor-pointer"
                  style={{
                    background: sortMode !== "featured" ? "rgba(139,58,94,0.06)" : "rgba(255,252,247,0.7)",
                    border: sortMode !== "featured" ? "1.5px solid rgba(139,58,94,0.25)" : "1.5px solid rgba(201,167,77,0.25)",
                    color: sortMode !== "featured" ? "#8B3A5E" : "#3A2018",
                  }}
                >
                  <span>Sort</span>
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
                      <motion.div
                        className="absolute left-0 top-full mt-2 w-[192px] z-50 rounded-2xl border p-2"
                        style={{
                          background: "#FDF6F0",
                          border: "1px solid rgba(201,167,77,0.18)",
                          boxShadow: "0 12px 36px rgba(42,26,20,0.12)",
                        }}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {[
                          { label: "Featured", value: "featured" },
                          { label: "Price: Low to High", value: "price-low-high" },
                          { label: "Price: High to Low", value: "price-high-low" },
                          { label: "Name A–Z", value: "name-a-z" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortMode(opt.value as SortMode);
                              setSortDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 rounded-xl font-body text-[12px] transition-all duration-200 cursor-pointer"
                            style={{
                              color: sortMode === opt.value ? "#8B3A5E" : "rgba(58,32,24,0.65)",
                              background: sortMode === opt.value ? "rgba(139,58,94,0.07)" : "transparent",
                              fontWeight: sortMode === opt.value ? 600 : 400,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Row 2: Category chips (full-width scrollable row) ── */}
            <div
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5"
              style={{ borderTop: "1px solid rgba(201,167,77,0.10)" }}
            >
              <LayoutGroup id="cat-chips">
                <div className="flex items-center gap-2 pt-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        ref={isActive ? mobileActiveRef : undefined}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          const nextUrl =
                            cat.slug === "all" ? "/products" : `/products?category=${cat.slug}`;
                          router.push(nextUrl, { scroll: false });
                        }}
                        className="relative shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-full font-body text-[11px] tracking-[0.04em] transition-all duration-200 focus-visible:outline-none active:scale-95 cursor-pointer"
                        style={{
                          background: isActive
                            ? "linear-gradient(135deg, rgba(139,58,94,0.12) 0%, rgba(201,167,77,0.08) 100%)"
                            : "transparent",
                          border: isActive
                            ? "1.5px solid rgba(139,58,94,0.30)"
                            : "1.5px solid transparent",
                          color: isActive ? "#8B3A5E" : "rgba(58,32,24,0.60)",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="cat-active-bg"
                            className="absolute inset-0 rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(139,58,94,0.10) 0%, rgba(201,167,77,0.07) 100%)",
                              border: "1.5px solid rgba(139,58,94,0.28)",
                            }}
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 36 }}
                          />
                        )}
                        <span className="relative z-10">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>

              {/* Active price filter "×" chip */}
              {priceFilter !== "all-prices" && (
                <button
                  onClick={() => setPriceFilter("all-prices")}
                  className="shrink-0 flex items-center gap-1 h-8 px-3 rounded-full font-body text-[11px] font-medium transition-all duration-200 cursor-pointer mt-2"
                  style={{
                    background: "rgba(139,58,94,0.08)",
                    border: "1.5px solid rgba(139,58,94,0.22)",
                    color: "#8B3A5E",
                  }}
                >
                  <span>
                    {priceFilter === "under-500"
                      ? "Under ₹500"
                      : priceFilter === "500-999"
                      ? "₹500–₹999"
                      : "₹1000+"}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {/* Clear all if multiple filters */}
              {activeFilterCount > 1 && (
                <button
                  onClick={() => {
                    setPriceFilter("all-prices");
                    router.push("/products", { scroll: false });
                  }}
                  className="shrink-0 font-body text-[10px] tracking-[0.06em] underline underline-offset-2 cursor-pointer whitespace-nowrap mt-2"
                  style={{ color: "rgba(139,58,94,0.65)" }}
                >
                  Clear all
                </button>
              )}
            </div>

          </div>

          {/* ── Expandable Filter Drawer ── */}
          <AnimatePresence>
            {filterDrawerOpen && (
              <motion.div
                className="border-t overflow-hidden"
                style={{
                  borderColor: "rgba(201,167,77,0.12)",
                  background: "rgba(253,246,240,0.98)",
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36,1] }}
              >
                <div className="max-w-[1280px] mx-auto px-4 md:px-[72px] py-5">
                  <p className="font-body text-[9px] tracking-[0.18em] uppercase font-semibold mb-3" style={{ color: "rgba(90,58,44,0.55)" }}>
                    Price Range
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "All Prices", value: "all-prices" },
                      { label: "Under ₹500", value: "under-500" },
                      { label: "₹500–₹999", value: "500-999" },
                      { label: "₹1000+", value: "1000-plus" },
                    ].map((opt) => {
                      const isActive = priceFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPriceFilter(opt.value as PriceFilter)}
                          className="h-8 px-4 rounded-full font-body text-[11px] tracking-[0.04em] transition-all duration-200 cursor-pointer"
                          style={{
                            border: isActive
                              ? "1.5px solid rgba(139,58,94,0.35)"
                              : "1.5px solid rgba(201,167,77,0.2)",
                            background: isActive
                              ? "rgba(139,58,94,0.08)"
                              : "rgba(255,252,247,0.6)",
                            color: isActive ? "#8B3A5E" : "rgba(58,32,24,0.60)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── PRODUCT GRID SECTION ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-[72px] pt-4 pb-12">

        {/* Product count line */}
        <p
          className="font-body text-[12px] mb-5 md:mb-6"
          style={{ color: "rgba(42,26,20,0.50)" }}
        >
          <span style={{ fontWeight: 600, color: "rgba(42,26,20,0.75)" }}>
            {visibleProducts.length} product{visibleProducts.length !== 1 ? "s" : ""}
          </span>
          {" "}for{" "}
          <span style={{ color: "rgba(42,26,20,0.65)" }}>{activeCategoryLabel}</span>
          {priceFilter !== "all-prices" && (
            <span style={{ color: "rgba(42,26,20,0.40)" }}>
              {" "}·{" "}
              {priceFilter === "under-500" ? "Under ₹500" : priceFilter === "500-999" ? "₹500–₹999" : "₹1000+"}
            </span>
          )}
          {sortMode !== "featured" && (
            <span style={{ color: "rgba(42,26,20,0.35)" }}> · Sorted by {sortLabel}</span>
          )}
        </p>

        <AnimatePresence mode="wait">
          {visibleProducts.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-24 gap-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(176,96,128,0.08)", border: "1px solid rgba(176,96,128,0.18)" }}
              >
                <span className="material-symbols-outlined text-[32px] text-[#B06080]/50">search_off</span>
              </div>
              <div className="text-center">
                <p className="font-display text-[22px] text-[#2A1A14]/70 mb-2">No products found</p>
                <p className="font-body text-[14px] text-[#8A6A5A]/60">
                  Try a different category or adjust your filters
                </p>
              </div>
              <button
                onClick={() => {
                  setPriceFilter("all-prices");
                  router.push("/products", { scroll: false });
                }}
                className="px-6 py-2.5 rounded-full font-body text-[12px] tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #B06080, #8A4060)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(176,96,128,0.25)",
                }}
              >
                Browse All Products
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${sortMode}-${priceFilter}`}
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {visibleProducts.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <ProductCard
                    product={product}
                    index={index}
                    showBadge={
                      index === 0
                        ? "New Arrival"
                        : product.slug === "turmeric-sandalwood-soap"
                        ? "Best Seller"
                        : index % 3 === 1
                        ? "Best Seller"
                        : undefined
                    }
                    showSubBadge="Herbal"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
