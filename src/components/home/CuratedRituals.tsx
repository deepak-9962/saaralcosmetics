"use client";

import Link from "next/link";
import RitualCard, { type RitualItem } from "./RitualCard";
import FadeIn from "@/components/layout/FadeIn";
import type { HomepageCategory } from "@/lib/types";

/* ─────────────────────────────────────────────
   CURATED RITUALS DATA — EXACT REFERENCE LAYOUT
   1. Face Wash    (Cleanse & Refresh) - Pastel Blue #EEF4FD
   2. Soaps        (Purify & Soften)   - Pastel Peach #FDF2EA
   3. Herbal Care  (Heritage Ritual)   - Pastel Cream #FAF4E6
   4. Creams       (Nourish & Restore) - Pastel Sage  #EEF8F1
───────────────────────────────────────────── */
const defaultRituals: RitualItem[] = [
  {
    id: "face-wash",
    name: "Face Wash",
    subtitle: "CLEANSE & REFRESH",
    image: "/images/head-facewash-duo.webp",
    href: "/products?category=face-wash",
    bg: "#EEF4FD",
    icon: "spa",
  },
  {
    id: "soaps",
    name: "Soaps",
    subtitle: "PURIFY & SOFTEN",
    image: "/images/cat-soap.webp",
    href: "/products?category=soap",
    bg: "#FDF2EA",
    icon: "water_drop",
  },
  {
    id: "herbal-care",
    name: "Herbal Care",
    subtitle: "HERITAGE RITUAL",
    image: "/images/cat-nalangu-maavu.webp",
    href: "/products?category=nalangu-maavu",
    bg: "#FAF4E6",
    icon: "local_florist",
  },
  {
    id: "creams",
    name: "Creams",
    subtitle: "NOURISH & RESTORE",
    image: "/images/cat-face-cream.webp",
    href: "/products?category=face-cream",
    bg: "#EEF8F1",
    icon: "auto_awesome",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

interface CuratedRitualsProps {
  categories?: HomepageCategory[];
}

export default function CuratedRituals({ categories = [] }: CuratedRitualsProps) {
  // Use curated 4-card collection matching the reference design
  const displayRituals: RitualItem[] = defaultRituals;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "#ffffff",
        padding: "72px 0 88px",
      }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px]">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14 gap-6">
          <FadeIn
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="label-caps text-[#C9A74D]">Shop By Category</span>
            </div>

            {/* Headline */}
            <h2
              className="font-display text-[#2A1A14]"
              style={{
                fontSize: "clamp(34px, 4.5vw, 56px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              Curated{" "}
              <em style={{ fontStyle: "italic", color: "#B06080" }}>Rituals</em>
            </h2>
          </FadeIn>

          <FadeIn
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="flex flex-col gap-2.5"
          >
            <p
              className="font-body text-[#5A3A2C]/65 text-[14px] leading-relaxed md:text-right"
              style={{ maxWidth: "320px" }}
            >
              Discover formulations crafted for every stage of your skincare ritual.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 label-caps text-[#B06080] hover:gap-3 transition-all duration-300 group self-start md:self-end"
            >
              View All Products
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </Link>
          </FadeIn>
        </div>

        {/* ── Desktop Grid: 4 horizontal cards in a single row ── */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {displayRituals.map((ritual, i) => (
            <RitualCard key={ritual.id} ritual={ritual} index={i} />
          ))}
        </div>

        {/* ── Mobile: horizontal swipe scroll snap ── */}
        <div className="md:hidden -mx-5 px-5 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3.5 pb-2">
          {displayRituals.map((ritual, i) => (
            <div
              key={ritual.id}
              className="snap-center shrink-0"
              style={{ width: "82vw", maxWidth: "340px" }}
            >
              <RitualCard ritual={ritual} index={i} />
            </div>
          ))}
        </div>

        {/* ── Bottom Editorial Trust Bar (Matching Reference Screenshot) ── */}
        <FadeIn
          className="mt-12 md:mt-16 pt-8 border-t border-black/[0.05] flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, delay: 0.25, ease }}
        >
          {[
            { icon: "spa", label: "100% Natural" },
            { icon: "pets", label: "Cruelty Free" },
            { icon: "handyman", label: "Handmade" },
            { icon: "eco", label: "Ethically Sourced" },
          ].map((item, idx) => (
            <div key={item.label} className="flex items-center gap-4 sm:gap-6 md:gap-10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(176,96,128,0.12)",
                    border: "1px solid rgba(176,96,128,0.22)",
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ color: "#B06080" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span
                  className="font-body text-[11px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase"
                  style={{ color: "#4A2F25" }}
                >
                  {item.label}
                </span>
              </div>

              {/* Vertical divider line between items (except last) */}
              {idx < 3 && (
                <div className="hidden sm:block w-px h-4 bg-black/10 shrink-0" />
              )}
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
