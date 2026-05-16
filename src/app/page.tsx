"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { listFeaturedProducts } from "@/lib/supabase/data";
import type { Product } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, delay, ease },
});

const trustSignals = [
  "100% Natural Ingredients", "Cruelty Free", "Ethically Sourced",
  "Handcrafted in India", "No Harmful Chemicals", "Ancient Ayurvedic Wisdom",
];

const categories = [
  { name: "Face Cream", sub: "Nourish & Restore", image: "/images/cat-face-cream.webp", href: "/products?category=face-cream" },
  { name: "Face Wash", sub: "Cleanse & Refresh", image: "/images/cat-face-wash.webp", href: "/products?category=face-wash" },
  { name: "Soap", sub: "Purify & Soften", image: "/images/cat-soap.webp", href: "/products?category=soap" },
  { name: "Nalangu Maavu", sub: "Heritage Ritual", image: "/images/cat-nalangu-maavu.webp", href: "/products?category=nalangu-maavu" },
];

const ingredients = [
  { name: "Turmeric", note: "Ancient Healer", description: "Used for centuries to brighten, soothe inflammation, and restore natural radiance.", icon: "spa", color: "#C9A74D" },
  { name: "Rose", note: "Skin Brightener", description: "Tones, hydrates, and leaves skin with a delicate floral luminosity.", icon: "local_florist", color: "#B06080" },
  { name: "Neem", note: "Anti-bacterial", description: "Nature's purifier — keeps pores clear and skin balanced.", icon: "eco", color: "#4A7C59" },
  { name: "Aloe Vera", note: "Deep Hydrator", description: "Deeply moisturises while calming sensitivity and redness.", icon: "water_drop", color: "#7E6B9A" },
];

/* Scallop arch SVG — 8 wide temple domes, sharp crisp lines */
function ScallopArch() {
  const d = "M0,96 Q90,0 180,96 Q270,0 360,96 Q450,0 540,96 Q630,0 720,96 Q810,0 900,96 Q990,0 1080,96 Q1170,0 1260,96 Q1350,0 1440,96";
  return (
    <div className="w-full overflow-hidden pointer-events-none" style={{ marginTop: "-96px", height: "96px" }} aria-hidden="true">
      <svg viewBox="0 0 1440 96" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "96px" }}>
        {/* Section fill */}
        <path d={d + " L1440,96 L0,96 Z"} fill="#FAF0EE" />
        {/* Rose depth shadow — slightly wider, sharp */}
        <path d={d} fill="none" stroke="#D4A0B0" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
        {/* Gold crisp line — no filter, fully sharp */}
        <path d={d} fill="none" stroke="#C9A74D" strokeWidth="2.2" opacity="1" strokeLinecap="round" />
        {/* Cream inner highlight */}
        <path d={d} fill="none" stroke="#FFF5DC" strokeWidth="0.8" opacity="0.9" strokeLinecap="round" />
      </svg>
    </div>
  );
}


