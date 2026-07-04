"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Slide data — 3 slides, data-driven
───────────────────────────────────────────── */
const SLIDES = [
  {
    id: "butterfly-pea",
    badge: "APOTHECARY HERITAGE · TAMIL NADU",
    lines: ["Luxury Skincare,", "Rooted in Nature."],
    desc: "Ancient botanical ingredients crafted for naturally radiant modern skin.",
    primary: { text: "SHOP THE RITUAL", href: "/products" },
    secondary: { text: "OUR STORY", href: "/contact" },
    img: "/images/slide1.avif",
    imgWebp: "/images/slide1.webp",
    imgAlt: "Saaral Butterfly Pea Signature Collection — natural skincare products",
    /* Slide palette */
    sectionBg: "#EEE5F8",
    overlayRgb: "238,229,248",
    accent: "#6B4FA1",
    label: "#6B4FA1",
    text: "#2A1A14",
    muted: "rgba(42,26,20,0.50)",
    btnBg: "#6B4FA1",
    btnText: "#FFFFFF",
    btnShadow: "rgba(107,79,161,0.35)",
    outlineBorder: "rgba(107,79,161,0.28)",
    outlineText: "#6B4FA1",
    dot: "#6B4FA1",
    arrowBorder: "rgba(107,79,161,0.22)",
    arrowColor: "#6B4FA1",
    progressBg: "rgba(107,79,161,0.15)",
  },
  {
    id: "red-wine",
    badge: "RED WINE COLLECTION",
    lines: ["Age Gracefully.", "Glow Naturally."],
    desc: "Powerful antioxidant-rich skincare infused with red wine extracts for youthful, radiant skin.",
    primary: { text: "EXPLORE COLLECTION", href: "/products" },
    secondary: { text: "LEARN MORE", href: "/contact" },
    img: "/images/NewHeader/head2.avif",
    imgWebp: "/images/NewHeader/head2.webp",
    imgAlt: "Saaral Red Wine Anti-Aging Collection — luxury skincare",
    /* Slide palette */
    sectionBg: "#140308",
    overlayRgb: "18,3,10",
    accent: "#C7A36A",
    label: "#C7A36A",
    text: "#FDF6F0",
    muted: "rgba(253,246,240,0.52)",
    btnBg: "#C7A36A",
    btnText: "#140308",
    btnShadow: "rgba(199,163,106,0.40)",
    outlineBorder: "rgba(199,163,106,0.30)",
    outlineText: "#C7A36A",
    dot: "#C7A36A",
    arrowBorder: "rgba(199,163,106,0.25)",
    arrowColor: "#C7A36A",
    progressBg: "rgba(199,163,106,0.15)",
  },
  {
    id: "tamil-heritage",
    badge: "ANCIENT TAMIL SKINCARE",
    lines: ["Ancient Rituals.", "Modern Radiance."],
    desc: "Timeless herbal formulations inspired by generations of Tamil skincare wisdom.",
    primary: { text: "DISCOVER HERITAGE", href: "/products?category=nalangu-maavu" },
    secondary: { text: "VIEW COLLECTION", href: "/products" },
    img: "/images/NewHeader/head3.avif",
    imgWebp: "/images/NewHeader/head3.webp",
    imgAlt: "Saaral Tamil Heritage Collection — traditional herbal skincare",
    /* Slide palette */
    sectionBg: "#F2E4CC",
    overlayRgb: "242,228,204",
    accent: "#8A6A00",
    label: "#8A6A00",
    text: "#2A1A14",
    muted: "rgba(42,26,20,0.50)",
    btnBg: "#4B3425",
    btnText: "#F5EDE0",
    btnShadow: "rgba(75,52,37,0.35)",
    outlineBorder: "rgba(75,52,37,0.22)",
    outlineText: "#4B3425",
    dot: "#8A6A00",
    arrowBorder: "rgba(75,52,37,0.20)",
    arrowColor: "#4B3425",
    progressBg: "rgba(138,106,0,0.15)",
  },
] as const;

