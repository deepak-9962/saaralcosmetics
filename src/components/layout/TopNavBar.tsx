"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";

export default function TopNavBar() {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 w-full z-50"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E8E0D5",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
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
          {["Shop", "Collections", "Heritage", "Rituals"].map((label) => (
            <Link
              key={label}
              href={
                label === "Shop" || label === "Collections"
                  ? "/products"
                  : "/contact"
              }
              className="nav-link-underline text-on-surface-variant font-body hover:text-on-surface transition-colors"
              style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.04em" }}
            >
              {label}
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 flex items-center justify-center rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#C9A96E",
                }}
              />
            )}
          </Link>
          <button
            className="hidden md:flex p-2 hover:bg-surface-container-high/50 rounded-full transition-colors"
            aria-label="Account"
          >
            <span
              className="material-symbols-outlined text-on-surface"
              style={{ fontSize: "24px" }}
            >
              person
            </span>
          </button>

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
              {["Shop", "Collections", "Heritage", "Rituals"].map((label) => (
                <Link
                  key={label}
                  href={
                    label === "Shop" || label === "Collections"
                      ? "/products"
                      : "/contact"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body"
                  style={{ fontSize: "15px", fontWeight: 500 }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
