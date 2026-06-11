"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Transformation {
  id: string;
  customer: string;
  age: number;
  location: string;
  duration: string;
  product: string;
  productHref: string;
  productHref2?: string;
  product2Label?: string;
  concerns: string[];
  result: string;
  /* Images: real customer photos will go here.
     Using solid color placeholder divs until assets are uploaded. */
  beforeSrc?: string;
  afterSrc?: string;
  beforeBg: string;   // placeholder colour for "before" side
  afterBg: string;    // placeholder colour for "after" side
  accentColor: string;
  tagLabel: string;
  tagIcon: React.ReactNode;
}

/* ─────────────────────────────────────────────
   DATA — 3 customer stories
   Replace beforeSrc / afterSrc with real AVIF paths when ready
───────────────────────────────────────────── */
const TRANSFORMATIONS: Transformation[] = [
  {
    id: "face-skin",
    customer: "Yuvaraj",
    age: 37,
    location: "Chennai, Tamil Nadu",
    duration: "8 weeks",
    product: "Skin Whitening Cream + Manjistha Soap",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products?category=soap",
    product2Label: "Manjistha Soap",
    concerns: ["Skin Whitening", "Dark Spots", "Natural Glow"],
    result: "Visible skin brightening and natural glow improvement. Manjistha Soap helped clear the skin noticeably.",
    beforeSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/1-before.avif",
    afterSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/1-after.avif",
    beforeBg: "linear-gradient(135deg, #E8C9B8 0%, #D4A88A 100%)",
    afterBg: "linear-gradient(135deg, #F0DDD0 0%, #E8C8B5 100%)",
    accentColor: "#B06080",
    tagLabel: "Skin Whitening",
    tagIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
      </svg>
    ),
  },
  {
    id: "under-eye",
    customer: "Chitra",
    age: 28,
    location: "Chennai, Tamil Nadu",
    duration: "6 weeks",
    product: "Skin Whitening Cream + Redwine Face Wash",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/redwine-facewash",
    product2Label: "Redwine Face Wash",
    concerns: ["Skin Whitening", "Dullness", "Uneven Skin Tone"],
    result: "Skin tone visibly brightened and face appeared more radiant. Redwine Face Wash helped deeply cleanse and enhance glow.",
    beforeSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/2-before.avif",
    afterSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/2-after.avif",
    beforeBg: "linear-gradient(135deg, #C8B8A8 0%, #B0A090 100%)",
    afterBg: "linear-gradient(135deg, #DDD0C0 0%, #CCBCAA 100%)",
    accentColor: "#7A2040",
    tagLabel: "Glow & Radiance",
    tagIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: "anti-aging",
    customer: "Kavitha",
    age: 25,
    location: "Madurai, Tamil Nadu",
    duration: "10 weeks",
    product: "Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash",
    productHref: "/products/saaral-anti-aging-pigmentation-cream-15g",
    productHref2: "/products/butterfly-pea-facewash-sangoo-poo",
    product2Label: "Butterfly Pea Face Wash",
    concerns: ["Pigmentation", "Anti-Aging", "Skin Brightening"],
    result: "Significant reduction in pigmentation and fine lines. Butterfly Pea Face Wash visibly revived and refreshed the complexion.",
    beforeSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/3-before.avif",
    afterSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/3-after.avif",
    beforeBg: "linear-gradient(135deg, #3D2A1A 0%, #5A3E28 100%)",
    afterBg: "linear-gradient(135deg, #5A3E28 0%, #7A5A3A 100%)",
    accentColor: "#4A7C59",
    tagLabel: "Anti-Aging",
    tagIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 0 1 10 10c0 4-2.5 7.5-6 9" />
        <path d="M12 22a10 10 0 0 1-10-10c0-4 2.5-7.5 6-9" />
      </svg>
    ),
  },
  /* ── Slots 4-6: upload images to Supabase at 4-before.avif / 4-after.avif etc. ── */
  {
    id: "pigmentation-ponni",
    customer: "Ponni",
    age: 50,
    location: "Chennai, Tamil Nadu",
    duration: "8 weeks",
    product: "Anti Aging & Pigmentation Cream + Redwine Face Wash",
    productHref: "/products/saaral-anti-aging-pigmentation-cream-15g",
    productHref2: "/products/redwine-facewash",
    product2Label: "Redwine Face Wash",
    concerns: ["Pigmentation", "Dark Spots", "Skin Brightening"],
    result: "Visible reduction in stubborn pigmentation and dark spots. Redwine Face Wash deeply refreshed and brightened the face.",
    beforeSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/4-before.avif",
    afterSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/4-after.avif",
    beforeBg: "linear-gradient(135deg, #B8A8C8 0%, #9890B0 100%)",
    afterBg: "linear-gradient(135deg, #D8C8E8 0%, #C8B8D8 100%)",
    accentColor: "#8B3A5E",
    tagLabel: "Pigmentation",
    tagIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "complete-glow-kalavathi",
    customer: "Kalavathi",
    age: 30,
    location: "Ambattur, Chennai",
    duration: "10 weeks",
    product: "Skin Whitening Cream + Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/butterfly-pea-facewash-sangoo-poo",
    product2Label: "Butterfly Pea Face Wash",
    concerns: ["Skin Whitening", "Pigmentation", "Natural Glow"],
    result: "Excellent brightness and reduced dark spots. The combination of Whitening Cream, Pigmentation Cream, and Butterfly Pea Face Wash completely transformed the texture and glow.",
    beforeSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/5-before.avif",
    afterSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/5-after.avif",
    beforeBg: "linear-gradient(135deg, #C8A890 0%, #B08870 100%)",
    afterBg: "linear-gradient(135deg, #E0C8B0 0%, #D0B8A0 100%)",
    accentColor: "#2E5B82",
    tagLabel: "Complete Glow",
    tagIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: "whitening-pigmentation-prema",
    customer: "Prema",
    age: 27,
    location: "Thirupathi, Andhra Pradesh",
    duration: "8 weeks",
    product: "Skin Whitening Cream + Anti Aging & Pigmentation Cream",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product2Label: "Anti Aging Cream",
    concerns: ["Skin Whitening", "Pigmentation", "Natural Glow"],
    result: "Remarkable reduction in pigmentation and dark spots. Skin became significantly fairer, brighter, and more even-toned within 8 weeks of consistent use.",
    beforeSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/6-before.avif",
    afterSrc: "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/6-after.avif",
    beforeBg: "linear-gradient(135deg, #C8A060 0%, #A87A40 100%)",
    afterBg: "linear-gradient(135deg, #E8C080 0%, #D0A860 100%)",
    accentColor: "#B06080",
    tagLabel: "Complete Glow",
    tagIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];


