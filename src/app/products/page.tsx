import type { Metadata } from "next";
import { Suspense } from "react";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCatalogPanel from "@/components/product/ProductCatalogPanel";
import { listProducts } from "@/lib/supabase/data";

export const metadata: Metadata = {
  title: "Shop All Products | Saaral Cosmetics",
  description:
    "Explore our collection of 100% natural, handcrafted cosmetic formulations rooted in Tamil Nadu's rich apothecary heritage.",
};

const trustBadgesPlaceholder = [
  { icon: "spa", label: "100% Natural" },
  { icon: "pets", label: "Cruelty Free" },
  { icon: "science", label: "Sulphate Free" },
  { icon: "handyman", label: "Handmade" },
];

function CatalogSkeleton() {
  return (
    <>
      {/* Search Bar Skeleton */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px] -mt-10 md:-mt-20 mb-8">
        <div className="max-w-[65%] md:max-w-[55%] h-12 md:h-14 rounded-[22px] bg-[rgba(255,250,247,0.72)] border border-gold/10 animate-pulse" />
      </div>

      {/* Sticky Bar Skeleton */}
      <div className="w-full border-b border-gold/12 bg-[rgba(253,246,240,0.97)] h-[72px] flex items-center mb-8">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-[72px] flex items-center justify-between">
          <div className="h-9 w-64 rounded-full bg-gold/5 animate-pulse" />
          <div className="h-9 w-32 rounded-full bg-gold/5 animate-pulse" />
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] py-8 md:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div
                className="aspect-[4/5] rounded-2xl animate-pulse"
                style={{ background: "rgba(176,96,128,0.07)", animationDelay: `${i * 80}ms` }}
              />
              <div
                className="h-4 w-3/4 rounded-full animate-pulse"
                style={{ background: "rgba(176,96,128,0.06)", animationDelay: `${i * 80 + 40}ms` }}
              />
              <div
                className="h-3 w-1/2 rounded-full animate-pulse"
                style={{ background: "rgba(176,96,128,0.05)", animationDelay: `${i * 80 + 80}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default async function ProductsPage() {
  let products = [];
  try {
    // Fetch all products on the server side
    products = await listProducts();
  } catch (err) {
    console.error("Failed to load products on server:", err);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#FDF6F0" }}>
      <GradientBackground />
      {/* Fine grain texture overlay */}
      <div
        className="fixed inset-0 -z-[5] pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      <TopNavBar />

      <main className="flex-grow w-full overflow-x-hidden pb-24 md:pb-0">
        {/* ── STATIC HERO SECTION ── */}
        <section
          className="relative w-full overflow-hidden"
          style={{ minHeight: "clamp(360px, 45vh, 460px)" }}
          aria-label="Products hero"
        >
          {/* Warm ivory radial glow behind hero text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 90% at 30% 50%, rgba(249,232,219,0.9) 0%, rgba(253,246,240,0.6) 55%, transparent 100%)",
            }}
          />
          {/* Fine horizontal lines for texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #B06080 0px, #B06080 1px, transparent 1px, transparent 48px)",
            }}
          />

          {/* Hero Background Image - Desktop */}
          <div
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{ transform: "translateX(3.5%)" }}
          >
            <picture className="absolute right-0 bottom-0 h-full w-auto block select-none">
              <source srcSet="/images/hero1.avif" type="image/avif" />
              <source srcSet="/images/hero1.webp" type="image/webp" />
              <img
                src="/images/hero1.png"
                alt=""
                className="h-full w-auto object-contain object-right-bottom"
              />
            </picture>
          </div>
          {/* Left-to-Right Blend Gradient Overlay - Desktop */}
          <div
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{
              backgroundImage: `
                linear-gradient(to right,
                  #FDF6F0 0%,
                  #FDF6F0 45%,
                  rgba(253,246,240,0.9) 55%,
                  rgba(253,246,240,0.3) 68%,
                  transparent 80%
                )
              `,
            }}
          />

          {/* Hero Background Image - Mobile */}
          <div className="absolute inset-0 pointer-events-none block md:hidden opacity-100">
            <picture className="absolute right-0 bottom-0 h-[95%] w-auto block select-none">
              <source srcSet="/images/hero1.avif" type="image/avif" />
              <source srcSet="/images/hero1.webp" type="image/webp" />
              <img
                src="/images/hero1.png"
                alt=""
                className="h-full w-auto object-contain object-right-bottom"
              />
            </picture>
          </div>
          {/* Mobile gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none block md:hidden"
            style={{
              background:
                "linear-gradient(to right, #FDF6F0 0%, #FDF6F0 55%, rgba(253,246,240,0.9) 65%, rgba(253,246,240,0.3) 76%, transparent 88%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none block md:hidden"
            style={{
              background: "linear-gradient(to bottom, transparent 82%, #FDF6F0 100%)",
            }}
          />

          {/* Content Wrapper */}
          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px] pt-14 md:pt-32 pb-6 md:pb-14">
            {/* Category Eyebrow */}
            <div
              className="flex items-center gap-2.5 mb-3 md:mb-5 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="w-6 md:w-8 h-px bg-[#C9A74D]" />
              <span className="font-body text-[#C9A74D] text-[10px] md:text-[11px] tracking-[0.22em] uppercase font-medium">
                Saaral Cosmetics
              </span>
            </div>

            <div className="max-w-[62%] md:max-w-[55%]">
              {/* Heading */}
              <h1
                className="font-display text-[#2A1A14] mb-2 md:mb-4 animate-fade-up"
                style={{
                  fontSize: "clamp(32px, 5.5vw, 76px)",
                  lineHeight: 1.06,
                  letterSpacing: "-0.025em",
                  animationDelay: "200ms",
                }}
              >
                Best Sellers
              </h1>

              {/* Subtitle list */}
              <div
                className="font-body mb-2 md:mb-3 flex flex-wrap gap-x-2 gap-y-0.5 items-center animate-fade-up"
                style={{ color: "rgba(176,96,128,0.8)", animationDelay: "300ms" }}
              >
                {["Authentic", "Transparent", "Sustainable"].map((word, i) => (
                  <span key={word} className="flex items-center gap-x-2">
                    <span className="font-body text-[10px] md:text-[13px] tracking-[0.14em] md:tracking-[0.18em] uppercase">
                      {word}
                    </span>
                    {i < 2 && (
                      <span className="text-[#C9A74D]/60 text-[10px] md:text-[13px]">&middot;</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p
                className="font-body text-[#5A3A2C]/65 leading-relaxed text-[12px] md:text-[15px] animate-fade-up"
                style={{ maxWidth: "44ch", animationDelay: "400ms" }}
              >
                Discover handcrafted herbal skincare rituals inspired by nature and traditional wellness.
              </p>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(253,246,240,0.8))" }}
          />
        </section>

        {/* ── INTERACTIVE CATALOG PANEL ── */}
        <Suspense fallback={<CatalogSkeleton />}>
          <ProductCatalogPanel products={products} />
        </Suspense>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
