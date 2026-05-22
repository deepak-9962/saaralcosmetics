"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { listProducts } from "@/lib/supabase/data";
import type { Product } from "@/lib/types";
import radiantBeauty from "../../public/images/radiant-beauty.png";
import saaralBanner2 from "../../public/images/saaral-banner-2.png";
import saaralBanner3 from "../../public/images/saaral-banner-3.png";

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

const quickPromoTiles = [
  { title: "Products Under ₹499", subtitle: "Value Picks", href: "/products", tone: "from-[#E7F0E4] to-[#F4F9F2]" },
  { title: "New Launches", subtitle: "Fresh Rituals", href: "/products", tone: "from-[#E8EEF8] to-[#F4F7FD]" },
  { title: "Bestsellers", subtitle: "Most Loved", href: "/products", tone: "from-[#F9E9E7] to-[#FFF5F2]" },
  { title: "Gen Z Favourites", subtitle: "Trending Now", href: "/products", tone: "from-[#EFE8FA] to-[#F7F2FF]" },
];

const ingredients = [
  { name: "Turmeric", note: "Ancient Healer", description: "Used for centuries to brighten, soothe inflammation, and restore natural radiance.", icon: "spa", color: "#C9A74D" },
  { name: "Rose", note: "Skin Brightener", description: "Tones, hydrates, and leaves skin with a delicate floral luminosity.", icon: "local_florist", color: "#B06080" },
  { name: "Neem", note: "Anti-bacterial", description: "Nature's purifier — keeps pores clear and skin balanced.", icon: "eco", color: "#4A7C59" },
  { name: "Aloe Vera", note: "Deep Hydrator", description: "Deeply moisturises while calming sensitivity and redness.", icon: "water_drop", color: "#7E6B9A" },
];

const featuredBadges = ["Bestseller", "New Ritual", "Botanical Formula"];

/* Sweeping organic arch SVG — responsive asymmetrical curve */
function ScallopArch() {
  // Mobile: Asymmetrical sweeping curve across 400px viewBox
  const mobileD = "M0,55 C130,55 270,10 400,45";
  const mobileFill = "M0,55 C130,55 270,10 400,45 L400,60 L0,60 Z";
  
  // Desktop: Asymmetrical sweeping curve across 1440px viewBox
  const desktopD = "M0,90 C480,90 960,15 1440,75";
  const desktopFill = "M0,90 C480,90 960,15 1440,75 L1440,96 L0,96 Z";

  return (
    <>
      {/* Mobile arch — single wide shallow dome, pulls up exactly 45px */}
      <div className="block md:hidden w-full overflow-hidden pointer-events-none" style={{ marginTop: "-45px", height: "45px" }} aria-hidden="true">
        <svg viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "45px" }}>
          <path d={mobileFill} fill="#FAF0EE" />
          <path d={mobileD} fill="none" stroke="#C9A74D" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" />
          <path d={mobileD} fill="none" stroke="#FFFFFF" strokeWidth="1.0" opacity="0.95" strokeLinecap="round" />
        </svg>
      </div>
      {/* Desktop arch — single wide shallow dome, pulls up exactly 80px */}
      <div className="hidden md:block w-full overflow-hidden pointer-events-none" style={{ marginTop: "-80px", height: "80px" }} aria-hidden="true">
        <svg viewBox="0 0 1440 96" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d={desktopFill} fill="#FAF0EE" />
          <path d={desktopD} fill="none" stroke="#C9A74D" strokeWidth="3.5" opacity="0.9" strokeLinecap="round" />
          <path d={desktopD} fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.95" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
}

function ValuePicksSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-[#4A7C59]/12 pointer-events-none transform rotate-[-15deg]">
      <path d="M25 85 C 35 75, 45 50, 50 15" />
      <path d="M42 60 C 48 55, 68 50, 78 45" />
      <path d="M78 45 C 84 40, 74 35, 68 40 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M38 42 C 30 38, 15 35, 8 30" />
      <path d="M8 30 C 2 25, 12 20, 18 25 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M50 15 C 52 5, 45 0, 40 5 C 38 10, 45 15, 50 15 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M46 38 C 50 30, 65 25, 70 20 C 72 23, 62 30, 46 38 Z" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}

function FreshRitualsSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-[-8px] bottom-[-8px] w-24 h-24 text-[#4B6B94]/12 pointer-events-none transform rotate-[5deg]">
      <path d="M20 85 Q 50 78 80 85" strokeWidth="0.8" />
      <path d="M50 82 C 50 60, 46 35, 38 20" />
      <path d="M46 55 C 32 45, 18 45, 12 50 C 14 62, 32 62, 46 55 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M44 38 C 58 30, 72 32, 78 40 C 70 50, 52 45, 44 38 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M38 20 C 35 12, 45 8, 48 15 C 48 22, 42 22, 38 20 Z" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}

function BestsellersSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-[#B06080]/12 pointer-events-none">
      <path d="M50 80 C 20 75, 15 50, 25 35 C 35 20, 65 20, 75 35 C 85 50, 80 75, 50 80 Z" fill="currentColor" fillOpacity="0.03" />
      <path d="M50 70 C 32 65, 28 48, 35 38 C 42 28, 58 28, 65 38 C 72 48, 68 65, 50 70 Z" fill="currentColor" fillOpacity="0.03" />
      <path d="M50 60 C 40 57, 38 48, 42 42 C 46 36, 54 36, 58 42 C 62 48, 60 57, 50 60 Z" fill="currentColor" fillOpacity="0.03" />
      <path d="M47 48 C 47 46, 53 46, 50 50 C 48 52, 52 52, 50 49" />
      <path d="M50 80 C 50 85, 48 90, 45 92" strokeWidth="0.8" />
    </svg>
  );
}

function GenZFavouritesSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-[#7E6B9A]/12 pointer-events-none transform rotate-[10deg]">
      <path d="M50 90 L 50 15" strokeWidth="1.5" />
      <path d="M50 15 C 20 25, 15 55, 22 80 C 28 85, 42 88, 50 90 C 58 88, 72 85, 78 80 C 85 55, 80 25, 50 15 Z" fill="currentColor" fillOpacity="0.03" />
      <path d="M48 30 C 40 32, 28 28, 24 26" />
      <path d="M48 45 C 38 48, 22 45, 16 42" />
      <path d="M48 60 C 36 65, 20 62, 14 60" />
      <path d="M48 75 C 40 80, 26 82, 20 80" />
      <path d="M52 30 C 60 32, 72 28, 76 26" />
      <path d="M52 45 C 62 48, 78 45, 84 42" />
      <path d="M52 60 C 64 65, 80 62, 86 60" />
      <path d="M52 75 C 60 80, 74 82, 80 80" />
    </svg>
  );
}


