"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   TYPES
   fullImage — entire card = pre-designed banner
   column    — 3-col layout: text | product | benefits+results
───────────────────────────────────────────── */
type FullImageSlide = {
  id: string;
  type: "fullImage";
  image: string;
  ctaHref: string;
  indicatorColor: string;
};

type ColumnSlide = {
  id: string;
  type: "column";
  eyebrow: string;
  headline: string;
  description: string;
  badges: string[];
  cta: string;
  ctaHref: string;
  bgGradient: string;
  eyebrowColor: string;
  ctaBg: string;
  productImage: string;
  benefits: { icon: string; text: string }[];
  beforeImage: string;
  afterImage: string;
  afterLabel: string;
  caption: string;
  indicatorColor: string;
};

type HeroSlide = FullImageSlide | ColumnSlide;

/* ─────────────────────────────────────────────
   SLIDE DATA
───────────────────────────────────────────── */
const slides: HeroSlide[] = [
  /* Slide 0 — full pre-designed banner image */
  {
    id: "slide1-banner",
    type: "fullImage",
    image: "/images/slide1.avif",
    ctaHref: "/products?category=face-wash",
    indicatorColor: "#1A4A22",
  },
  /* Slide 1 — Pigmentation column layout */
  {
    id: "pigmentation",
    type: "column",
    eyebrow: "HERBAL RITUAL",
    headline: "Struggling With\nPigmentation?",
    description: "Powered by Vetpalai, Kumkumadi\nand Herbal Extracts.",
    badges: ["100% Herbal", "Paraben Free"],
    cta: "SHOP NOW",
    ctaHref: "/products",
    bgGradient: "linear-gradient(145deg, #FBF0F5 0%, #F5E2EE 55%, #EED5E8 100%)",
    eyebrowColor: "#7A2848",
    ctaBg: "#6E2E4A",
    productImage: "/images/cat-face-cream.avif",
    benefits: [
      { icon: "spot", text: "Reduces Dark\nSpots" },
      { icon: "leaf", text: "Anti-Aging\nFormula" },
      { icon: "glow", text: "Brightens\nSkin Tone" },
    ],
    beforeImage: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/1-before.avif",
    afterImage: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/1-after.avif",
    afterLabel: "AFTER 4 WEEKS",
    caption: "Visible reduction in pigmentation & dark spots.",
    indicatorColor: "#8B3A5E",
  },
  /* Slide 2 — Whitening column layout */
  {
    id: "whitening",
    type: "column",
    eyebrow: "GLOW RITUAL",
    headline: "Radiant Skin\nIn 7 Days.",
    description: "Crafted with Saffron, Turmeric\nand Ancient Botanicals.",
    badges: ["100% Natural", "Skin Brightening"],
    cta: "SHOP NOW",
    ctaHref: "/products?category=face-cream",
    bgGradient: "linear-gradient(145deg, #FFF8EC 0%, #FAE8D0 55%, #F4D8B8 100%)",
    eyebrowColor: "#7A5020",
    ctaBg: "#6A4018",
    productImage: "/images/cat-nalangu-maavu.avif",
    benefits: [
      { icon: "glow", text: "Skin\nWhitening" },
      { icon: "drop", text: "Moisture\nLocking" },
      { icon: "spot", text: "Natural\nGlow" },
    ],
    beforeImage: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/2-before.avif",
    afterImage: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/2-after.avif",
    afterLabel: "AFTER 4 WEEKS",
    caption: "Visible improvement in skin tone & radiance.",
    indicatorColor: "#7A5020",
  },
  /* Slide 3 — Face Wash column layout */
  {
    id: "facewash",
    type: "column",
    eyebrow: "HERBAL CLEANSE",
    headline: "Refresh &\nCleanse Daily.",
    description: "Butterfly Pea & Red Wine\nfor naturally clear skin.",
    badges: ["100% Herbal", "Sulphate Free"],
    cta: "EXPLORE",
    ctaHref: "/products?category=face-wash",
    bgGradient: "linear-gradient(145deg, #EDFBEE 0%, #D8F0DC 55%, #C4E4C8 100%)",
    eyebrowColor: "#1A5828",
    ctaBg: "#1A4A22",
    productImage: "/images/cat-face-wash.avif",
    benefits: [
      { icon: "dirt", text: "Removes Dirt\n& Impurities" },
      { icon: "drop", text: "Controls Oil\n& Acne" },
      { icon: "glow", text: "Brightens &\nRevives Skin" },
    ],
    beforeImage: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/3-before.avif",
    afterImage: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/3-after.avif",
    afterLabel: "AFTER 4 WEEKS",
    caption: "Visible reduction in acne, oil & dullness with regular use.",
    indicatorColor: "#1A4A22",
  },
];

