"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup, animate } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { CATEGORIES, type CategoryFilter, type Product } from "@/lib/types";

type SortMode = "featured" | "price-low-high" | "price-high-low" | "name-a-z";
type PriceFilter = "all-prices" | "under-500" | "500-999" | "1000-plus";

const trustBadges = [
  { icon: "spa", label: "100% Natural" },
  { icon: "pets", label: "Cruelty Free" },
  { icon: "science", label: "Sulphate Free" },
  { icon: "handyman", label: "Handmade" },
];

interface ProductCatalogPanelProps {
  products: Product[];
}

export default function ProductCatalogPanel({ products }: ProductCatalogPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = (searchParams.get("category") as CategoryFilter) || "all";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all-prices");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const mobileActiveRef = useRef<HTMLButtonElement | null>(null);

  // Sync category swiper scroll offset on category change
  useEffect(() => {
    const chip = mobileActiveRef.current;
    if (!chip) return;
    const container = chip.closest(".overflow-x-auto");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const targetScrollLeft = container.scrollLeft + (chipRect.left - containerRect.left) - (containerRect.width / 2) + (chipRect.width / 2);

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

  // Sync search input with URL query param if present
  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

  // Filter and sort products on client-side dynamically
  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    
    // 1. Filter by category
    let next = products;
    if (activeCategory !== "all") {
      next = next.filter((p) => p.category === activeCategory);
    }
    
    // 2. Filter by search term
    if (normalizedSearch) {
      next = next.filter((product) => {
        const haystack = `${product.name} ${product.category} ${product.variant_name} ${product.description}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }
    
    // 3. Filter by price
    next = next.filter((product) => {
      if (priceFilter === "all-prices") return true;
      if (priceFilter === "under-500") return product.price < 500;
      if (priceFilter === "500-999") return product.price >= 500 && product.price <= 999;
      return product.price >= 1000;
    });

    // 4. Sort
    if (sortMode === "price-low-high") return [...next].sort((a, b) => a.price - b.price);
    if (sortMode === "price-high-low") return [...next].sort((a, b) => b.price - a.price);
    if (sortMode === "name-a-z") return [...next].sort((a, b) => a.name.localeCompare(b.name));
    
    return next;
  }, [products, activeCategory, searchTerm, priceFilter, sortMode]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <>
      {/* ── SEARCH BAR INSIDE CATALOG PANEL ── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px] -mt-10 md:-mt-20 mb-8">
        <div className="max-w-[65%] md:max-w-[55%]">
          <div className="relative group">
            <div className={`absolute -inset-[1px] rounded-[22px] transition-opacity duration-500 pointer-events-none ${searchFocused ? "opacity-100" : "opacity-0"}`}
              style={{ background: "linear-gradient(135deg, rgba(176,96,128,0.35), rgba(201,167,77,0.25), rgba(126,107,154,0.3))", filter: "blur(4px)" }} />

            <div className="relative flex items-center"
              style={{
                background: "rgba(255,250,247,0.72)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1.5px solid ${searchFocused ? "rgba(176,96,128,0.45)" : "rgba(201,167,77,0.22)"}`,
                borderRadius: "22px",
                boxShadow: searchFocused
                  ? "inset 0 2px 8px rgba(176,96,128,0.06), 0 8px 32px rgba(176,96,128,0.12)"
                  : "inset 0 2px 6px rgba(42,26,20,0.04), 0 4px 20px rgba(42,26,20,0.04)",
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <span className="material-symbols-outlined pl-4 md:pl-5 text-[18px] md:text-[22px] shrink-0 transition-colors duration-300"
                style={{ color: searchFocused ? "#B06080" : "rgba(138,106,90,0.55)" }}>
                search
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search products..."
                className="w-full bg-transparent pl-3 pr-4 py-2.5 md:py-4 font-body text-[13px] md:text-[15px] text-[#2A1A14] placeholder:text-[#8A6A5A]/45 focus:outline-none"
                style={{ caretColor: "#B06080" }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mr-3 md:mr-4 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[#B06080]/10 cursor-pointer"
                  style={{ color: "rgba(138,106,90,0.6)" }}
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[14px] md:text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER & CATEGORY NAVIGATION SECTION ── */}
      <section className="sticky top-[64px] z-30 w-full">
        <div style={{
          background: "linear-gradient(to bottom, rgba(253,246,240,0.97) 0%, rgba(253,246,240,0.94) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(201,167,77,0.12)",
          boxShadow: "0 4px 30px rgba(42,26,20,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
        }} className="relative">
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.015] -z-10"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "180px" }} />

          <div className="max-w-[1280px] mx-auto px-4 md:px-[72px] py-3.5 md:py-0 md:h-[72px] flex flex-col md:flex-row md:items-center justify-between gap-3.5 md:gap-4">
            
            {/* LEFT SIDE: Category pills */}
            <div className="w-full md:flex-grow overflow-x-auto no-scrollbar py-1 md:py-2">
              <LayoutGroup id="chips-row">
                <div className="flex items-center gap-3">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        ref={isActive ? mobileActiveRef : undefined}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          const nextUrl = cat.slug === "all" ? "/products" : `/products?category=${cat.slug}`;
                          router.push(nextUrl, { scroll: false });
                        }}
                        className="relative flex items-center gap-1.5 whitespace-nowrap font-body text-[10px] md:text-[11px] tracking-[0.12em] uppercase shrink-0 focus-visible:outline-none transition-all duration-300 cursor-pointer"
                        style={{
                          height: "36px",
                          padding: "0 18px",
                          borderRadius: "18px",
                          border: isActive ? "1px solid rgba(176,96,128,0.22)" : "1px solid rgba(201,167,77,0.14)",
                          background: isActive 
                            ? "linear-gradient(135deg, rgba(212,140,158,0.08) 0%, rgba(201,167,77,0.08) 100%)" 
                            : "rgba(255,252,247,0.35)",
                          color: isActive ? "#8B3A5E" : "rgba(90,58,44,0.65)",
                          fontWeight: isActive ? 600 : 500,
                          boxShadow: isActive ? "0 2px 10px rgba(176,96,128,0.08), inset 0 1px 0 rgba(255,255,255,0.4)" : "none",
                        }}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="active-nav-glow"
                            className="absolute inset-0"
                            style={{
                              borderRadius: "18px",
                              background: "linear-gradient(135deg, rgba(212,140,158,0.12) 0%, rgba(201,167,77,0.12) 100%)",
                              border: "1px solid rgba(176,96,128,0.3)",
                              boxShadow: "0 2px 12px rgba(176,96,128,0.12), inset 0 1px 0 rgba(255,255,255,0.5)",
                            }}
                            initial={false}
                            transition={{ type: "spring", stiffness: 380, damping: 35 }}
                          />
                        )}
                        <span
                          className="relative z-10 material-symbols-outlined"
                          style={{
                            fontSize: "13px",
                            color: isActive ? "#8B3A5E" : "rgba(176,96,128,0.65)",
                            fontVariationSettings: `'FILL' ${isActive ? 1 : 0}`,
                          }}
                        >
                          {cat.icon}
                        </span>
                        <span className="relative z-10">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </div>

            {/* RIGHT SIDE: Minimal luxury controls */}
            <div className="w-full md:w-auto flex items-center gap-2.5 md:gap-3 shrink-0">
              
              {/* Sort Dropdown */}
              <div className="relative flex-1 md:flex-initial">
                <button
                  onClick={() => {
                    setSortDropdownOpen(!sortDropdownOpen);
                    setFilterPanelOpen(false);
                  }}
                  className="w-full md:w-auto flex items-center justify-center md:justify-start gap-1.5 px-4 h-9.5 md:h-9 rounded-full border font-body text-[10px] md:text-[11px] tracking-[0.14em] uppercase text-espresso/70 bg-cream-glass/40 hover:bg-[#C9A74D]/5 active:scale-95 transition-all duration-300 cursor-pointer"
                  style={{
                    borderColor: "rgba(201, 167, 77, 0.22)",
                    color: "rgba(90, 58, 44, 0.72)",
                  }}
                >
                  <span>{
                    sortMode === "featured" ? "Featured" :
                    sortMode === "price-low-high" ? "Price: Low to High" :
                    sortMode === "price-high-low" ? "Price: High to Low" : "Name A–Z"
                  }</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
                      <motion.div
                        className="absolute left-0 md:right-0 md:left-auto mt-2 w-[180px] z-50 rounded-2xl border bg-[#FDF6F0]/98 backdrop-blur-md p-2"
                        style={{
                          borderColor: "rgba(201, 167, 77, 0.16)",
                          boxShadow: "0 10px 30px rgba(42,26,20,0.08)",
                        }}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
                            className="w-full text-left px-4 py-2.5 rounded-xl font-body text-[11px] tracking-[0.05em] transition-all duration-200 cursor-pointer"
                            style={{
                              color: sortMode === opt.value ? "#8B3A5E" : "rgba(90,58,44,0.6)",
                              backgroundColor: sortMode === opt.value ? "rgba(176,96,128,0.06)" : "transparent",
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

              {/* Filter Toggle Button */}
              <button
                onClick={() => {
                  setFilterPanelOpen(!filterPanelOpen);
                  setSortDropdownOpen(false);
                }}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 h-9.5 md:h-9 rounded-full border font-body text-[10px] md:text-[11px] tracking-[0.14em] uppercase text-espresso/70 bg-cream-glass/40 hover:bg-[#C9A74D]/5 active:scale-95 transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: filterPanelOpen ? "rgba(176,96,128,0.4)" : "rgba(201, 167, 77, 0.22)",
                  background: filterPanelOpen ? "rgba(176,96,128,0.05)" : "rgba(255,252,247,0.35)",
                  color: filterPanelOpen ? "#8B3A5E" : "rgba(90, 58, 44, 0.72)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Filter</span>
              </button>

            </div>
          </div>

          {/* Expandable Slide-down Filter Drawer Panel */}
          <AnimatePresence>
            {filterPanelOpen && (
              <motion.div
                className="border-t overflow-hidden"
                style={{
                  borderColor: "rgba(201,167,77,0.10)",
                  background: "rgba(253,246,240,0.96)",
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="max-w-[1280px] mx-auto px-6 md:px-[72px] py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Price Range Filter Pills */}
                  <div className="flex flex-col gap-2">
                    <span className="font-body text-[9px] tracking-[0.16em] uppercase text-[#8A6A5A]/60 font-semibold mb-1">
                      Filter by Price
                    </span>
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
                            className="px-4 h-8 rounded-full font-body text-[10px] tracking-[0.06em] uppercase transition-all duration-300 focus:outline-none cursor-pointer"
                            style={{
                              border: isActive ? "1px solid rgba(176,96,128,0.3)" : "1px solid rgba(201,167,77,0.12)",
                              background: isActive 
                                ? "linear-gradient(135deg, rgba(212,140,158,0.1) 0%, rgba(201,167,77,0.1) 100%)" 
                                : "rgba(255,252,247,0.45)",
                              color: isActive ? "#8B3A5E" : "rgba(90,58,44,0.6)",
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset Button / Info */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    {priceFilter !== "all-prices" && (
                      <button
                        onClick={() => setPriceFilter("all-prices")}
                        className="font-body text-[10px] tracking-[0.12em] uppercase text-[#8B3A5E] hover:underline underline-offset-4 focus:outline-none transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                    
                    <div className="font-body text-[10px] tracking-[0.08em] text-[#8A6A5A]/50 select-none">
                      Showing {visibleProducts.length} product{visibleProducts.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="w-full">
        <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-4 md:py-6">
          <div 
            className="w-full rounded-[24px] bg-[rgba(255,250,247,0.45)] px-4 md:px-6 py-4 border"
            style={{
              borderColor: "rgba(201,167,77,0.15)",
              boxShadow: "0 4px 20px rgba(42,26,20,0.03)",
            }}
          >
            <div className="flex items-center justify-around gap-3 md:gap-6 overflow-x-auto no-scrollbar">
              {trustBadges.map((badge, i) => (
                <div key={badge.label} className="flex items-center gap-2 shrink-0 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: i % 2 === 0 ? "rgba(176,96,128,0.1)" : "rgba(201,167,77,0.1)",
                      border: "1px solid " + (i % 2 === 0 ? "rgba(176,96,128,0.2)" : "rgba(201,167,77,0.2)") }}>
                    <span className="material-symbols-outlined text-[16px]"
                      style={{ color: i % 2 === 0 ? "#B06080" : "#8A6A00", fontVariationSettings: "'FILL' 1" }}>
                      {badge.icon}
                    </span>
                  </div>
                  <span className="font-body text-[10px] md:text-[11px] tracking-[0.08em] text-[#5A3A2C]/65 whitespace-nowrap uppercase">
                    {badge.label}
                  </span>
                  {i < trustBadges.length - 1 && (
                    <div className="ml-1 md:ml-3 w-px h-4 shrink-0" style={{ background: "rgba(138,106,90,0.15)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Thin ornamental divider */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-[72px]">
        <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,167,77,0.25) 30%, rgba(201,167,77,0.25) 70%, transparent)" }} />
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-8 md:py-12">
        <AnimatePresence mode="wait">
          {visibleProducts.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-24 gap-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(176,96,128,0.08)", border: "1px solid rgba(176,96,128,0.18)" }}>
                <span className="material-symbols-outlined text-[32px] text-[#B06080]/50">search_off</span>
              </div>
              <div className="text-center">
                <p className="font-display text-[22px] text-[#2A1A14]/70 mb-2">No rituals found</p>
                <p className="font-body text-[14px] text-[#8A6A5A]/60">Try a different keyword or browse all categories</p>
              </div>
              <button
                onClick={() => { setSearchTerm(""); setPriceFilter("all-prices"); router.push("/products", { scroll: false }); }}
                className="px-6 py-2.5 rounded-full font-body text-[12px] tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #B06080, #8A4060)", color: "#fff", boxShadow: "0 4px 16px rgba(176,96,128,0.25)" }}
              >
                Browse All Products
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${sortMode}-${priceFilter}-${searchTerm}`}
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {visibleProducts.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <ProductCard
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
