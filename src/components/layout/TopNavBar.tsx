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
      style={{
        height: "68px",
      }}
    >
      <div className="flex justify-between items-center h-full px-5 md:px-16 max-w-[1280px] mx-auto">
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-display text-on-surface tracking-tight"
          style={{ fontSize: "28px", fontWeight: 600 }}
        >
          Saaral Cosmetics
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-link-underline font-body transition-colors ${
                isActive(item.href)
                  ? "text-[#C9A96E] after:w-full"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.04em" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Trailing Icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 hover:bg-surface-container-high/50 rounded-full transition-colors"
            aria-label="Shopping cart"
          >
            <span
              className="material-symbols-outlined text-on-surface"
              style={{ fontSize: "24px" }}
            >
              shopping_bag
            </span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A96E] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
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
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              admin_panel_settings
            </span>
            <span className="font-body text-[13px] tracking-[0.04em]">Admin</span>
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[#1A1A1A]" style={{ fontSize: "24px" }}>
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-[68px] left-0 right-0 bg-white border-b border-[#E8E0D5] shadow-lg z-50"
          >
            <div className="flex flex-col px-5 py-4 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3 rounded-lg transition-colors font-body ${
                    isActive(item.href)
                      ? "text-[#C9A96E] bg-surface-container-low"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                  style={{ fontSize: "15px", fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-[#E8E0D5] mt-2 pt-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 rounded-lg transition-colors font-body text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-2"
                  style={{ fontSize: "15px", fontWeight: 500 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    admin_panel_settings
                  </span>
                  Admin Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
