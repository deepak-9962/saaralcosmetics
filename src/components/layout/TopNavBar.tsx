"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const prevScrollY = useRef(0);
  const scrolledRef = useRef(false);
  const collapsedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentSearch = isMounted && typeof window !== "undefined" ? window.location.search : "";

  const isAdminRoute = pathname.startsWith("/admin");
  const showPromoBar = !isAdminRoute;
  const showMobileSearch = !isAdminRoute && (pathname === "/" || pathname.startsWith("/products"));
  const drawerTop = showPromoBar ? (showMobileSearch ? 148 : 100) : 68;

  useEffect(() => {
    // Sync initial scroll state on mount
    const initScrollY = window.scrollY;
    scrolledRef.current = initScrollY > 20;
    prevScrollY.current = initScrollY;

    if (navRef.current) {
      if (scrolledRef.current) {
        navRef.current.classList.remove("bg-white/70", "border-transparent");
        navRef.current.classList.add("bg-white/95", "shadow-lg", "backdrop-blur-lg", "border-b", "border-outline-variant");
      } else {
        navRef.current.classList.add("bg-white/70", "border-transparent");
        navRef.current.classList.remove("bg-white/95", "shadow-lg", "backdrop-blur-lg", "border-b", "border-outline-variant");
      }
    }

    if (searchBarRef.current) {
      collapsedRef.current = false;
      searchBarRef.current.classList.remove("search-bar-collapsed");
      searchBarRef.current.classList.add("search-bar-expanded");
    }

    const handleScroll = () => {
      const latest = window.scrollY;

      // 1. Scrolled styling for Navbar
      if (navRef.current) {
        const isScrolled = latest > 20;
        if (isScrolled !== scrolledRef.current) {
          scrolledRef.current = isScrolled;
          if (isScrolled) {
            navRef.current.classList.remove("bg-white/70", "border-transparent");
            navRef.current.classList.add("bg-white/95", "shadow-lg", "backdrop-blur-lg", "border-b", "border-outline-variant");
          } else {
            navRef.current.classList.add("bg-white/70", "border-transparent");
            navRef.current.classList.remove("bg-white/95", "shadow-lg", "backdrop-blur-lg", "border-b", "border-outline-variant");
          }
        }
      }

      // 2. Search bar collapsing styling
      if (searchBarRef.current && showMobileSearch) {
        const diff = latest - prevScrollY.current;
        if (diff > 8) {
          // Scrolling down - hide search bar
          if (!collapsedRef.current) {
            collapsedRef.current = true;
            searchBarRef.current.classList.add("search-bar-collapsed");
            searchBarRef.current.classList.remove("search-bar-expanded");
          }
        } else if (diff < -8) {
          // Scrolling up - show search bar
          if (collapsedRef.current) {
            collapsedRef.current = false;
            searchBarRef.current.classList.remove("search-bar-collapsed");
            searchBarRef.current.classList.add("search-bar-expanded");
          }
        }
      }

      prevScrollY.current = latest;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showMobileSearch]);

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
      className="sticky top-0 w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-transparent"
    >
      {showPromoBar && (
        <div className="h-6 bg-primary text-on-primary px-4 flex items-center justify-center">
          <p className="font-body text-[10px] tracking-[0.08em] uppercase text-center">
            Product of the month: use code <strong>HURRY20</strong> for 20% off
          </p>
        </div>
      )}

      <div className="flex justify-between items-center h-[56px] md:h-[68px] px-4 md:px-16 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>

          <Link
            href="/"
            className="font-display text-on-surface tracking-tight"
            style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 600 }}
          >
            Saaral
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
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
          <Link
            href="/products"
            className="inline-flex items-center p-2 hover:bg-surface-container-high/50 rounded-full transition-colors"
            aria-label="Search products"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              search
            </span>
          </Link>

          <Link
            href="/wishlist"
            className={`relative hidden md:inline-flex p-2 rounded-full transition-colors ${
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
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </motion.span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex items-center p-2 hover:bg-surface-container-high/50 rounded-full transition-colors"
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
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {itemCount > 9 ? "9+" : itemCount}
              </motion.span>
            )}
          </Link>

          <Link
            href="/admin"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-colors"
            aria-label="Admin login"
          >
            <span className="material-symbols-outlined text-[20px]">
              admin_panel_settings
            </span>
            <span className="font-body text-[13px] tracking-[0.04em]">Admin</span>
          </Link>
        </div>
      </div>

      {showMobileSearch && (
        <div
          ref={searchBarRef}
          className="md:hidden border-t border-outline-variant/30 px-4 pb-3 overflow-hidden search-bar-transition search-bar-expanded"
        >
          <Link
            href="/products"
            className="h-10 mt-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center gap-2 px-3 text-on-surface-variant"
            aria-label="Browse products"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span className="font-body text-[15px]">Search products, rituals, ingredients</span>
          </Link>
        </div>
      )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute left-0 right-0 bg-surface-container-low border-b border-outline-variant/40 shadow-lg z-50"
            style={{ top: `${drawerTop}px` }}
          >
            <div className="flex flex-col px-5 py-4 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3 rounded-lg transition-colors font-body ${
                    isActive(item.href)
                      ? "text-primary bg-primary-container/30"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                  style={{ fontSize: "15px", fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-outline-variant/40 mt-2 pt-2">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 rounded-lg transition-colors font-body text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-2"
                  style={{ fontSize: "15px", fontWeight: 500 }}
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  Wishlist
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
