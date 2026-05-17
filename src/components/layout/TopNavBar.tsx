"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";

const navItems = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/products?category=face-cream" },
  { label: "Heritage", href: "/contact?section=heritage" },
  { label: "Rituals", href: "/contact?section=rituals" },
];

export default function TopNavBar() {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const currentSearch = typeof window !== "undefined" ? window.location.search : "";

  const isAdminRoute = pathname.startsWith("/admin");
  const showPromoBar = !isAdminRoute;
  const showMobileSearch = !isAdminRoute && (pathname === "/" || pathname.startsWith("/products"));
  const drawerTop = showPromoBar ? (showMobileSearch ? 148 : 100) : 68;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

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

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-lg backdrop-blur-lg border-b border-outline-variant"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      {showPromoBar && (
        <div className="h-8 bg-primary text-on-primary px-4 flex items-center justify-center">
          <p className="font-body text-[11px] tracking-[0.08em] uppercase text-center">
            Product of the month: use code <strong>HURRY20</strong> for 20% off
          </p>
        </div>
      )}

      <div className="flex justify-between items-center h-[68px] px-4 md:px-16 max-w-[1280px] mx-auto">
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
            style={{ fontSize: "clamp(26px, 4.5vw, 32px)", fontWeight: 600 }}
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
            className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors"
            aria-label="Search products"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">
              search
            </span>
          </Link>

          <Link
            href="/cart"
            className="relative p-2 hover:bg-surface-container-high/50 rounded-full transition-colors"
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
        <div className="md:hidden border-t border-outline-variant/30 px-4 pb-3">
          <Link
            href="/products"
            className="h-11 mt-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center gap-2 px-3 text-on-surface-variant"
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
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 rounded-lg transition-colors font-body text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-2"
                  style={{ fontSize: "15px", fontWeight: 500 }}
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  My Account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
