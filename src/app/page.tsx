import Image from "next/image";
import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import CuratedRituals from "@/components/home/CuratedRituals";
import GoldCurveDivider from "@/components/home/GoldCurveDivider";
import LuxuryRibbon from "@/components/home/LuxuryRibbon";
import MobileHeroBanner from "@/components/home/MobileHeroBanner";
import MobileCategoryScroll from "@/components/home/MobileCategoryScroll";
import MobilePromoGrid from "@/components/home/MobilePromoGrid";
import BestsellersCarousel from "@/components/home/BestsellersCarousel";
import FadeIn from "@/components/layout/FadeIn";
import TestimonialShowcase from "@/components/home/TestimonialShowcase";
import { listProducts } from "@/lib/supabase/data";
import { Product } from "@/lib/types";

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



const featuredBadges = ["Bestseller", "New Ritual", "Botanical Formula"];

/* Sweeping organic arch SVG — responsive asymmetrical curve */
function ScallopArch() {
  const mobileD = "M0,55 C130,55 270,10 400,45";
  const mobileFill = "M0,55 C130,55 270,10 400,45 L400,60 L0,60 Z";
  
  return (
    <div className="block md:hidden w-full overflow-hidden pointer-events-none" style={{ marginTop: "-45px", height: "45px" }} aria-hidden="true">
      <svg viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "45px" }}>
        <path d={mobileFill} fill="#FAF0EE" />
        <path d={mobileD} fill="none" stroke="#C9A74D" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" />
        <path d={mobileD} fill="none" stroke="#FFFFFF" strokeWidth="1.0" opacity="0.95" strokeLinecap="round" />
      </svg>
    </div>
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