export default function HomePage() {
  const [bestsellingProducts, setBestsellingProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bestsellerScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 180]);
  const bannerY = useTransform(scrollY, [300, 1200], [-30, 30]);


  // Mobile Hero Banner Slider setup using Embla Carousel
  const heroAutoplay = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [heroEmblaRef, heroEmblaApi] = useEmblaCarousel(
    { loop: true },
    [heroAutoplay.current]
  );
  const [heroSelectedIndex, setHeroSelectedIndex] = useState(0);
  const [heroScrollSnaps, setHeroScrollSnaps] = useState<number[]>([]);

  const onHeroSelect = useCallback(() => {
    if (!heroEmblaApi) return;
    setHeroSelectedIndex(heroEmblaApi.selectedScrollSnap());
  }, [heroEmblaApi]);

  useEffect(() => {
    if (!heroEmblaApi) return;
    onHeroSelect();
    setHeroScrollSnaps(heroEmblaApi.scrollSnapList());
    heroEmblaApi.on("select", onHeroSelect);
    return () => {
      heroEmblaApi.off("select", onHeroSelect);
    };
  }, [heroEmblaApi, onHeroSelect]);

  const scrollBestsellers = (direction: "left" | "right") => {
    const container = bestsellerScrollRef.current;
    if (!container) {
      return;
    }
    const scrollAmount = Math.max(240, container.clientWidth * 0.7);
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    listProducts()
      .then(setBestsellingProducts)
      .catch((e) => setProductsError(e instanceof Error ? e.message : "Failed to load products."));
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col grain-overlay">
      <GradientBackground />
      <TopNavBar />

      <main className="w-full flex-grow pb-24 md:pb-0 overflow-x-hidden">

        {/* ── HERO — Split Layout (Screenshot Match) ── */}
        <section
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{
            minHeight: "clamp(500px, 88vh, 820px)",
            background: "#FDF6F0",
          }}
        >
          {/* Hero Background Image - Scaled to fit height, aligned right-bottom to show full reflection */}
          <div
            className="absolute inset-0 bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: "url(/images/hero.png)",
              backgroundSize: "auto 100%",
              backgroundPosition: "right bottom",
              transform: "translateX(3.5%)",
            }}
          />

          {/* Left-to-Right Blend Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right,
                  #FDF6F0 0%,
                  #FDF6F0 22%,
                  rgba(253,246,240,0.82) 32%,
                  rgba(253,246,240,0.18) 43%,
                  transparent 54%
                )
              `,
            }}
          />


          {/* ── LEFT — Text content ── */}

          <div
            className="relative z-10 flex flex-col justify-center px-6 md:px-14 lg:px-20 pt-10 pb-10 md:py-0 w-full md:w-[48%] lg:w-[46%]"
            style={{ minHeight: "clamp(520px, 90vh, 860px)" }}
          >
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
            >
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="font-body text-[#C9A74D] text-[11px] tracking-[0.16em] uppercase font-medium">
                Apothecary Heritage · Tamil Nadu
              </span>
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-5">
              {["Luxury Skincare,", "Rooted in Nature."].map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, y: 56 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, delay: 0.3 + i * 0.13, ease }}
                >
                  <span
                    className="font-display text-[#2A1A14] block"
                    style={{ fontSize: "clamp(34px, 4.8vw, 72px)", lineHeight: 1.08, letterSpacing: "-0.025em" }}
                  >
                    {line}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Sub-text */}
            <motion.p
              className="font-body text-[#2A1A14]/55 text-[15px] leading-relaxed max-w-[260px] mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease }}
            >
              Ancient botanical ingredients crafted<br />for naturally radiant modern skin.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease }}
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body text-[12px] tracking-[0.16em] uppercase font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                style={{ background: "#8B3A5E", color: "#fff" }}
              >
                Shop the Ritual
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-body text-[12px] tracking-[0.16em] uppercase font-medium border border-[#2A1A14]/25 text-[#2A1A14]/65 hover:border-[#8B3A5E]/60 hover:text-[#8B3A5E] transition-all duration-300"
              >
                Our Story
              </Link>
            </motion.div>
          </div>
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

        {/* ── MOBILE QUICK SHOP ── */}
        <section className="md:hidden max-w-[1280px] mx-auto px-5 py-8">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="px-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-lowest font-body text-[13px] text-on-surface whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {quickPromoTiles.map((tile) => {
              let promoSvg;
              if (tile.subtitle === "Value Picks") {
                promoSvg = <ValuePicksSVG />;
              } else if (tile.subtitle === "Fresh Rituals") {
                promoSvg = <FreshRitualsSVG />;
              } else if (tile.subtitle === "Most Loved") {
                promoSvg = <BestsellersSVG />;
              } else {
                promoSvg = <GenZFavouritesSVG />;
              }

              return (
                <Link
                  key={tile.title}
                  href={tile.href}
                  className={`relative overflow-hidden rounded-2xl p-4 min-h-[108px] bg-gradient-to-br ${tile.tone} border border-outline-variant/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.85),0_4px_12px_-4px_rgba(42,26,20,0.03)] flex flex-col justify-between active:scale-[0.97] transition-all duration-300`}
                >
                  <span className="relative z-10 font-body text-[11px] tracking-[0.08em] uppercase text-on-surface-variant/80">{tile.subtitle}</span>
                  <h3 className="relative z-10 font-display text-[20px] leading-[1.15] text-on-surface pt-4">{tile.title}</h3>
                  {promoSvg}
                </Link>
              );
            })}
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
                  <div className="absolute bottom-0 left-0 right-0 pb-5 px-4 pt-3 md:p-5">
                    <p className="label-caps text-white/60 mb-1 text-[9px] md:text-[10px]">{cat.sub}</p>
                    <h3 className="font-display text-white text-[15px] md:text-[clamp(18px,2.5vw,26px)]" style={{ lineHeight: 1.2 }}>{cat.name}</h3>
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
          <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] pt-12 pb-4 md:pt-16 md:pb-6">
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
              <div className="relative">
                <div
                  ref={bestsellerScrollRef}
                  className="overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory md:overflow-visible md:snap-none"
                >
                  <div
                    className="flex w-max items-stretch gap-4 pb-4 md:grid md:grid-cols-4 md:w-full md:gap-6 md:pb-0 md:!px-0"
                    style={{
                      paddingLeft: "calc(50vw - 130px)",
                      paddingRight: "calc(50vw - 130px)",
                    }}
                  >
                    {bestsellingProducts.slice(0, 4).map((product, index) => {
                      const badge = featuredBadges[index] ?? undefined;
                      return (
                        <motion.div
                          key={product.id}
                          className="snap-center shrink-0 w-[260px] md:snap-align-none md:shrink md:w-auto"
                          initial={{ opacity: 0, y: 28 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.35 }}
                          transition={{ duration: 0.55, delay: Math.min(index, 8) * 0.06, ease }}
                        >
                          <ProductCard
                            product={product}
                            index={index}
                            showBadge={badge}
                            imageAspectClassName="aspect-[1/1]"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-3 md:hidden">
                  <button
                    type="button"
                    onClick={() => scrollBestsellers("left")}
                    className="h-10 w-10 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:border-outline hover:text-on-surface transition-colors"
                    aria-label="Scroll bestsellers left"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollBestsellers("right")}
                    className="h-10 w-10 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:border-outline hover:text-on-surface transition-colors"
                    aria-label="Scroll bestsellers right"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── BANNER ── */}
        <section
          aria-label="Saaral Banners and Promotions"
          className="w-full pt-8 pb-12 md:pt-14 md:pb-20"
          style={{ background: "#F9EFED" }}
        >
          <div className="w-full px-5 md:px-0">
            <Image
              src={radiantBeauty}
              alt="Your New Ritual For Radiant Beauty — Saaral Cosmetics"
              className="w-full md:w-[85%] h-auto block rounded-2xl mx-auto"
              style={{ maxWidth: "1100px" }}
              priority={false}
              sizes="(max-width: 768px) 90vw, 85vw"
            />
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
                <motion.div className="absolute -bottom-6 right-4 md:-right-8 glass-dark border border-white/10 rounded-2xl p-5 max-w-[180px]"
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
            {/* Mobile — 4 wide domes */}
            <div className="block md:hidden" style={{ width: "100%", height: "65px" }}>
              <svg
                viewBox="0 0 400 90"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                style={{ display: "block", width: "100%", height: "65px" }}
              >
                <path d="M0,90 Q50,40 100,90 Q150,40 200,90 Q250,40 300,90 Q350,40 400,90 L400,90 L0,90 Z" fill="#FDF6F0" />
                <path d="M0,90 Q50,40 100,90 Q150,40 200,90 Q250,40 300,90 Q350,40 400,90" fill="none" stroke="#D4A0B0" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
                <path d="M0,90 Q50,40 100,90 Q150,40 200,90 Q250,40 300,90 Q350,40 400,90" fill="none" stroke="#C9A74D" strokeWidth="2.2" opacity="1" strokeLinecap="round" />
                <path d="M0,90 Q50,40 100,90 Q150,40 200,90 Q250,40 300,90 Q350,40 400,90" fill="none" stroke="#FFF5DC" strokeWidth="1" opacity="0.85" strokeLinecap="round" />
              </svg>
            </div>
            {/* Desktop — 6 wide domes (original, unchanged) */}
            <div className="hidden md:block" style={{ width: "100%", height: "110px" }}>
              <svg
                viewBox="0 0 1440 110"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                style={{ display: "block", width: "100%", height: "110px" }}
              >
                <path d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110 L1440,110 L0,110 Z" fill="#FDF6F0" />
                <path d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110" fill="none" stroke="#D4A0B0" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
                <path d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110" fill="none" stroke="#C9A74D" strokeWidth="2.2" opacity="1" strokeLinecap="round" />
                <path d="M0,110 Q120,0 240,110 Q360,0 480,110 Q600,0 720,110 Q840,0 960,110 Q1080,0 1200,110 Q1320,0 1440,110" fill="none" stroke="#FFF5DC" strokeWidth="0.8" opacity="0.85" strokeLinecap="round" />
              </svg>
            </div>
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
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
