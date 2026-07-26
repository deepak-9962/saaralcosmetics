import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCatalogPanel from "@/components/product/ProductCatalogPanel";
import { listProducts } from "@/lib/supabase/data";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Products | Saaral Cosmetics",
  description:
    "Explore our collection of 100% natural, handcrafted cosmetic formulations rooted in Tamil Nadu's rich apothecary heritage.",
};

function CatalogSkeleton() {
  return (
    <>
      {/* Filter Bar Skeleton */}
      <div className="w-full border-b border-gold/12 bg-[rgba(253,246,240,0.97)] h-[56px] flex items-center mb-4">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-[72px] flex items-center gap-3">
          <div className="h-8 w-20 rounded-full bg-gold/5 animate-pulse" />
          <div className="h-8 w-16 rounded-full bg-gold/5 animate-pulse" />
          <div className="h-8 w-24 rounded-full bg-gold/5 animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-gold/5 animate-pulse" />
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-[72px] py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div
                className="aspect-square rounded-xl animate-pulse"
                style={{ background: "rgba(176,96,128,0.07)", animationDelay: `${i * 80}ms` }}
              />
              <div
                className="h-3.5 w-3/4 rounded-full animate-pulse"
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
  let products: Product[] = [];
  try {
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

        {/* ── MOBILE ONLY: Heading + shop1 banner ── */}
        <div className="block md:hidden">
          <div className="px-4 pt-5 pb-4">
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(22px, 6vw, 32px)",
                color: "#1A0E0A",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                fontWeight: 700,
              }}
            >
              Herbal Skincare Rituals
            </h1>
          </div>
          <div className="px-4 mb-0">
            <div className="relative w-full overflow-hidden" style={{ borderRadius: "14px" }}>
              <Image
                src="/images/shop1.avif"
                alt="Saaral Herbal Skincare Collection"
                width={800}
                height={400}
                className="w-full h-auto block"
                style={{ display: "block" }}
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* ── DESKTOP ONLY: Original tall hero section ── */}
        <section
          className="relative hidden md:block w-full overflow-hidden"
          style={{ minHeight: "clamp(360px, 45vh, 460px)" }}
          aria-label="Products hero"
        >
          {/* Warm ivory radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 90% at 30% 50%, rgba(249,232,219,0.9) 0%, rgba(253,246,240,0.6) 55%, transparent 100%)",
            }}
          />
          {/* Subtle horizontal line texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #B06080 0px, #B06080 1px, transparent 1px, transparent 48px)",
            }}
          />

          {/* Hero Background Image */}
          <div className="absolute inset-0 pointer-events-none" style={{ transform: "translateX(3.5%)" }}>
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

          {/* Left-to-Right Blend Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right,
                #FDF6F0 0%,
                #FDF6F0 45%,
                rgba(253,246,240,0.9) 55%,
                rgba(253,246,240,0.3) 68%,
                transparent 80%
              )`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-[1280px] mx-auto px-[72px] pt-32 pb-32">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-5" style={{ animationDelay: "100ms" }}>
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="font-body text-[#C9A74D] text-[11px] tracking-[0.22em] uppercase font-medium">
                Saaral Herbal Collections
              </span>
              <div className="w-8 h-px bg-[#C9A74D]" />
            </div>

            <div className="max-w-[50%]">
              {/* Heading */}
              <h1
                className="font-display mb-4"
                style={{
                  fontSize: "clamp(26px, 5vw, 64px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                }}
              >
                <span style={{ color: "#2A1A14" }}>Discover Herbal</span>
                <br />
                <span style={{ color: "#8B3A5E" }}>Skincare Rituals</span>
              </h1>

              {/* Subtitle */}
              <p
                className="font-body text-[14px] leading-relaxed mb-6"
                style={{ color: "rgba(42,26,20,0.60)", maxWidth: "30ch" }}
              >
                Inspired by traditional ingredients
                <br />and crafted for modern skin needs.
              </p>

              {/* Inline perks */}
              <div className="flex items-start gap-5">
                {[
                  {
                    svg: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 2C12 2 4 7 4 14a8 8 0 0 0 16 0C20 7 12 2 12 2Z" stroke="#4A7C59" strokeWidth="1.5" fill="rgba(74,124,89,0.12)" strokeLinejoin="round" />
                        <path d="M12 6v8" stroke="#4A7C59" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    ),
                    label: "100%\nHerbal",
                  },
                  {
                    svg: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 3C12 3 5 6 5 12c0 3.87 3.13 7 7 7s7-3.13 7-7c0-6-7-9-7-9Z" stroke="#C9A74D" strokeWidth="1.4" fill="rgba(201,167,77,0.10)" />
                        <path d="M9 12l2 2 4-4" stroke="#C9A74D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                    label: "Handcrafted\nWith Care",
                  },
                  {
                    svg: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <ellipse cx="12" cy="12" rx="9" ry="10" stroke="#8B3A5E" strokeWidth="1.4" fill="rgba(139,58,94,0.08)" />
                        <path d="M9 12l2 2 4-4" stroke="#8B3A5E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                    label: "Made For\nIndian Skin",
                  },
                ].map((perk) => (
                  <div key={perk.label} className="flex flex-col items-center gap-1 text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,252,247,0.7)", border: "1px solid rgba(201,167,77,0.18)" }}
                    >
                      {perk.svg}
                    </div>
                    <span
                      className="font-body text-[10px] font-medium leading-tight whitespace-pre-line"
                      style={{ color: "rgba(42,26,20,0.65)" }}
                    >
                      {perk.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(253,246,240,0.8))" }}
          />
        </section>

        {/* ── INTERACTIVE CATALOG PANEL ── */}
        <div id="catalog">
          <Suspense fallback={<CatalogSkeleton />}>
            <ProductCatalogPanel products={products} />
          </Suspense>
        </div>
      </main>


      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
