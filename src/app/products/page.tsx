"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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

const trustBadges = [
  { icon: "spa", label: "100% Natural" },
  { icon: "pets", label: "Cruelty Free" },
  { icon: "science", label: "Sulphate Free" },
  { icon: "handyman", label: "Handmade" },
  { icon: "verified", label: "Dermatologically Tested" },
];

/* ── Floating botanical SVG decoration ── */
function FloatingBotanical() {
  return (
    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layered glow blob */}
      <div className="absolute top-1/2 right-[-8%] -translate-y-1/2 w-[520px] h-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(176,96,128,0.18) 0%, rgba(201,167,77,0.08) 50%, transparent 70%)", filter: "blur(60px)" }} />
      {/* Cream circle frame */}
      <div className="absolute top-1/2 right-[4%] -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-[#C9A74D]/20"
        style={{ boxShadow: "0 0 80px rgba(201,167,77,0.08), inset 0 0 60px rgba(176,96,128,0.04)" }} />
      {/* Inner ring */}
      <div className="absolute top-1/2 right-[4%] -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-[#B06080]/12" />
      {/* Decorative botanical SVG */}
      <svg className="absolute top-1/2 right-[6%] -translate-y-1/2 w-[320px] h-[320px] opacity-[0.09]"
        viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" stroke="#B06080" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" stroke="#C9A74D" strokeWidth="0.7" strokeDasharray="4 3" />
        <path d="M100 20 C100 20 80 60 100 100 C120 60 100 20 100 20Z" stroke="#B06080" strokeWidth="1.5" />
        <path d="M20 100 C20 100 60 80 100 100 C60 120 20 100 20 100Z" stroke="#C9A74D" strokeWidth="1.5" />
        <path d="M180 100 C180 100 140 80 100 100 C140 120 180 100 180 100Z" stroke="#B06080" strokeWidth="1" />
        <path d="M100 180 C100 180 80 140 100 100 C120 140 100 180 100 180Z" stroke="#C9A74D" strokeWidth="1" />
        <path d="M147 53 C147 53 120 80 100 100 C130 108 147 53 147 53Z" stroke="#7E6B9A" strokeWidth="1" />
        <path d="M53 53 C53 53 80 80 100 100 C70 108 53 53 53 53Z" stroke="#7E6B9A" strokeWidth="1" />
        <circle cx="100" cy="100" r="8" fill="#C9A74D" opacity="0.3" />
        <circle cx="100" cy="100" r="4" fill="#B06080" opacity="0.5" />
      </svg>
      {/* Floating ingredient dots */}
      {[
        { top: "18%", right: "18%", size: 10, color: "rgba(201,167,77,0.45)", delay: "0s" },
        { top: "72%", right: "28%", size: 7, color: "rgba(176,96,128,0.45)", delay: "1.2s" },
        { top: "35%", right: "8%", size: 6, color: "rgba(126,107,154,0.45)", delay: "0.6s" },
        { top: "58%", right: "6%", size: 9, color: "rgba(201,167,77,0.35)", delay: "1.8s" },
        { top: "82%", right: "16%", size: 5, color: "rgba(176,96,128,0.35)", delay: "0.9s" },
      ].map((dot, i) => (
        <div key={i} className="absolute rounded-full animate-bubble-1"
          style={{ top: dot.top, right: dot.right, width: dot.size, height: dot.size,
            background: dot.color, animationDelay: dot.delay, filter: "blur(1px)" }} />
      ))}
      {/* Botanical text label */}
      <div className="absolute bottom-[15%] right-[10%] flex flex-col items-end gap-1">
        <div className="w-6 h-px bg-[#C9A74D]/40" />
        <span className="font-body text-[9px] tracking-[0.22em] text-[#8A6A5A]/50 uppercase">Botanical Formulas</span>
      </div>
    </div>
  );
}

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
  const [searchFocused, setSearchFocused] = useState(false);

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
      if (!normalizedSearch) return true;
      const haystack = `${product.name} ${product.category} ${product.variant_name} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
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
  }, [priceFilter, products, searchTerm, sortMode]);

  const activeCategoryLabel = CATEGORIES.find((cat) => cat.slug === activeCategory)?.label ?? "All";

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#FDF6F0" }}>
      <GradientBackground />
      {/* Fine grain texture overlay */}
      <div className="fixed inset-0 -z-[5] pointer-events-none opacity-[0.022]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px" }} />
      <TopNavBar />

      <main className="flex-grow w-full overflow-x-hidden pb-24 md:pb-0">

        {/* ── HERO SECTION ── */}
        <section className="relative w-full overflow-hidden" style={{ minHeight: "clamp(320px, 48vh, 500px)" }}>
          {/* Warm ivory radial glow behind hero text */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 90% at 30% 50%, rgba(249,232,219,0.9) 0%, rgba(253,246,240,0.6) 55%, transparent 100%)" }} />
          {/* Fine horizontal lines for texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #B06080 0px, #B06080 1px, transparent 1px, transparent 48px)" }} />

          <FloatingBotanical />

          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px] pt-20 md:pt-32 pb-10 md:pb-14">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="font-body text-[#C9A74D] text-[11px] tracking-[0.22em] uppercase font-medium">
                Saaral Cosmetics
              </span>
            </motion.div>

            <div className="lg:max-w-[55%]">
              <motion.h1
                className="font-display text-[#2A1A14] mb-4"
                style={{ fontSize: "clamp(40px, 5.5vw, 76px)", lineHeight: 1.06, letterSpacing: "-0.025em" }}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Best Sellers
              </motion.h1>

              <motion.p
                className="font-body mb-3"
                style={{ fontSize: "clamp(13px, 1.4vw, 16px)", letterSpacing: "0.18em", color: "rgba(176,96,128,0.8)" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                Authentic &nbsp;·&nbsp; Transparent &nbsp;·&nbsp; Sustainable
              </motion.p>

              <motion.p
                className="font-body text-[#5A3A2C]/65 leading-relaxed"
                style={{ fontSize: "clamp(13px, 1.2vw, 15px)", maxWidth: "44ch" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                Discover handcrafted herbal skincare rituals inspired by nature and traditional wellness.
              </motion.p>
            </div>

            {/* ── Premium Search Bar ── */}
            <motion.div
              className="mt-8 lg:max-w-[55%]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative group">
                {/* Animated glow ring on focus */}
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
                  <span className="material-symbols-outlined pl-5 text-[22px] shrink-0 transition-colors duration-300"
                    style={{ color: searchFocused ? "#B06080" : "rgba(138,106,90,0.55)" }}>
                    search
                  </span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search skincare rituals, herbal products, ingredients..."
                    className="w-full bg-transparent pl-4 pr-5 py-4 font-body text-[15px] text-[#2A1A14] placeholder:text-[#8A6A5A]/45 focus:outline-none"
                    style={{ caretColor: "#B06080" }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="mr-4 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[#B06080]/10"
                      style={{ color: "rgba(138,106,90,0.6)" }}
                      aria-label="Clear search"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(253,246,240,0.6))" }} />
        </section>

        {/* ── FILTER & CATEGORY SECTION ── */}
        <motion.section
          className="sticky top-[64px] z-30 w-full"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            background: "rgba(253,246,240,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(201,167,77,0.15)",
            boxShadow: "0 4px 32px rgba(42,26,20,0.05), 0 1px 0 rgba(255,255,255,0.65) inset",
          }}>

            {/* ── Category chips row — NO overflow-hidden wrapper, padding on scroll container ── */}
            <div
              className="overflow-x-auto no-scrollbar"
              style={{ paddingTop: "14px", paddingBottom: "10px", paddingLeft: "20px", paddingRight: "20px" }}
            >
              <div className="hidden md:block" style={{ maxWidth: "1136px", margin: "0 auto", paddingLeft: "52px", paddingRight: "52px" }}>
                <LayoutGroup id="chips-desktop">
                  <div className="flex items-center gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          const nextUrl = cat.slug === "all" ? "/products" : `/products?category=${cat.slug}`;
                          router.push(nextUrl);
                        }}
                        className="relative flex items-center gap-1.5 whitespace-nowrap font-body text-[11px] tracking-[0.1em] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B06080]/50 focus-visible:ring-offset-1"
                        style={{
                          height: "34px",
                          padding: "0 16px",
                          borderRadius: "17px",
                          border: isActive ? "1.5px solid transparent" : "1.5px solid rgba(138,106,90,0.22)",
                          background: isActive ? "transparent" : "rgba(255,250,247,0.7)",
                          color: isActive ? "#fff" : "rgba(90,58,44,0.72)",
                          fontWeight: isActive ? 600 : 500,
                          letterSpacing: isActive ? "0.12em" : "0.1em",
                          transition: "color 0.22s ease, border-color 0.22s ease, font-weight 0.22s ease",
                          boxShadow: isActive ? "0 2px 10px rgba(176,96,128,0.22)" : "none",
                        }}
                      >
                        {/* Sliding active background — shared layout magic */}
                        {isActive && (
                          <motion.span
                            layoutId="chip-active-bg-desktop"
                            className="absolute inset-0"
                            style={{
                              borderRadius: "17px",
                              background: "linear-gradient(135deg, #B06080 0%, #8B3A5E 100%)",
                              boxShadow: "0 2px 12px rgba(176,96,128,0.32), inset 0 1px 0 rgba(255,255,255,0.2)",
                            }}
                            initial={false}
                            transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.9 }}
                          />
                        )}
                        <span
                          className="relative z-10 material-symbols-outlined"
                          style={{
                            fontSize: "13px",
                            color: isActive ? "rgba(255,255,255,0.88)" : "rgba(176,96,128,0.7)",
                            fontVariationSettings: `'FILL' ${isActive ? 1 : 0}`,
                            transition: "color 0.22s ease",
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

              <LayoutGroup id="chips-mobile">
                <div className="flex md:hidden items-center gap-2" style={{ width: "max-content", minWidth: "100%" }}>
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        const nextUrl = cat.slug === "all" ? "/products" : `/products?category=${cat.slug}`;
                        router.push(nextUrl);
                      }}
                      className="relative flex items-center gap-1.5 whitespace-nowrap font-body text-[11px] tracking-[0.1em] uppercase shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B06080]/50 focus-visible:ring-offset-1"
                      style={{
                        height: "34px",
                        padding: "0 14px",
                        borderRadius: "17px",
                        border: isActive ? "1.5px solid transparent" : "1.5px solid rgba(138,106,90,0.22)",
                        background: isActive ? "transparent" : "rgba(255,250,247,0.7)",
                        color: isActive ? "#fff" : "rgba(90,58,44,0.72)",
                        fontWeight: isActive ? 600 : 500,
                        letterSpacing: isActive ? "0.12em" : "0.1em",
                        transition: "color 0.22s ease, border-color 0.22s ease",
                        boxShadow: isActive ? "0 2px 10px rgba(176,96,128,0.22)" : "none",
                      }}
                    >
                      {/* Sliding active background — shared layout magic */}
                      {isActive && (
                        <motion.span
                          layoutId="chip-active-bg-mobile"
                          className="absolute inset-0"
                          style={{
                            borderRadius: "17px",
                            background: "linear-gradient(135deg, #B06080 0%, #8B3A5E 100%)",
                            boxShadow: "0 2px 12px rgba(176,96,128,0.32), inset 0 1px 0 rgba(255,255,255,0.2)",
                          }}
                          initial={false}
                          transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.9 }}
                        />
                      )}
                      <span
                        className="relative z-10 material-symbols-outlined"
                        style={{
                          fontSize: "13px",
                          color: isActive ? "rgba(255,255,255,0.88)" : "rgba(176,96,128,0.7)",
                          fontVariationSettings: `'FILL' ${isActive ? 1 : 0}`,
                          transition: "color 0.22s ease",
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

            {/* ── Sort + Price row ── */}
            <div
              className="border-t"
              style={{
                borderColor: "rgba(201,167,77,0.12)",
                paddingTop: "8px",
                paddingBottom: "10px",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              {/* Desktop sort row */}
              <div className="hidden md:block" style={{ maxWidth: "1136px", margin: "0 auto", paddingLeft: "52px", paddingRight: "52px" }}>
                <div className="flex items-center gap-1.5">
                  <span className="font-body text-[10px] tracking-[0.14em] uppercase mr-2" style={{ color: "rgba(138,106,90,0.55)" }}>Sort by</span>
                  {[
                    { label: "Featured", value: "featured" },
                    { label: "Price: Low to High", value: "price-low-high" },
                    { label: "Price: High to Low", value: "price-high-low" },
                    { label: "Name A–Z", value: "name-a-z" },
                  ].map((opt) => {
                    const isActive = sortMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSortMode(opt.value as SortMode)}
                        className="font-body text-[11px] tracking-[0.05em]"
                        style={{
                          height: "28px",
                          padding: "0 12px",
                          borderRadius: "14px",
                          transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                          ...(isActive ? {
                            background: "rgba(176,96,128,0.1)",
                            color: "#8B3A5E",
                            border: "1px solid rgba(176,96,128,0.28)",
                            fontWeight: 600,
                          } : {
                            color: "rgba(90,58,44,0.52)",
                            border: "1px solid transparent",
                            fontWeight: 400,
                          }),
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}

                  {/* Divider */}
                  <div className="mx-3 h-3.5 w-px" style={{ background: "rgba(138,106,90,0.2)" }} />

                  <span className="font-body text-[10px] tracking-[0.14em] uppercase mr-1" style={{ color: "rgba(138,106,90,0.55)" }}>Price</span>
                  {[
                    { label: "All", value: "all-prices" },
                    { label: "Under ₹500", value: "under-500" },
                    { label: "₹500–₹999", value: "500-999" },
                    { label: "₹1000+", value: "1000-plus" },
                  ].map((opt) => {
                    const isActive = priceFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPriceFilter(opt.value as PriceFilter)}
                        className="font-body text-[11px] tracking-[0.05em]"
                        style={{
                          height: "28px",
                          padding: "0 12px",
                          borderRadius: "14px",
                          transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                          ...(isActive ? {
                            background: "rgba(201,167,77,0.12)",
                            color: "#7A5A00",
                            border: "1px solid rgba(201,167,77,0.35)",
                            fontWeight: 600,
                          } : {
                            color: "rgba(90,58,44,0.52)",
                            border: "1px solid transparent",
                            fontWeight: 400,
                          }),
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}

                  {/* Product count */}
                  <div className="ml-auto font-body text-[11px]" style={{ color: "rgba(138,106,90,0.5)" }}>
                    {visibleProducts.length} product{visibleProducts.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Mobile filter trigger */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 font-body text-[11px] tracking-[0.1em] uppercase"
                  style={{
                    height: "32px",
                    borderRadius: "16px",
                    border: "1px solid rgba(138,106,90,0.22)",
                    color: "rgba(90,58,44,0.68)",
                    background: "rgba(255,250,247,0.6)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>tune</span>
                  Filter & Sort
                </button>
                <span className="font-body text-[11px] px-2" style={{ color: "rgba(138,106,90,0.55)" }}>
                  {visibleProducts.length} item{visibleProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

          </div>
        </motion.section>

        {/* ── TRUST BADGES ── */}
        <motion.section
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-5 md:py-6">
            <div className="flex items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar">
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
                  <span className="font-body text-[11px] tracking-[0.08em] text-[#5A3A2C]/65 whitespace-nowrap uppercase">
                    {badge.label}
                  </span>
                  {i < trustBadges.length - 1 && (
                    <div className="ml-1 md:ml-3 w-px h-4 shrink-0" style={{ background: "rgba(138,106,90,0.18)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Thin ornamental divider */}
        <div className="max-w-[1280px] mx-auto px-5 md:px-[72px]">
          <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,167,77,0.25) 30%, rgba(201,167,77,0.25) 70%, transparent)" }} />
        </div>

        {/* ── PRODUCT GRID ── */}
        <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-8 md:py-12">



          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                className="flex flex-col items-center justify-center py-20 gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)" }}>
                  <span className="material-symbols-outlined text-[28px] text-[#ba1a1a]">error</span>
                </div>
                <p className="font-body text-[15px] text-[#ba1a1a] text-center">{error}</p>
              </motion.div>
            )}

            {!error && visibleProducts.length === 0 && (
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
                  onClick={() => { setSearchTerm(""); setPriceFilter("all-prices"); router.push("/products"); }}
                  className="px-6 py-2.5 rounded-full font-body text-[12px] tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #B06080, #8A4060)", color: "#fff", boxShadow: "0 4px 16px rgba(176,96,128,0.25)" }}
                >
                  Browse All Products
                </button>
              </motion.div>
            )}

            {!error && visibleProducts.length > 0 && (
              <motion.div
                key={`${activeCategory}-${sortMode}-${priceFilter}-${searchTerm}`}
                className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                {visibleProducts.map((product, index) => (
                  <motion.div key={product.id} variants={itemVariants}>
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
      </main>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.button
              aria-label="Close filters"
              className="fixed inset-0 z-[90] md:hidden"
              style={{ background: "rgba(42,26,20,0.45)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 inset-x-0 z-[91] md:hidden rounded-t-3xl p-5 pb-10"
              style={{
                background: "rgba(253,246,240,0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid rgba(201,167,77,0.2)",
                boxShadow: "0 -8px 40px rgba(42,26,20,0.08)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(138,106,90,0.3)" }} />
              <h3 className="font-display text-[26px] text-[#2A1A14] mb-6">Sort & Filter</h3>

              <div className="space-y-2 mb-6">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#8A6A5A]/60 mb-3">Sort by</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Featured", value: "featured" },
                    { label: "Price: Low to High", value: "price-low-high" },
                    { label: "Price: High to Low", value: "price-high-low" },
                    { label: "Name A-Z", value: "name-a-z" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortMode(opt.value as SortMode)}
                      className="h-10 rounded-xl font-body text-[12px] transition-all duration-200 active:scale-95"
                      style={sortMode === opt.value ? {
                        background: "rgba(176,96,128,0.12)",
                        color: "#B06080",
                        border: "1.5px solid rgba(176,96,128,0.35)",
                      } : {
                        color: "rgba(90,58,44,0.6)",
                        border: "1px solid rgba(138,106,90,0.25)",
                        background: "rgba(255,250,247,0.5)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#8A6A5A]/60 mb-3">Price Range</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "All Prices", value: "all-prices" },
                    { label: "Under ₹500", value: "under-500" },
                    { label: "₹500–₹999", value: "500-999" },
                    { label: "₹1000+", value: "1000-plus" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPriceFilter(opt.value as PriceFilter)}
                      className="h-10 rounded-xl font-body text-[12px] transition-all duration-200 active:scale-95"
                      style={priceFilter === opt.value ? {
                        background: "rgba(201,167,77,0.12)",
                        color: "#8A6A00",
                        border: "1.5px solid rgba(201,167,77,0.4)",
                      } : {
                        color: "rgba(90,58,44,0.6)",
                        border: "1px solid rgba(138,106,90,0.25)",
                        background: "rgba(255,250,247,0.5)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFiltersOpen(false)}
                className="mt-7 w-full h-12 rounded-full font-body text-[12px] tracking-[0.12em] uppercase font-semibold transition-all duration-300 active:scale-95"
                style={{ background: "linear-gradient(135deg, #B06080, #8A4060)", color: "#fff", boxShadow: "0 4px 20px rgba(176,96,128,0.3)" }}
              >
                Apply Filters
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
        <div className="min-h-[100dvh] flex flex-col" style={{ background: "#FDF6F0" }}>
          <GradientBackground />
          <TopNavBar />
          <main className="flex-grow max-w-[1280px] mx-auto px-5 md:px-[72px] pt-32 pb-12 w-full">
            {/* Skeleton loader */}
            <div className="mb-8">
              <div className="h-14 w-64 rounded-2xl mb-4 animate-pulse" style={{ background: "rgba(176,96,128,0.08)" }} />
              <div className="h-4 w-48 rounded-full animate-pulse" style={{ background: "rgba(176,96,128,0.06)" }} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-[4/5] rounded-2xl animate-pulse" style={{ background: "rgba(176,96,128,0.07)", animationDelay: `${i * 80}ms` }} />
                  <div className="h-4 w-3/4 rounded-full animate-pulse" style={{ background: "rgba(176,96,128,0.06)", animationDelay: `${i * 80 + 40}ms` }} />
                  <div className="h-3 w-1/2 rounded-full animate-pulse" style={{ background: "rgba(176,96,128,0.05)", animationDelay: `${i * 80 + 80}ms` }} />
                </div>
              ))}
            </div>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
