"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/types";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCH_CHIPS = [
  "Butterfly Pea",
  "Red Wine Soap",
  "Nalangu Maavu",
  "Foot Balm",
  "Vetpalai Soap",
  "Face Wash",
  "Activated Charcoal",
];

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when closed
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch initial popular products once when first opened
  useEffect(() => {
    if (isOpen && popularProducts.length === 0) {
      fetch("/api/products/search?limit=6")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.products)) {
            setPopularProducts(data.products);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, popularProducts.length]);

  // Live debounced search
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}&limit=10`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(Array.isArray(data.products) ? data.products : []);
          setHasSearched(true);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setResults([]);
            setHasSearched(true);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, isOpen]);

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* ── 1. Subtle Dark Translucent Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A0E0A]/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* ── 2. Premium Right-Side Search Drawer ── */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Product Search"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full sm:w-[460px] md:w-[480px] lg:w-[42vw] max-w-[540px] h-full flex flex-col bg-[#FDF6F0] shadow-2xl border-l border-[#C9A74D]/25"
          >
            {/* ── Header: Title & Close Button ── */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#C9A74D]/15">
              <div className="flex items-center gap-2">
                <span className="font-display italic text-[#B06080] text-[20px] font-bold">
                  Saaral Search
                </span>
                <span className="text-[#C9A74D] text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#C9A74D]/10">
                  Live
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/70 hover:bg-[#B06080]/10 text-on-surface hover:text-[#B06080] transition-colors border border-outline-variant/30 active:scale-95 cursor-pointer"
                aria-label="Close search drawer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* ── Search Input Bar (Sticky at Top) ── */}
            <div className="px-5 py-3.5 border-b border-[#C9A74D]/15 bg-[#FDF6F0]/90 backdrop-blur-xs">
              <div className="relative flex items-center bg-white border border-[#C9A74D]/30 rounded-2xl px-3.5 py-2.5 focus-within:border-[#B06080] focus-within:ring-2 focus-within:ring-[#B06080]/15 shadow-xs transition-all">
                <span className="material-symbols-outlined text-[#8A6A00] text-[22px] shrink-0 mr-2.5 select-none">
                  search
                </span>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search formulations, soaps, oils, ingredients..."
                  className="w-full bg-transparent font-body text-[14px] sm:text-[15px] text-[#2A1A14] placeholder:text-[#2A1A14]/40 focus:outline-none"
                  autoComplete="off"
                  spellCheck="false"
                />

                {/* Loading indicator or Clear button */}
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#B06080]/30 border-t-[#B06080] rounded-full animate-spin shrink-0 ml-2" />
                ) : query.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[12px] font-bold text-[#B06080] hover:text-[#9C4B6C] px-2 py-0.5 rounded-md hover:bg-[#B06080]/10 transition-colors shrink-0 cursor-pointer"
                    aria-label="Clear search query"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {/* ── Scrollable Results / Content Area ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 overscroll-contain">
              {/* STATE 1: Empty Query — Show Popular Searches and Trending Products */}
              {query.trim().length === 0 ? (
                <div className="space-y-6">
                  {/* Popular search chips */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[#C9A74D] text-[12px]">✦</span>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8A6A00]">
                        Popular Searches
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCH_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleChipClick(chip)}
                          className="px-3.5 py-1.5 rounded-full text-[12.5px] font-body bg-white border border-[#C9A74D]/25 text-[#2A1A14] hover:border-[#B06080] hover:text-[#B06080] hover:bg-[#B06080]/5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending products preview */}
                  {popularProducts.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8A6A00] mb-3">
                        Featured Formulations
                      </h3>
                      <div className="divide-y divide-outline-variant/15">
                        {popularProducts.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3.5 py-3 group hover:bg-[#B06080]/[0.04] px-2 -mx-2 rounded-xl transition-colors"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#C9A74D]/20 bg-[#FAF6F0]">
                              <Image
                                src={product.images[0] || "/images/cat-face-cream.webp"}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/cat-face-cream.webp";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-semibold text-[#B06080] uppercase tracking-wider block">
                                {product.category?.replace(/-/g, " ")}
                              </span>
                              <h4 className="font-display font-bold text-[14px] text-[#2A1A14] group-hover:text-[#B06080] transition-colors truncate">
                                {product.name}
                              </h4>
                              <p className="text-[13px] font-extrabold text-[#2A1A14] mt-0.5">
                                ₹{product.price}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-outline/40 group-hover:text-[#B06080] group-hover:translate-x-0.5 transition-all shrink-0">
                              chevron_right
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* STATE 2: Loading State with Skeletons */}
              {isLoading && results.length === 0 && (
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-[#C9A74D]/10 rounded animate-pulse" />
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 p-2 rounded-xl animate-pulse"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#C9A74D]/10 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-16 bg-[#C9A74D]/10 rounded" />
                        <div className="h-4 w-3/4 bg-[#C9A74D]/10 rounded" />
                        <div className="h-3 w-12 bg-[#C9A74D]/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STATE 3: Results Found */}
              {results.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8A6A00]">
                      Products ({results.length})
                    </h3>
                    <span className="text-[11px] text-[#2A1A14]/50">
                      Showing matches for &quot;{query}&quot;
                    </span>
                  </div>

                  <div className="divide-y divide-outline-variant/15">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3.5 py-3 group hover:bg-[#B06080]/[0.05] px-2.5 -mx-2.5 rounded-xl transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#C9A74D]/25 bg-[#FAF6F0] shadow-2xs">
                          <Image
                            src={product.images[0] || "/images/cat-face-cream.webp"}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/cat-face-cream.webp";
                            }}
                          />
                        </div>

                        {/* Product details */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#B06080] uppercase tracking-wider block">
                            {product.category?.replace(/-/g, " ")}
                            {product.variant_name ? ` • ${product.variant_name}` : ""}
                          </span>
                          <h4 className="font-display font-bold text-[14.5px] text-[#2A1A14] group-hover:text-[#B06080] transition-colors truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[14px] font-extrabold text-[#2A1A14]">
                              ₹{product.price}
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <>
                                <span className="text-[12px] text-outline/50 line-through">
                                  ₹{product.compare_price}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  Save ₹{product.compare_price - product.price}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <span className="material-symbols-outlined text-[20px] text-outline/40 group-hover:text-[#B06080] group-hover:translate-x-1 transition-all shrink-0">
                          chevron_right
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* View all in catalog link */}
                  <div className="pt-4 mt-2">
                    <Link
                      href={`/products?search=${encodeURIComponent(query.trim())}`}
                      onClick={onClose}
                      className="w-full py-3 px-4 rounded-xl bg-[#B06080] text-white font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-[#9C4B6C] active:scale-98 transition-all shadow-xs"
                    >
                      <span>View all catalog results for &quot;{query}&quot;</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* STATE 4: Empty State (No Results) */}
              {!isLoading && results.length === 0 && hasSearched && (
                <div className="py-12 px-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#B06080]/10 text-[#B06080] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[28px]">search_off</span>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-display text-[17px] font-bold text-[#2A1A14]">
                      No products found
                    </h4>
                    <p className="text-[13px] text-[#2A1A14]/65 max-w-xs mx-auto font-body">
                      We couldn&apos;t find any formulations matching &quot;{query}&quot;. Try checking for typos or searching a category like soap or face wash.
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6A00] mb-2.5">
                      Suggested searches:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Soap", "Face Wash", "Balm", "Butterfly Pea"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleChipClick(item)}
                          className="px-3 py-1 rounded-full text-[12px] bg-white border border-[#C9A74D]/30 text-[#2A1A14] hover:border-[#B06080] hover:text-[#B06080] transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer: Brand Assurance ── */}
            <div className="px-5 py-3.5 border-t border-[#C9A74D]/15 bg-[#FDF6F0] flex items-center justify-between text-[11px] text-[#2A1A14]/65 font-body">
              <span className="flex items-center gap-1.5">
                <span className="text-[#C9A74D] text-[10px]">✦</span>
                100% Herbal &amp; Ayurvedic
              </span>
              <span>Handcrafted in India</span>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