/* ─────────────────────────────────────────────
   ANIMATED SECTION CONSTANTS
───────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────
   BEFORE / AFTER SLIDER (client-interactive leaf)
───────────────────────────────────────────── */
function BeforeAfterSlider({
  item,
  index,
}: {
  item: Transformation;
  index: number;
}) {
  const [sliderPos, setSliderPos] = useState(50); // 0–100 (percent)
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Compute fractional position from pointer/touch event */
  const getPct = useCallback((clientX: number): number => {
    const el = containerRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, raw));
  }, []);

  /* Mouse events */
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasInteracted(true);
    setSliderPos(getPct(e.clientX));
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => setSliderPos(getPct(e.clientX));
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, getPct]);

  /* Touch events */
  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setHasInteracted(true);
    setSliderPos(getPct(e.touches[0].clientX));
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      setSliderPos(getPct(e.touches[0].clientX));
    };
    const onEnd = () => setIsDragging(false);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, getPct]);

  /* Subtle idle animation — gently oscillates between 40–60% when not interacted */
  useEffect(() => {
    if (hasInteracted) return;
    let frame: number;
    let start: number | null = null;
    const RANGE = 8; // ±8% around center
    const PERIOD = 3800; // ms per full cycle

    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) % PERIOD) / PERIOD;
      const phase = Math.sin(t * 2 * Math.PI);
      setSliderPos(50 + phase * RANGE);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [hasInteracted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.78, delay: index * 0.12, ease }}
      className="flex flex-col w-full"
      style={{ height: "390px" }}
    >
      {/* ── Card shell ── */}
      <div
        className="relative rounded-[28px] overflow-hidden bg-[#1A0E08] h-full w-full"
        style={{
          boxShadow:
            "0 20px 56px -12px rgba(42,26,20,0.18), 0 4px 16px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Image comparison zone — fills the entire card ── */}
        {/* data-comparison-zone tells Embla's watchDrag to ignore drags here */}
        <div
          ref={containerRef}
          data-comparison-zone="true"
          className="absolute inset-0 w-full h-full select-none"
          style={{
            cursor: isDragging ? "col-resize" : "ew-resize",
            touchAction: "none",
          }}
          onMouseDown={onMouseDown}
          onPointerDown={(e) => {
            /* Belt-and-suspenders: block Embla's pointerdown listener */
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            /* Belt-and-suspenders: block Embla's touchstart listener */
            e.stopPropagation();
            onTouchStart(e);
          }}
          aria-label={`Before and after comparison for ${item.customer}. Drag to compare.`}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
        >
          {/* ── AFTER — full-size background, always 100% visible ── */}
          {/* No clip applied: AFTER is the base layer the user always sees   */}
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              {item.afterSrc ? (
                <Image
                  src={item.afterSrc}
                  alt={`After — ${item.customer}`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-top pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ background: item.afterBg }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    After photo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── BEFORE — clips from the RIGHT, overlays the left portion ── */}
          {/* inset(0  rightClip%  0  0) hides `rightClip`% from the right.  */}
          {/* sliderPos=50 → inset(0 50% 0 0) → BEFORE covers left 50%.     */}
          {/* Drag RIGHT (↑ sliderPos) → less right-clip → more BEFORE.     */}
          {/* Drag LEFT  (↓ sliderPos) → more right-clip → more AFTER.      */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <div className="relative w-full h-full">
              {item.beforeSrc ? (
                <Image
                  src={item.beforeSrc}
                  alt={`Before — ${item.customer}`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-top pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ background: item.beforeBg }}
                  aria-hidden="true"
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    Before photo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Divider line ── */}
          <div
            className="absolute inset-y-0 z-10 pointer-events-none"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-white/90" />
          </div>

          {/* ── Drag handle knob ── */}
          <div
            className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
            aria-hidden="true"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={item.accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 12H16M8 12l-3 3M8 12l-3-3M16 12l3 3M16 12l3-3" />
              </svg>
            </div>
          </div>

          {/* ── Before / After labels ── */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none" aria-hidden="true">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-white/90"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                background: "rgba(42,26,20,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Before
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10 pointer-events-none" aria-hidden="true">
            <span
              className="inline-block px-2.5 py-1 rounded-full"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#fff",
                background: item.accentColor,
                border: `1px solid ${item.accentColor}`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              After
            </span>
          </div>

          {/* ── Drag hint — fades on first interaction ── */}
          <motion.div
            className="absolute top-1/2 inset-x-0 flex justify-center z-10 pointer-events-none"
            animate={{ opacity: hasInteracted ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "8.5px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: "100px",
                padding: "4px 12px",
              }}
            >
              Drag to compare
            </span>
          </motion.div>

          {/* ── Glassmorphism info overlay at the bottom ── */}
          <div
            className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(20,10,6,0.88) 0%, rgba(20,10,6,0.6) 60%, transparent 100%)",
              padding: "32px 16px 14px",
            }}
          >
            {/* Customer name + location */}
            <div className="flex items-end justify-between gap-2 mb-2">
              <div>
                <p
                  className="font-display"
                  style={{ fontSize: "15px", lineHeight: 1.15, letterSpacing: "-0.01em", color: "#fff" }}
                >
                  {item.customer}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: "2px",
                    letterSpacing: "0.03em",
                  }}
                >
                  Age {item.age} · {item.location}
                </p>
              </div>

              {/* Duration badge */}
              <div
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.duration}
                </span>
              </div>
            </div>

            {/* Concerns + CTA row */}
            <div className="flex items-center justify-between gap-2 pointer-events-auto">
              {/* Category tag */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "8.5px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: item.accentColor,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {item.tagIcon}
                {item.tagLabel}
              </span>

              {/* Shop buttons — primary + optional secondary product */}
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <Link
                  href={item.productHref}
                  className="group inline-flex items-center gap-1 rounded-full transition-all duration-300 active:scale-95"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: item.accentColor,
                    padding: "6px 12px",
                    boxShadow: `0 4px 12px ${item.accentColor}66`,
                  }}
                >
                  Shop
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="7,3 10,6 7,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                {item.productHref2 && (
                  <Link
                    href={item.productHref2}
                    className="group inline-flex items-center gap-1 rounded-full transition-all duration-300 active:scale-95"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: item.accentColor,
                      background: "rgba(255,255,255,0.92)",
                      border: `1px solid ${item.accentColor}44`,
                      padding: "5px 10px",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                    aria-label={`Shop ${item.product2Label}`}
                  >
                    {item.product2Label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/* ─────────────────────────────────────────────
   TRUST STAT COMPONENT
───────────────────────────────────────────── */
function TrustStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 text-center"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay, ease }}
    >
      <span
        className="font-display"
        style={{ fontSize: "clamp(24px, 3.5vw, 38px)", color: "#C9A74D", letterSpacing: "-0.02em", lineHeight: 1.1 }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10.5px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(90,58,44,0.55)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function CustomerTransformations() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    /*
     * watchDrag — Embla calls this before starting a drag.
     * Return false to cancel the drag entirely.
     * We cancel whenever the pointer started inside a comparison zone,
     * so swiping the before/after divider never triggers a card slide.
     */
    watchDrag: (_emblaApi, evt) => {
      const target = evt.target as Element | null;
      if (target?.closest('[data-comparison-zone="true"]')) {
        return false; // ← let the slider handle it, not the carousel
      }
      return true; // ← normal carousel drag
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #F2E0D5 0%, #EDD5CA 28%, #F7EAE2 65%, #FDF6F0 100%)",
        padding: "88px 0 100px",
      }}
      aria-label="Customer transformation results"
    >
      {/* ── Ambient background orbs ── */}
      <div
        className="absolute top-0 left-[-120px] w-[520px] h-[520px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(201,167,77,0.14) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-[-80px] w-[480px] h-[480px] rounded-full blur-[120px] pointer-events-none opacity-35"
        style={{ background: "radial-gradient(circle, rgba(176,96,128,0.12) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-[35%] right-[20%] w-[280px] h-[280px] rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgba(74,124,89,0.18) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* ── Fine horizontal rule at top ── */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(201,167,77,0.35), transparent)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px]">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 md:mb-18 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.72, ease }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: "#C9A74D" }} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C9A74D",
                }}
              >
                Real People, Real Results
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-display text-[#2A1A14]"
              style={{
                fontSize: "clamp(34px, 4.5vw, 58px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              Customer{" "}
              <em style={{ fontStyle: "italic", color: "#B06080" }}>Transformations</em>
            </h2>

            {/* Subheading */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "rgba(90,58,44,0.6)",
                maxWidth: "400px",
                marginTop: "12px",
              }}
            >
              Unfiltered results from customers who trusted Saaral's Ayurvedic
              formulations. Drag each image to see the change.
            </p>
          </motion.div>

          {/* Right block: trust stat pills */}
          <motion.div
            className="flex flex-row md:flex-col items-start md:items-end gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.18, ease }}
          >
            {[
              { text: "No filters applied", icon: "check" },
              { text: "Submitted by customers", icon: "check" },
              { text: "Results may vary", icon: "info" },
            ].map(({ text, icon }) => (
              <div key={text} className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ color: icon === "check" ? "#4A7C59" : "#C9A74D" }}
                >
                  {icon === "check" ? "check_circle" : "info"}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "rgba(90,58,44,0.6)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Infinite carousel — active on all screen sizes ── */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-stretch" style={{ gap: "0px" }}>
            {TRANSFORMATIONS.map((item, i) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 px-2 md:flex-[0_0_calc(33.333%-18px)] md:mx-[9px] flex flex-col"
              >
                <BeforeAfterSlider item={item} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Carousel navigation: arrows + dots (all screen sizes) ── */}
        <div className="flex items-center justify-center gap-4 mt-8">

          {/* Prev arrow */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous transformation"
            className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:scale-105"
            style={{
              width: "clamp(36px, 3vw, 44px)",
              height: "clamp(36px, 3vw, 44px)",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(201,167,77,0.35)",
              boxShadow: "0 2px 14px rgba(42,26,20,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B3A5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {TRANSFORMATIONS.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: index === selectedIndex ? "24px" : "8px",
                  height: "8px",
                  background: index === selectedIndex ? "#B06080" : "rgba(90,58,44,0.22)",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next transformation"
            className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:scale-105"
            style={{
              width: "clamp(36px, 3vw, 44px)",
              height: "clamp(36px, 3vw, 44px)",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(201,167,77,0.35)",
              boxShadow: "0 2px 14px rgba(42,26,20,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B3A5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

        </div>

        {/* ── Slide counter (desktop only) ── */}
        <div className="hidden md:flex justify-center mt-3">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(90,58,44,0.4)",
            }}
          >
            {selectedIndex + 1} / {TRANSFORMATIONS.length}
          </span>
        </div>


        {/* ── Trust stats strip ── */}
        <motion.div
          className="mt-16 md:mt-20 pt-10"
          style={{
            borderTop: "1px solid rgba(201,167,77,0.2)",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            <TrustStat value="1,000+" label="Happy Customers" delay={0.0} />
            <TrustStat value="4.9★" label="Average Rating" delay={0.08} />
            <TrustStat value="100%" label="Natural Ingredients" delay={0.16} />
            <TrustStat value="6–10 wk" label="Visible Results" delay={0.24} />
          </div>

          {/* View all CTA */}
          <div className="flex justify-center mt-10">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 rounded-full transition-all duration-400 hover:gap-3.5 active:scale-95"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10.5px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#8B3A5E",
                border: "1px solid rgba(139,58,94,0.3)",
                padding: "13px 32px",
                background: "rgba(253,246,240,0.6)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 16px rgba(139,58,94,0.06)",
              }}
            >
              Start Your Ritual
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="group-hover:translate-x-0.5 transition-transform duration-300"
                aria-hidden="true"
              >
                <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <polyline points="7,3 10,6 7,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Fine horizontal rule at bottom ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(201,167,77,0.25), transparent)" }}
        aria-hidden="true"
      />
    </section>
  );
}