const AUTOPLAY_MS = 5000;
const FADE_MS = 800;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function DesktopHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [contentIn, setContentIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const s = SLIDES[current];

  /* ── Transition to a specific slide ── */
  const goTo = useCallback(
    (idx: number) => {
      if (busy || idx === current) return;
      setBusy(true);
      setContentIn(false);
      setTimeout(() => {
        setCurrent(idx);
        setContentIn(true);
        setBusy(false);
      }, FADE_MS / 2 + 50);
    },
    [busy, current]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  /* ── Autoplay ── */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_MS);
  }, [next]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  /* ── Pause when tab hidden ── */
  useEffect(() => {
    const onVisibility = () => (document.hidden ? stopTimer() : startTimer());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [startTimer, stopTimer]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { stopTimer(); prev(); startTimer(); }
      if (e.key === "ArrowRight") { stopTimer(); next(); startTimer(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, startTimer, stopTimer]);

  /* ── Touch swipe ── */
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 48) {
      stopTimer();
      delta < 0 ? next() : prev();
      startTimer();
    }
  };

  return (
    <section
      role="region"
      aria-label="Featured Collections"
      className="hidden md:block relative w-full overflow-hidden"
      style={{
        minHeight: "clamp(560px, 90vh, 860px)",
        background: s.sectionBg,
        transition: `background ${FADE_MS}ms ease`,
      }}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background image layers — opacity cross-fade ── */}
      {SLIDES.map((sl, i) => (
        <div
          key={sl.id}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            opacity: i === current ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
            zIndex: 0,
          }}
        >
          <Image
            src={sl.img}
            alt={sl.imgAlt}
            fill
            className="object-cover object-center"
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            sizes="(min-width: 768px) 55vw"
          />
        </div>
      ))}

      {/* ── Left-side gradient overlay — content bleeds into image ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to right,
            rgb(${s.overlayRgb}) 0%,
            rgba(${s.overlayRgb},0.94) 24%,
            rgba(${s.overlayRgb},0.72) 42%,
            rgba(${s.overlayRgb},0.28) 58%,
            rgba(${s.overlayRgb},0.04) 70%,
            transparent 80%
          )`,
          transition: `background ${FADE_MS}ms ease`,
          zIndex: 1,
        }}
      />

      {/* ── Ambient top-bottom vignette ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.04) 0%,
            transparent 20%,
            transparent 75%,
            rgba(0,0,0,0.08) 100%
          )`,
          zIndex: 2,
        }}
      />

      {/* ── ARIA live region for screen reader announcements ── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {`Slide ${current + 1} of ${SLIDES.length}: ${s.lines.join(" ")} — ${s.badge}`}
      </div>

      {/* ── LEFT — Editorial content ── */}
      <div
        className="relative flex flex-col justify-center h-full"
        style={{
          zIndex: 10,
          padding: `clamp(90px, 11vh, 130px) clamp(48px, 7.5vw, 108px) clamp(90px, 11vh, 130px) clamp(48px, 7.5vw, 108px)`,
          minHeight: "clamp(560px, 90vh, 860px)",
          maxWidth: "min(660px, 52vw)",
        }}
      >
        {/* Collection badge */}
        <div
          className="flex items-center gap-3 mb-9"
          style={{
            opacity: contentIn ? 1 : 0,
            transform: contentIn ? "none" : "translateY(8px)",
            transition: `opacity 0.55s ease 0.04s, transform 0.55s ease 0.04s`,
          }}
        >
          <div
            className="shrink-0 h-px w-7"
            style={{ background: s.label }}
          />
          <span
            className="font-body text-[10px] tracking-[0.24em] uppercase font-semibold"
            style={{ color: s.label }}
          >
            {s.badge}
          </span>
        </div>

        {/* Headline */}
        <div className="mb-7">
          {s.lines.map((line, li) => (
            <div
              key={li}
              style={{
                opacity: contentIn ? 1 : 0,
                transform: contentIn ? "none" : `translateY(${14 + li * 4}px)`,
                transition: `opacity 0.65s ease ${0.09 + li * 0.09}s, transform 0.65s ease ${0.09 + li * 0.09}s`,
              }}
            >
              <h2
                className="font-display block m-0 p-0"
                style={{
                  fontSize: "clamp(40px, 5.0vw, 78px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.032em",
                  color: s.text,
                  fontWeight: 700,
                }}
              >
                {line}
              </h2>
            </div>
          ))}
        </div>

        {/* Description */}
        <p
          className="font-body text-[15px] leading-[1.72] mb-10"
          style={{
            color: s.muted,
            maxWidth: "305px",
            opacity: contentIn ? 1 : 0,
            transform: contentIn ? "none" : "translateY(10px)",
            transition: `opacity 0.6s ease 0.28s, transform 0.6s ease 0.28s`,
          }}
        >
          {s.desc}
        </p>

        {/* CTA buttons */}
        <div
          className="flex items-center gap-4"
          style={{
            opacity: contentIn ? 1 : 0,
            transform: contentIn ? "none" : "translateY(10px)",
            transition: `opacity 0.6s ease 0.34s, transform 0.6s ease 0.34s`,
          }}
        >
          <Link
            href={s.primary.href}
            className="inline-flex items-center gap-2 rounded-full font-body text-[11px] tracking-[0.18em] uppercase font-semibold transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            style={{
              padding: "14px 32px",
              background: s.btnBg,
              color: s.btnText,
              boxShadow: `0 6px 24px ${s.btnShadow}`,
            }}
          >
            {s.primary.text}
          </Link>
          <Link
            href={s.secondary.href}
            className="inline-flex items-center gap-2 rounded-full font-body text-[11px] tracking-[0.18em] uppercase font-medium border transition-all duration-300 hover:scale-[1.04] active:scale-95"
            style={{
              padding: "13px 24px",
              borderColor: s.outlineBorder,
              color: s.outlineText,
            }}
          >
            {s.secondary.text}
          </Link>
        </div>

        {/* Slide counter + indicator dots */}
        <div
          className="flex items-center gap-5 mt-12"
          style={{
            opacity: contentIn ? 1 : 0,
            transition: `opacity 0.55s ease 0.40s`,
          }}
        >
          {/* Numeric counter */}
          <span
            className="font-body text-[10.5px] tracking-[0.10em] tabular-nums"
            style={{ color: s.muted }}
          >
            {String(current + 1).padStart(2, "0")}
            <span style={{ margin: "0 4px", opacity: 0.4 }}>/</span>
            {String(SLIDES.length).padStart(2, "0")}
          </span>

          {/* Dot / bar indicators */}
          <div className="flex items-center gap-[6px]" role="tablist" aria-label="Slides">
            {SLIDES.map((sl, i) => (
              <button
                key={sl.id}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
                onClick={() => { stopTimer(); goTo(i); startTimer(); }}
                className="rounded-full transition-all duration-500"
                style={{
                  height: "2px",
                  width: i === current ? "36px" : "10px",
                  background: i === current ? s.dot : s.muted,
                  opacity: i === current ? 1 : 0.35,
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — Prev / Next arrow controls ── */}
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 flex flex-col gap-3"
        style={{ zIndex: 10 }}
      >
        <button
          onClick={() => { stopTimer(); prev(); startTimer(); }}
          aria-label="Previous slide"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: `1px solid ${s.arrowBorder}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: s.arrowColor,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => { stopTimer(); next(); startTimer(); }}
          aria-label="Next slide"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: `1px solid ${s.arrowBorder}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: s.arrowColor,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* ── BOTTOM — Slide progress bar ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: s.progressBg, zIndex: 10 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: s.dot,
            width: `${((current + 1) / SLIDES.length) * 100}%`,
            transition: `width ${FADE_MS + 80}ms ease`,
          }}
        />
      </div>

      {/* ── Ornamental bottom-left brand mark ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 right-10 flex items-center gap-2 pointer-events-none"
        style={{
          zIndex: 10,
          opacity: contentIn ? 0.4 : 0,
          transition: `opacity 0.55s ease 0.42s`,
        }}
      >
        <div className="h-px w-5" style={{ background: s.muted }} />
        <span
          className="font-body text-[9px] tracking-[0.18em] uppercase"
          style={{ color: s.muted }}
        >
          Saaral Cosmetics
        </span>
      </div>
    </section>
  );
}