/* ─────────────────────────────────────────────
   BENEFIT ICON SVGs
───────────────────────────────────────────── */
function BenefitIcon({ type, color }: { type: string; color: string }) {
  const s = {
    stroke: color,
    fill: "none",
    strokeWidth: "1.3",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const ring = { cx: "11", cy: "11", r: "10", stroke: color, strokeWidth: "1.2", fill: "rgba(255,255,255,0.7)" };

  if (type === "dirt" || type === "spot") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle {...ring} />
        <circle cx="11" cy="9" r="2.8" {...s} />
        <path d="M6.5 16c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5" {...s} />
      </svg>
    );
  }
  if (type === "drop") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle {...ring} />
        <path d="M11 5.5C11 5.5 7.5 10 7.5 12.8a3.5 3.5 0 007 0C14.5 10 11 5.5 11 5.5Z" {...s} />
      </svg>
    );
  }
  if (type === "glow") {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle {...ring} />
        <circle cx="11" cy="11" r="2.8" {...s} />
        <path d="M11 6V5M11 17v-1M6 11H5M17 11h-1M7.4 7.4l-.7-.7M15.3 15.3l-.7-.7M7.4 14.6l-.7.7M15.3 6.7l-.7.7" {...s} />
      </svg>
    );
  }
  /* leaf fallback */
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <circle {...ring} />
      <path d="M11 16C11 16 7.5 12.5 8 9c.4-2.8 5-3 5.5 0C14 12.5 11 16 11 16Z" {...s} />
      <path d="M11 16L11 11.5" {...s} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function MobileHeroBanner() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const goTo = useCallback((idx: number) => setActive(idx), []);

  /* Auto-advance every 5 s */
  useEffect(() => {
    const id = setInterval(() => setActive((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) setActive((c) => (c + 1) % slides.length);
      else setActive((c) => (c - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div
      className="block md:hidden w-full"
      style={{ padding: "10px 12px 14px", background: "#FDF6F0" }}
    >
      {/* ── Card wrapper — landscape ratio ── */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "20px",
          height: "213px",
          boxShadow: "0 5px 24px rgba(0,0,0,0.09), 0 1px 6px rgba(0,0,0,0.05)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Hero banner carousel"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0"
            style={{
              opacity: i === active ? 1 : 0,
              transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              zIndex: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
              background: slide.type === "column" ? slide.bgGradient : "transparent",
              display: "flex",
            }}
            aria-hidden={i !== active}
          >
            {/* ════════════════════════════════
                FULL-IMAGE SLIDE
                The entire card is the pre-designed banner
            ════════════════════════════════ */}
            {slide.type === "fullImage" && (
              <Link
                href={slide.ctaHref}
                tabIndex={i === active ? 0 : -1}
                className="block absolute inset-0"
                aria-label="Shop Saaral Face Wash"
              >
                <Image
                  src={slide.image}
                  alt="Saaral Face Wash — Herbal Cleanse Banner"
                  fill
                  sizes="(max-width: 768px) 100vw"
                  className="object-cover object-left-top"
                  style={{ pointerEvents: "none" }}
                  priority
                  fetchPriority="high"
                />
              </Link>
            )}

            {/* ════════════════════════════════
                COLUMN SLIDE
                Left: text | Centre: product | Right: benefits + results
            ════════════════════════════════ */}
            {slide.type === "column" && (
              <>
                {/* COL 1 — Left text (38%) */}
                <div
                  style={{
                    width: "38%",
                    flexShrink: 0,
                    padding: "14px 4px 14px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 0,
                  }}
                >
                  {/* Eyebrow */}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "7.5px",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: slide.eyebrowColor,
                      display: "block",
                      marginBottom: "3px",
                    }}
                  >
                    {slide.eyebrow}
                  </span>
                  {/* Divider */}
                  <div
                    style={{
                      width: "24px",
                      height: "1.5px",
                      background: slide.eyebrowColor,
                      borderRadius: "2px",
                      marginBottom: "7px",
                      opacity: 0.75,
                    }}
                  />
                  {/* Headline */}
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      lineHeight: 1.12,
                      letterSpacing: "-0.02em",
                      fontWeight: 700,
                      color: "#1A1008",
                      marginBottom: "6px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {slide.headline}
                  </h2>
                  {/* Description */}
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "8.5px",
                      lineHeight: 1.5,
                      color: "rgba(26,16,8,0.55)",
                      marginBottom: "8px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {slide.description}
                  </p>
                  {/* Badge pills */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                      marginBottom: "9px",
                    }}
                  >
                    {slide.badges.map((badge) => (
                      <span
                        key={badge}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "7px",
                          fontWeight: 600,
                          color: slide.eyebrowColor,
                          background: "rgba(255,255,255,0.68)",
                          border: `1px solid ${slide.eyebrowColor}28`,
                          borderRadius: "100px",
                          padding: "2px 7px",
                          whiteSpace: "nowrap",
                          alignSelf: "flex-start",
                        }}
                      >
                        🌿 {badge}
                      </span>
                    ))}
                  </div>
                  {/* CTA button */}
                  <Link
                    href={slide.ctaHref}
                    tabIndex={i === active ? 0 : -1}
                    className="active:scale-95 transition-transform"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#fff",
                      background: slide.ctaBg,
                      borderRadius: "100px",
                      padding: "7px 13px",
                      boxShadow: `0 3px 12px ${slide.ctaBg}55`,
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {slide.cta}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M1.5 5h7M6 2L8.5 5 6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  {/* Stars */}
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <svg key={idx} width="9" height="9" viewBox="0 0 16 16" fill="#E8A020" aria-hidden="true">
                        <path d="M8 1.3l1.75 3.54 3.91.57-2.83 2.76.67 3.9L8 10.1l-3.5 1.97.67-3.9L2.34 5.41l3.91-.57L8 1.3z" />
                      </svg>
                    ))}
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "7.5px",
                        fontWeight: 500,
                        color: "rgba(26,16,8,0.55)",
                        marginLeft: "2px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      20,000+ Happy Customers
                    </span>
                  </div>
                </div>

                {/* COL 2 — Centre product image (26%) */}
                <div
                  style={{
                    width: "26%",
                    flexShrink: 0,
                    position: "relative",
                    paddingTop: "6px",
                    animation: "hero-product-float 3.5s ease-in-out infinite",
                  }}
                >
                  <Image
                    src={slide.productImage}
                    alt={slide.headline.replace("\n", " ")}
                    fill
                    sizes="26vw"
                    className="object-contain object-bottom"
                    style={{
                      filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.18))",
                      pointerEvents: "none",
                    }}
                    loading="lazy"
                  />
                </div>

                {/* COL 3 — Right: benefits + results card (36%) */}
                <div
                  style={{
                    width: "36%",
                    flexShrink: 0,
                    padding: "12px 10px 10px 4px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    gap: "5px",
                  }}
                >
                  {/* 3 benefit items */}
                  {slide.benefits.map((benefit) => (
                    <div
                      key={benefit.text}
                      style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255,255,255,0.60)",
                          borderRadius: "50%",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                        }}
                      >
                        <BenefitIcon type={benefit.icon} color={slide.eyebrowColor} />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "7.5px",
                          fontWeight: 600,
                          color: "#1A1008",
                          lineHeight: 1.35,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {benefit.text}
                      </span>
                    </div>
                  ))}

                  {/* Real Customer Results card */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "9px",
                      overflow: "hidden",
                      boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
                      border: "1.5px solid rgba(255,255,255,0.9)",
                      marginTop: "3px",
                    }}
                  >
                    {/* Label */}
                    <div style={{ padding: "3px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "6px",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#1A1008",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        Real Customer Results
                      </span>
                    </div>
                    {/* Before / After photos */}
                    <div style={{ display: "flex", height: "50px" }}>
                      <div
                        style={{
                          flex: 1,
                          position: "relative",
                          borderRight: "1px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.beforeImage}
                          alt="Before"
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
                            display: "block",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            bottom: "2px",
                            left: "2px",
                            fontFamily: "var(--font-body)",
                            fontSize: "6px",
                            fontWeight: 700,
                            color: "#fff",
                            background: "rgba(0,0,0,0.55)",
                            borderRadius: "2px",
                            padding: "1px 3px",
                            lineHeight: 1,
                            letterSpacing: "0.04em",
                          }}
                        >
                          BEFORE
                        </span>
                      </div>
                      <div style={{ flex: 1, position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.afterImage}
                          alt="After"
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
                            display: "block",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            bottom: "2px",
                            right: "2px",
                            fontFamily: "var(--font-body)",
                            fontSize: "6px",
                            fontWeight: 700,
                            color: "#fff",
                            background: `${slide.indicatorColor}CC`,
                            borderRadius: "2px",
                            padding: "1px 3px",
                            lineHeight: 1,
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {slide.afterLabel}
                        </span>
                      </div>
                    </div>
                    {/* Caption */}
                    <div style={{ padding: "3px 5px" }}>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "6px",
                          fontWeight: 400,
                          color: "rgba(26,16,8,0.58)",
                          lineHeight: 1.45,
                          margin: 0,
                        }}
                      >
                        {slide.caption}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* ── Slide indicators — bottom right ── */}
        <div
          style={{
            position: "absolute",
            bottom: "9px",
            right: "11px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: active === i ? "18px" : "6px",
                height: "6px",
                borderRadius: active === i ? "3px" : "50%",
                background:
                  active === i
                    ? slides[active].indicatorColor
                    : "rgba(26,16,8,0.20)",
                transition: "all 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* Larger tap target */}
              <span style={{ position: "absolute", inset: "-14px" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Floating product animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes hero-product-float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-5px); }
          }
        `,
      }} />
    </div>
  );
}