/* ─────────────────────────────────────────────
   MAIN HOMEPAGE (Server-Side rendered)
───────────────────────────────────────────── */
export default async function HomePage() {
  let bestsellingProducts: Product[] = [];
  let productsError = null;

  try {
    bestsellingProducts = await listProducts();
  } catch (e) {
    productsError = e instanceof Error ? e.message : "Failed to load products.";
  }

  return (
    <div className="min-h-[100dvh] flex flex-col grain-overlay">
      <GradientBackground />
      <TopNavBar />

      <main className="w-full flex-grow overflow-x-hidden">

        {/* ── MOBILE-ONLY: Fixed nav spacer (promo bar 28px + h-14 header row = 84px total) ── */}
        <div className="block md:hidden h-[84px]" aria-hidden="true" />

        {/* ── MOBILE-ONLY: Category Discovery Scroll ── */}
        <MobileCategoryScroll />

        {/* ── MOBILE-ONLY: Premium Hero Banner Carousel ── */}
        <MobileHeroBanner />

        {/* Desktop Hero (visible only on md and above) */}
        <section
          className="hidden md:block relative w-full overflow-hidden"
          style={{
            minHeight: "clamp(500px, 88vh, 820px)",
            background: "#FDF6F0",
          }}
        >
          {/* Hero Background Image - Scaled to fit height, aligned right-bottom to show full reflection */}
          <div className="absolute inset-0 pointer-events-none select-none" style={{ transform: "translateX(3.5%)" }}>
            <Image
              src="/images/hero.avif"
              alt="Saaral Cosmetics"
              priority
              fetchPriority="high"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain object-right-bottom"
              style={{ pointerEvents: "none", userSelect: "none" }}
            />
          </div>

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
            className="relative z-10 flex flex-col justify-center px-14 lg:px-20 pt-32 pb-12 w-[48%] lg:w-[46%]"
            style={{ minHeight: "clamp(520px, 90vh, 860px)" }}
          >
            {/* Eyebrow */}
            <FadeIn
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
            >
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="font-body text-[#C9A74D] text-[11px] tracking-[0.16em] uppercase font-medium">
                Apothecary Heritage · Tamil Nadu
              </span>
            </FadeIn>

            {/* Headline */}
            <div className="overflow-hidden mb-5">
              {["Luxury Skincare,", "Rooted in Nature."].map((line, i) => (
                <FadeIn
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
                </FadeIn>
              ))}
            </div>

            {/* Sub-text */}
            <FadeIn
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease }}
            >
              <p className="font-body text-[#2A1A14]/55 text-[15px] leading-relaxed max-w-[260px] mb-8">
                Ancient botanical ingredients crafted<br />for naturally radiant modern skin.
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn
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
            </FadeIn>
          </div>
        </section>


        {/* ── MOBILE-ONLY: Promo Grid (New Launches, Best Sellers, Combos, Gen Z) ── */}
        <MobilePromoGrid />

        {/* ── LUXURY RIBBON ── */}
        <LuxuryRibbon />

        {/* ── CURATED RITUALS — desktop only (mobile has MobileCategoryScroll above) ── */}
        <div className="hidden md:block">
          <CuratedRituals />
        </div>

        {/* ── GOLD CURVE DIVIDER ── */}
        <GoldCurveDivider />

        {/* ── FEATURED PRODUCTS ── */}
        <section className="relative w-full" style={{ background: "#FAF0EE" }}>
          <ScallopArch />
          <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] pt-12 pb-4 md:pt-16 md:pb-6">
            <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4" {...fadeUp(0)}>
              <div>
                <span className="label-caps text-[#C9A74D] block mb-3">The Ritual</span>
                <h2 className="font-display text-[#2A1A14]" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                  Bestselling<br />Formulations
                </h2>
              </div>
              <Link href="/products" className="label-caps text-[#B06080] inline-flex items-center gap-2 hover:gap-3 transition-all duration-300 group">
                View All <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </FadeIn>
            {productsError ? (
              <p className="font-body text-error text-center">{productsError}</p>
            ) : (
              <BestsellersCarousel>
                {bestsellingProducts.slice(0, 4).map((product, index) => {
                  const badge = featuredBadges[index] ?? undefined;
                  return (
                    <div
                      key={product.id}
                      className="snap-center shrink-0 w-[260px] md:snap-align-none md:shrink md:w-auto h-full"
                    >
                      <ProductCard
                        product={product}
                        index={index}
                        showBadge={badge}
                        imageAspectClassName="aspect-[1/1]"
                      />
                    </div>
                  );
                })}
              </BestsellersCarousel>
            )}
          </div>
        </section>

        {/* ── BANNER — desktop only ── */}
        <section
          aria-label="Saaral Banners and Promotions"
          className="hidden md:block w-full pt-8 pb-12 md:pt-14 md:pb-20"
          style={{ background: "#F9EFED" }}
        >
          <div className="w-full px-5 md:px-0">
            <picture className="w-full md:w-[85%] h-auto block mx-auto overflow-hidden select-none" style={{ maxWidth: "1100px" }}>
              <source srcSet="/images/radiant-beauty.avif" type="image/avif" />
              <source srcSet="/images/radiant-beauty.webp" type="image/webp" />
              <img
                src="/images/radiant-beauty.png"
                alt="Your New Ritual For Radiant Beauty — Saaral Cosmetics"
                className="w-full h-auto block"
              />
            </picture>
          </div>
        </section>

        {/* ── EDITORIAL BEAUTY — Made To Elevate Everyday Skin ── */}
        <section
          className="relative z-10 -mt-[2px] overflow-hidden pt-20 pb-36 md:py-28"
          style={{
            background: "linear-gradient(to bottom, #FAF0EE 0%, #FFF8F5 25%, #F6ECE8 60%, #F1DFDA 100%)",
          }}
        >
          {/* Ambient glow blobs */}
          <div
            className="absolute top-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, #CFA8A1 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[-60px] left-[-40px] w-[350px] h-[350px] rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #E6D1CB 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, #D4B0A8 0%, transparent 70%)" }}
          />

          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

              {/* RIGHT — Editorial Content */}
              <div className="order-2 md:order-2">
                <FadeIn className="block mb-5" {...fadeUp(0.1)}>
                  <span
                    className="font-body text-[#A97882] block"
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                    }}
                  >
                    Modern Skincare Essentials
                  </span>
                </FadeIn>

                <FadeIn
                  className="font-display text-[#2A1A14] mb-7"
                  style={{
                    fontSize: "clamp(30px, 4vw, 50px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                  {...fadeUp(0.2)}
                >
                  <h2>
                    Made To Elevate<br />
                    <em>Everyday Skin.</em>
                  </h2>
                </FadeIn>

                <FadeIn
                  className="font-body text-[#2A1A14]/55 text-[15px] md:text-[16px] leading-relaxed mb-5 max-w-[440px]"
                  {...fadeUp(0.3)}
                >
                  <p>
                    Thoughtfully crafted skincare essentials designed to hydrate,
                    nourish, and enhance your natural glow. Lightweight textures,
                    clean formulations, and luxurious everyday care — made for
                    modern self-care moments.
                  </p>
                </FadeIn>

                <FadeIn
                  className="font-body text-[#2A1A14]/40 text-[14px] md:text-[15px] leading-relaxed mb-9 max-w-[400px]"
                  {...fadeUp(0.4)}
                >
                  <p>
                    Minimal routines. Maximum confidence. Saaral Cosmetics blends
                    beauty, comfort, and simplicity into products designed for
                    everyday radiance.
                  </p>
                </FadeIn>

                <FadeIn {...fadeUp(0.5)}>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-body text-[12px] tracking-[0.15em] uppercase font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] group"
                    style={{
                      background: "linear-gradient(135deg, #A97882 0%, #C89B9D 100%)",
                      boxShadow: "0 4px 20px rgba(169, 120, 130, 0.3)",
                    }}
                  >
                    Explore Collection
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </FadeIn>
              </div>

              {/* LEFT — Editorial Product Image */}
              <FadeIn className="relative order-1 md:order-1" {...fadeUp(0)}>
                <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/card3.avif"
                    alt="Premium skincare products — collection by Saaral Cosmetics"
                    fill
                    className="object-cover object-right"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Soft bottom fade */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(to top, rgba(246,236,232,0.5) 0%, transparent 30%)",
                    }}
                  />
                </div>

                {/* Floating glassmorphic badge */}
                <div
                  className="absolute -bottom-4 left-4 md:-right-6 rounded-2xl p-4 max-w-[170px] z-10"
                  style={{
                    background: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 8px 32px rgba(169, 120, 130, 0.12)",
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[#A97882] text-xl mb-1.5 block"
                  >
                    eco
                  </span>
                  <p className="font-body text-[#2A1A14]/70 text-[12px] leading-snug">
                    Clean Formulations. Dermatologically Tested.
                  </p>
                </div>
              </FadeIn>

            </div>
          </div>
        </section>


        {/* ── TESTIMONIAL SHOWCASE ── */}
        <TestimonialShowcase />

        {/* ── PHILOSOPHY STRIP ── */}
        <section className="py-12 md:py-16 border-y" style={{ borderColor: "rgba(176,96,128,0.15)", background: "rgba(255,245,240,0.5)" }}>
          <div className="max-w-[1280px] mx-auto px-5 md:px-[72px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: "spa", title: "Pure Botanicals", desc: "Every ingredient is chosen for its ancient wisdom and proven efficacy." },
                { icon: "handshake", title: "Ethically Made", desc: "Handcrafted in Tamil Nadu with zero harmful chemicals, ever." },
                { icon: "favorite", title: "Cruelty Free", desc: "100% vegan formulas that respect every living being." },
              ].map((item, i) => (
                <FadeIn key={item.title} className="flex flex-col items-center gap-3" {...fadeUp(i * 0.12)}>
                  <span className="material-symbols-outlined text-[28px]" style={{ color: "#B06080" }}>{item.icon}</span>
                  <h3 className="font-display text-[#2A1A14] text-[20px]">{item.title}</h3>
                  <p className="font-body text-on-surface-variant text-[14px] leading-relaxed max-w-[220px]">{item.desc}</p>
                </FadeIn>
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