export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  useEffect(() => {
    listFeaturedProducts(3)
      .then(setFeaturedProducts)
      .catch((e) => setProductsError(e instanceof Error ? e.message : "Failed to load products."));
  }, []);

  return (
    <div className="min-h-screen flex flex-col grain-overlay">
      <GradientBackground />
      <TopNavBar />

      <main className="w-full flex-grow">

        {/* ── HERO ── */}
        <section ref={heroRef} className="relative w-full h-screen min-h-[600px] max-h-[1000px] overflow-hidden flex items-end pb-20 md:pb-28">
          <motion.div className="absolute inset-0 scale-110" style={{ y: heroY, opacity: heroOpacity }}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8-bjDTc3Unc9zLxtNxCaE-V4cqQ_GJugaVdFZ7k4KFoHrMZfddDoI9SbnMmFVkUq5GcU29rU0VzWiHa0Zc6oSJCd4GOZ8lF6r1HYEmhwn_5HhPDr0MZacIUBhW-TCLT3JU5SLCvhhiSoamVRGF_gN2MJitxL5Zij1_MYVG0nStfey3fSV6TtXDNFAocfdkKtl_ZpwTp3aRHvH1uSmF9qVXDgU7LZhBZlOL7sqVPPZ0DlfI8dP-8jFoOETvCwKNYFT3WBtNGUCFsxo"
              alt="Saaral Cosmetics — Luxury botanical skincare"
              fill className="object-cover object-center" priority sizes="100vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A05]/80 via-[#2A1208]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A05]/40 via-transparent to-transparent" />

          <div className="relative z-10 w-full px-5 md:px-[72px]">
            <div className="max-w-[1280px] mx-auto">
              <motion.div className="flex items-center gap-3 mb-5" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }}>
                <div className="w-8 h-px bg-[#C9A74D]" />
                <span className="label-caps text-[#C9A74D]">Apothecary Heritage · Tamil Nadu</span>
              </motion.div>
              <div className="overflow-hidden mb-6">
                {["Botanical", "Rituals,", "Rediscovered."].map((word, i) => (
                  <motion.div key={word} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 + i * 0.12, ease }}>
                    <span className="font-display text-white block" style={{ fontSize: "clamp(44px, 7vw, 88px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>{word}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-4" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85, ease }}>
                <p className="font-body text-white/65 text-[15px] leading-relaxed max-w-xs hidden md:block">Ancient Indian botanicals, formulated for modern skin.</p>
                <div className="flex items-center gap-3 sm:ml-auto">
                  <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-body text-[12px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 hover:scale-105" style={{ background: "#B06080", color: "#fff" }}>
                    Shop the Ritual
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-body text-[12px] tracking-[0.18em] uppercase font-medium border border-white/35 text-white/80 hover:border-white/70 hover:text-white transition-all duration-300">
                    Our Story
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 z-10" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.4 }} style={{ animation: "scroll-bounce 2s ease-in-out infinite" }}>
            <span className="label-caps text-white/60" style={{ writingMode: "vertical-rl" }}>Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>
        </section>

        {/* ── TRUST MARQUEE ── */}
        <section className="w-full border-y overflow-hidden py-3.5" style={{ borderColor: "rgba(176,96,128,0.2)", background: "rgba(255,245,240,0.85)" }}>
          <div className="flex animate-marquee whitespace-nowrap gap-14">
            {[...trustSignals, ...trustSignals].map((s, i) => (
              <span key={i} className="label-caps text-[#B06080] flex items-center gap-3">
                <span className="text-[#C9A74D] text-xs">✦</span> {s}
              </span>
            ))}
          </div>
        </section>

        {/* ── CATEGORY GRID ── */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-16 md:py-24">
          <motion.div className="mb-10 md:mb-14" {...fadeUp(0)}>
            <span className="label-caps text-[#C9A74D] block mb-3">The Collection</span>
            <h2 className="font-display text-[#2A1A14]" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>Curated Essentials</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} {...fadeUp(i * 0.08)}>
                <Link href={cat.href} className="group relative block overflow-hidden rounded-2xl bg-surface-container luxury-card aspect-[3/4]">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-[#B06080]/40 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <p className="label-caps text-white/60 mb-1">{cat.sub}</p>
                    <h3 className="font-display text-white" style={{ fontSize: "clamp(18px, 2.5vw, 26px)", lineHeight: 1.2 }}>{cat.name}</h3>
                    <div className="h-px bg-[#B06080] w-0 group-hover:w-12 transition-all duration-500 mt-2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURED PRODUCTS — Scallop Arch ── */}
        <section className="relative w-full" style={{ background: "#FAF0EE" }}>
          <ScallopArch />
          <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] pt-12 pb-20 md:pt-16 md:pb-28">
            <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4" {...fadeUp(0)}>
              <div>
                <span className="label-caps text-[#C9A74D] block mb-3">The Ritual</span>
                <h2 className="font-display text-[#2A1A14]" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                  Bestselling<br />Formulations
                </h2>
              </div>
              <Link href="/products" className="label-caps text-[#B06080] inline-flex items-center gap-2 hover:gap-3 transition-all duration-300 group">
                View All <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </motion.div>
            {productsError ? (
              <p className="font-body text-error text-center">{productsError}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    showBadge={index === 0 ? "Bestseller" : index === 1 ? "New Ritual" : "Botanical Formula"}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── STORYTELLING ── */}
        <section className="relative overflow-hidden py-16 md:py-28" style={{ background: "linear-gradient(135deg, #1A0A05 0%, #2C1010 50%, #1C0A18 100%)", paddingBottom: "140px" }}>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #B06080 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #C9A74D 0%, transparent 70%)" }} />
          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
              <motion.div className="relative" {...fadeUp(0)}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiIogpeqf76_gbzRe9Hinh27WCwhfgCqPT8rDerBzACK6CzamuNf1iSPL9GMgWDBr9yeBKhUyX7PgHtpNxD3IknPRubtP80xhUwaau-YNbHOCZeWi-n7rFKkrPtvMTHgC6OSlpw-EVMXcd5rKRLxNVHf19B9wN4nqSNtKNxRup49z0rgRj-Uq5u4Uwh0LuKOkkOrvJJopFzlwEsKLMqJrYR4VQdJ9yJBVuYoIlsy-RxPT3Jq_n3j9IEgTR4Jeo9pokvam8ynhaFdGw"
                    alt="Ancient botanical ingredients" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A05]/60 via-transparent to-transparent" />
                </div>
                <motion.div className="absolute -bottom-6 -right-4 md:-right-8 glass-dark border border-white/10 rounded-2xl p-5 max-w-[180px]"
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <span className="material-symbols-outlined text-[#C9A74D] text-2xl mb-2 block">eco</span>
                  <p className="font-body text-white/80 text-[13px] leading-snug">100% Ethically Sourced Botanicals</p>
                </motion.div>
              </motion.div>
              <div className="pt-8 md:pt-0">
                <motion.span className="label-caps text-[#C9A74D] block mb-5" {...fadeUp(0.1)}>Our Heritage</motion.span>
                <motion.h2 className="font-display text-white mb-6" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.1, letterSpacing: "-0.015em" }} {...fadeUp(0.2)}>
                  Rooted in<br /><em>Ancient Rituals.</em>
                </motion.h2>
                <motion.p className="font-body text-white/60 text-[16px] leading-relaxed mb-5" {...fadeUp(0.3)}>
                  At Saaral Cosmetics, we believe true luxury lies in simplicity and authenticity. Our formulations are deeply rooted in ancient Indian apothecary traditions, using potent, unrefined botanicals that have nourished skin for generations.
                </motion.p>
                <motion.p className="font-body text-white/45 text-[15px] leading-relaxed mb-8" {...fadeUp(0.4)}>
                  Every jar is a testament to heritage wisdom blended with contemporary dermatological science.
                </motion.p>
                <motion.div {...fadeUp(0.5)}>
                  <Link href="/contact" className="inline-flex items-center gap-2 border border-white/25 text-white/80 px-7 py-3 rounded-full font-body text-[12px] tracking-[0.15em] uppercase hover:border-[#B06080]/70 hover:text-white transition-all duration-300 group">
                    Discover Our Story
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Reversed Arch — cream light breaking through dark ──
              6 wide domes × 240px = 1440px, 110px tall
              Fill = warm cream, revealing the world below.
              Sharp gold line traces the arch edge.
          ── */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none" aria-hidden="true">
            <svg
              viewBox="0 0 1440 110"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ display: "block", width: "100%", height: "110px" }}
            >
              {/* Cream fill — the warm world below rising through dark arches */}
              <path
                d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110 L1440,110 L0,110 Z"
                fill="#FDF6F0"
              />
              {/* Rose depth behind gold — warm glow on arch edge */}
              <path
                d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110"
                fill="none" stroke="#D4A0B0" strokeWidth="3" opacity="0.4" strokeLinecap="round"
              />
              {/* Gold crisp arch line */}
              <path
                d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110"
                fill="none" stroke="#C9A74D" strokeWidth="2.2" opacity="1" strokeLinecap="round"
              />
              {/* Cream inner highlight */}
              <path
                d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110"
                fill="none" stroke="#FFF5DC" strokeWidth="0.8" opacity="0.85" strokeLinecap="round"
              />
            </svg>
          </div>
        </section>

        {/* ── CINEMATIC BANNER ── */}
        <section className="relative w-full h-[480px] md:h-[580px] overflow-hidden flex items-center justify-center">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8-bjDTc3Unc9zLxtNxCaE-V4cqQ_GJugaVdFZ7k4KFoHrMZfddDoI9SbnMmFVkUq5GcU29rU0VzWiHa0Zc6oSJCd4GOZ8lF6r1HYEmhwn_5HhPDr0MZacIUBhW-TCLT3JU5SLCvhhiSoamVRGF_gN2MJitxL5Zij1_MYVG0nStfey3fSV6TtXDNFAocfdkKtl_ZpwTp3aRHvH1uSmF9qVXDgU7LZhBZlOL7sqVPPZ0DlfI8dP-8jFoOETvCwKNYFT3WBtNGUCFsxo"
            alt="Luxury botanical ritual" fill className="object-cover object-center scale-105" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A0A05]/30 via-[#1A0A05]/55 to-[#1A0A05]/75" />
          <div className="relative z-10 text-center px-6">
            <motion.span className="label-caps text-[#C9A74D] block mb-4" {...fadeUp(0)}>A philosophy of beauty</motion.span>
            <motion.h2 className="font-display text-white mb-6" style={{ fontSize: "clamp(40px, 7vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.02em" }} {...fadeUp(0.15)}>
              Glow Is A Ritual.
            </motion.h2>
            <motion.p className="font-body text-white/60 text-[16px] max-w-md mx-auto mb-8" {...fadeUp(0.3)}>
              Nature remembers what modern beauty forgets.
            </motion.p>
            <motion.div {...fadeUp(0.4)}>
              <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-body text-[12px] tracking-[0.18em] uppercase font-semibold border border-[#C9A74D]/60 text-[#C9A74D] hover:bg-[#C9A74D] hover:text-white transition-all duration-300">
                Begin Your Ritual
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── INGREDIENTS ── */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-16 md:py-24">
          <motion.div className="text-center mb-12 md:mb-16" {...fadeUp(0)}>
            <span className="label-caps text-[#C9A74D] block mb-3">Botanical Actives</span>
            <h2 className="font-display text-[#2A1A14]" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              Ingredients With<br /><em>Ritual Memory</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {ingredients.map((ing, i) => (
              <motion.div key={ing.name} className="relative group rounded-2xl p-6 border border-outline-variant/30 overflow-hidden luxury-card cursor-default" style={{ background: "linear-gradient(135deg, rgba(255,250,248,0.95) 0%, rgba(255,240,235,0.80) 100%)" }} {...fadeUp(i * 0.1)}>
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full blur-[30px] opacity-25 group-hover:opacity-45 transition-opacity duration-500" style={{ background: ing.color }} />
                <span className="material-symbols-outlined text-[36px] mb-4 block" style={{ color: ing.color }}>{ing.icon}</span>
                <p className="label-caps mb-1" style={{ color: ing.color }}>{ing.note}</p>
                <h3 className="font-display text-[#2A1A14] text-[22px] leading-tight mb-2">{ing.name}</h3>
                <p className="font-body text-[14px] leading-relaxed text-on-surface-variant">{ing.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PHILOSOPHY STRIP ── */}
        <section className="py-12 md:py-16 border-y" style={{ borderColor: "rgba(176,96,128,0.15)", background: "rgba(255,245,240,0.5)" }}>
          <div className="max-w-[1280px] mx-auto px-5 md:px-[72px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: "spa", title: "Pure Botanicals", desc: "Every ingredient is chosen for its ancient wisdom and proven efficacy." },
                { icon: "handshake", title: "Ethically Made", desc: "Handcrafted in Tamil Nadu with zero harmful chemicals, ever." },
                { icon: "favorite", title: "Cruelty Free", desc: "100% vegan formulas that respect every living being." },
              ].map((item, i) => (
                <motion.div key={item.title} className="flex flex-col items-center gap-3" {...fadeUp(i * 0.12)}>
                  <span className="material-symbols-outlined text-[28px]" style={{ color: "#B06080" }}>{item.icon}</span>
                  <h3 className="font-display text-[#2A1A14] text-[20px]">{item.title}</h3>
                  <p className="font-body text-on-surface-variant text-[14px] leading-relaxed max-w-[220px]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
