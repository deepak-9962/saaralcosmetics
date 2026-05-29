"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   SLIDE DATA — uses existing /public/images assets
───────────────────────────────────────────── */
const slides = [
  {
    id: "heritage",
    imageAvif: "/images/hero-mobile.avif",
    imageWebp: "/images/hero-mobile.webp",
    imagePng: "/images/hero.png",
    eyebrow: "Apothecary Heritage",
    headline: "Luxury Skincare,\nRooted in Nature.",
    subtext: "Ancient botanical ingredients for naturally radiant skin.",
    cta: "Shop the Ritual",
    ctaHref: "/products",
    overlayFrom: "rgba(42,26,20,0.55)",
    overlayTo: "rgba(42,26,20,0.0)",
    textColor: "#FDF6F0",
    accentColor: "#C9A74D",
    ctaBg: "#8B3A5E",
  },
  {
    id: "banner2",
    imageAvif: "/images/saaral-banner-2.avif",
    imageWebp: "/images/saaral-banner-2.webp",
    imagePng: "/images/saaral-banner-2.png",
    eyebrow: "New Collection",
    headline: "Glow Naturally\nThis Season.",
    subtext: "Heritage botanical formulas crafted for modern radiance.",
    cta: "Explore Collection",
    ctaHref: "/products",
    overlayFrom: "rgba(20,10,5,0.65)",
    overlayTo: "rgba(20,10,5,0.08)",
    textColor: "#FDF6F0",
    accentColor: "#C9A74D",
    ctaBg: "#4A5E3A",
  },
  {
    id: "banner3",
    imageAvif: "/images/saaral-banner-3.avif",
    imageWebp: "/images/saaral-banner-3.webp",
    imagePng: "/images/saaral-banner-3.png",
    eyebrow: "Herbal Ritual",
    headline: "Herbal Radiance,\nEvery Day.",
    subtext: "Pure plant actives. Zero compromise. Just results.",
    cta: "Shop Now",
    ctaHref: "/products",
    overlayFrom: "rgba(30,18,10,0.60)",
    overlayTo: "rgba(30,18,10,0.05)",
    textColor: "#FDF6F0",
    accentColor: "#C9A74D",
    ctaBg: "#8B3A5E",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function MobileHeroBanner() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
  }, []);

  /* Auto-advance every 5s */
  useEffect(() => {
    const id = setInterval(() => {
      setActive((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* Touch handling */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setDragging(false);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) setActive((c) => (c + 1) % slides.length);
      else setActive((c) => (c - 1 + slides.length) % slides.length);
    }
  };

  const slide = slides[active];

  return (
    <div
      className="block md:hidden mx-4 mb-4 relative overflow-hidden"
      style={{
        height: "210px",
        borderRadius: "18px",
        background: "#1A0A05",
      }}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured campaigns carousel"
    >
      {/* ── Slides (layered, opacity transition) ── */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            zIndex: i === active ? 1 : 0,
          }}
          aria-hidden={i !== active}
        >
          {/* Background image */}
          <div className="absolute inset-0 block w-full h-full">
            <Image
              src={s.imageAvif}
              alt="Saaral Cosmetics"
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "low"}
              fill
              sizes="(max-width: 768px) 100vw, 100vw"
              className="object-cover object-center"
              style={{ pointerEvents: "none", userSelect: "none" }}
            />
          </div>

          {/* Gradient overlay — bottom-up for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${s.overlayFrom} 0%, ${s.overlayFrom} 30%, rgba(0,0,0,0.25) 60%, ${s.overlayTo} 100%)`,
            }}
            aria-hidden="true"
          />

          {/* ── Text Content — bottom of slide ── */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 pb-8"
            style={{
              transform: i === active ? "translateY(0)" : "translateY(10px)",
              transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
            }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div
                className="h-px w-4 shrink-0"
                style={{ background: s.accentColor }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "8px",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: s.accentColor,
                }}
              >
                {s.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                fontWeight: 600,
                color: s.textColor,
                marginBottom: "6px",
                whiteSpace: "pre-line",
              }}
            >
              {s.headline}
            </h2>

            {/* Subtext */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                lineHeight: 1.5,
                color: `${s.textColor}CC`,
                marginBottom: "10px",
                maxWidth: "200px",
              }}
            >
              {s.subtext}
            </p>

            {/* CTA */}
            <Link
              href={s.ctaHref}
              className="inline-flex items-center gap-1.5 active:scale-95 transition-transform"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#fff",
                background: s.ctaBg,
                borderRadius: "100px",
                padding: "7px 16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              {s.cta}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <polyline points="7,3 10,6 7,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

        </div>
      ))}

      {/* ── Dot indicators ── */}
      <div
        className="absolute flex gap-1.5"
        style={{ bottom: "10px", right: "12px", zIndex: 10 }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: active === i ? "20px" : "6px",
              height: "4px",
              borderRadius: "2px",
              background: active === i ? "#C9A74D" : "rgba(255,255,255,0.45)",
              transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
