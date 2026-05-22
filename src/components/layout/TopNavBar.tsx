"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/products?category=face-cream" },
  { label: "Heritage", href: "/contact?section=heritage" },
  { label: "Rituals", href: "/contact?section=rituals" },
];

export default function TopNavBar() {
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const prevScrollY = useRef(0);
  const scrolledRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentSearch = isMounted && typeof window !== "undefined" ? window.location.search : "";

  const isAdminRoute = pathname.startsWith("/admin");
  const showPromoBar = !isAdminRoute;

  useEffect(() => {
    const isHomepage = pathname === "/";

    // Sync initial scroll state on mount
    const initScrollY = window.scrollY;
    scrolledRef.current = initScrollY > 20;
    prevScrollY.current = initScrollY;

    if (navRef.current) {
      if (scrolledRef.current) {
        navRef.current.classList.remove("bg-transparent", "bg-[#FDF6F0]/80", "backdrop-blur-none", "border-transparent");
        navRef.current.classList.add("bg-[#FDF6F0]/95", "shadow-lg", "backdrop-blur-xl", "border-b");
      } else {
        navRef.current.classList.add(isHomepage ? "bg-transparent" : "bg-[#FDF6F0]/80", "border-transparent");
        if (isHomepage) {
          navRef.current.classList.add("backdrop-blur-none");
          navRef.current.classList.remove("backdrop-blur-xl");
        } else {
          navRef.current.classList.add("backdrop-blur-xl");
          navRef.current.classList.remove("backdrop-blur-none");
        }
        navRef.current.classList.remove("bg-[#FDF6F0]/95", "shadow-lg", "border-b");
      }
    }

    const handleScroll = () => {
      const latest = window.scrollY;

      // 1. Scrolled styling for Navbar
      if (navRef.current) {
        const isScrolled = latest > 20;
        if (isScrolled !== scrolledRef.current) {
          scrolledRef.current = isScrolled;
          if (isScrolled) {
            navRef.current.classList.remove("bg-transparent", "bg-[#FDF6F0]/80", "backdrop-blur-none", "border-transparent");
            navRef.current.classList.add("bg-[#FDF6F0]/95", "shadow-lg", "backdrop-blur-xl", "border-b");
          } else {
            navRef.current.classList.add(isHomepage ? "bg-transparent" : "bg-[#FDF6F0]/80", "border-transparent");
            if (isHomepage) {
              navRef.current.classList.add("backdrop-blur-none");
              navRef.current.classList.remove("backdrop-blur-xl");
            } else {
              navRef.current.classList.add("backdrop-blur-xl");
              navRef.current.classList.remove("backdrop-blur-none");
            }
            navRef.current.classList.remove("bg-[#FDF6F0]/95", "shadow-lg", "border-b");
          }
        }
      }
      prevScrollY.current = latest;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
    }
  };

  const handleSuggestionClick = (query: string) => {
    setIsSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setSearchVal("");
  };

  const isActive = (href: string) => {
    const [path, queryString] = href.split("?");
    if (pathname !== path) {
      return false;
    }

    const expectedParams = new URLSearchParams(queryString ?? "");
    const currentParams = new URLSearchParams(currentSearch);

    if (expectedParams.size === 0) {
      return currentParams.size === 0;
    }

    for (const [key, value] of expectedParams.entries()) {
      if (currentParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  const wishlistActive = isActive("/wishlist");

  return (
    <nav
      ref={navRef}
      className={
        pathname === "/"
          ? "fixed top-0 w-full z-50 transition-all duration-300 bg-transparent border-transparent"
          : "sticky top-0 w-full z-50 transition-all duration-300 bg-[#FDF6F0]/80 backdrop-blur-xl border-transparent"
      }
      style={{
        borderImage: "linear-gradient(to right, rgba(176,96,128,0.15) 0%, rgba(201,167,77,0.3) 50%, rgba(176,96,128,0.15) 100%) 1"
      }}
    >
      {showPromoBar && (
        <div className="h-6 bg-primary text-on-primary px-4 flex items-center justify-center">
          <p className="font-body text-[10px] tracking-[0.08em] uppercase text-center">
            Product of the month: use code <strong>HURRY20</strong> for 20% off
          </p>
        </div>
      )}

      <div className="relative flex justify-between items-center h-[56px] md:h-[68px] px-4 md:px-16 max-w-[1280px] mx-auto">
        {/* LEFT — Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="md:hidden p-2 flex items-center justify-center cursor-pointer"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>

          <Link
            href="/"
            className="font-display text-on-surface tracking-tight transition-all duration-200 active:scale-98"
            style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 600 }}
          >
            Saaral
          </Link>
        </div>

        {/* CENTER — Nav links (absolute, perfectly centred) */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-link-underline font-body transition-colors ${
                isActive(item.href)
                  ? "text-primary after:w-full"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.04em" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              } else {
                router.push("/products");
              }
            }}
            className="inline-flex items-center p-2 hover:bg-surface-container-high/50 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label="Search products"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              search
            </span>
          </button>

          <Link
            href="/wishlist"
            className={`relative hidden md:inline-flex p-2 rounded-full transition-all duration-200 active:scale-90 ${
              wishlistActive
                ? "text-primary bg-primary-container/30"
                : "text-on-surface hover:bg-surface-container-high/50"
            }`}
            aria-label="Wishlist"
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: `'FILL' ${wishlistActive ? 1 : 0}` }}
            >
              favorite
            </span>
            {wishlistCount > 0 && (
              <motion.span
                key={wishlistCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center ring-1 ring-[#C9A74D]/30"
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </motion.span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex items-center p-2 hover:bg-surface-container-high/50 rounded-full transition-all duration-200 active:scale-90"
            aria-label="Shopping cart"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              shopping_bag
            </span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center ring-1 ring-[#C9A74D]/30"
              >
                {itemCount > 9 ? "9+" : itemCount}
              </motion.span>
            )}
          </Link>

          <Link
            href="/admin"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all duration-200 active:scale-95"
            aria-label="Admin login"
          >
            <span className="material-symbols-outlined text-[20px]">
              admin_panel_settings
            </span>
            <span className="font-body text-[13px] tracking-[0.04em]">Admin</span>
          </Link>
        </div>
      </div>

      {/* ── IMMERSIVE FULL-SCREEN SEARCH PORTAL ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 luxury-gradient-bg flex flex-col p-6 overflow-y-auto grain-overlay"
          >
            {/* Ambient glows */}
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#C9A74D]/10 blur-[90px] pointer-events-none" />

            {/* Header / Close Row */}
            <div className="flex justify-between items-center z-10">
              <span className="font-display italic text-[#B06080] text-[20px]">Saaral Portal</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="h-10 w-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-lowest/80 text-on-surface hover:text-[#B06080] hover:border-[#B06080]/40 transition-all duration-200 active:scale-90 cursor-pointer"
                aria-label="Close search"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Main Input Field Container */}
            <div className="mt-14 z-10">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search formulations, rituals, ingredients..."
                  className="w-full bg-transparent border-b border-outline-variant py-4 pr-12 font-display italic text-[24px] focus:outline-none focus:border-primary text-on-surface placeholder:text-outline/40 transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-on-surface hover:text-[#B06080] cursor-pointer"
                  aria-label="Submit search"
                >
                  <span className="material-symbols-outlined text-[28px]">arrow_forward</span>
                </button>
              </form>
            </div>

            {/* Curated Botanical Suggestions */}
            <div className="mt-12 z-10 flex-grow">
              <p className="label-caps text-[#C9A74D] block mb-4 text-[10px] tracking-[0.15em]">Curated Botanical Queries</p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "Saffron Serum",
                  "Neem & Tulsi Wash",
                  "Turmeric Glow Bar",
                  "Nalangu Maavu",
                  "Face Cream",
                  "Soap"
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSuggestionClick(item)}
                    className="search-suggestion-chip px-4 py-2.5 rounded-full border border-outline-variant/30 bg-surface-container-lowest text-[13px] font-body text-on-surface-variant flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                  >
                    <span className="text-[#C9A74D] text-xs">✦</span>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Brand Stamp */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex justify-between items-center text-outline/50 z-10">
              <span className="font-body text-[10px] uppercase tracking-wider">100% Ayurvedic Wisdom</span>
              <span className="font-body text-[10px] uppercase tracking-wider">Handcrafted in India</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDITORIAL FULL-SCREEN DRAWER MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-0 z-40 luxury-gradient-bg flex flex-col pt-[100px] px-6 pb-8 overflow-y-auto grain-overlay"
          >
            {/* Staggered Links Container */}
            <div className="flex flex-col gap-6 mt-6 flex-grow justify-center pl-4 border-l border-outline-variant/30">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.45 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-display text-[32px] block transition-colors ${
                      isActive(item.href) ? "text-[#B06080] italic font-semibold" : "text-on-surface hover:text-[#B06080]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.07, duration: 0.45 }}
                className="border-t border-outline-variant/20 mt-4 pt-4"
              >
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-display text-[26px] block transition-colors flex items-center gap-2 ${
                    wishlistActive ? "text-[#B06080] italic font-semibold" : "text-on-surface hover:text-[#B06080]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">favorite</span>
                  Wishlist
                </Link>
              </motion.div>
            </div>

            {/* Quick Contacts / Social Shortcuts */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col gap-3 pl-4">
              <span className="font-body text-[11px] uppercase tracking-[0.12em] text-[#C9A74D]">Rituals & Contact</span>
              <div className="flex gap-4 items-center">
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[14px] text-on-surface-variant hover:text-[#B06080] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  WhatsApp Assistance
                </a>
                <span className="text-[#D4B8A8]/30">|</span>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-body text-[14px] text-on-surface-variant hover:text-[#B06080]"
                >
                  Visit Botanical Lab
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
