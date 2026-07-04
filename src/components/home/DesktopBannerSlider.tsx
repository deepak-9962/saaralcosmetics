"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Slide data — image only, whole slide is a link
───────────────────────────────────────────── */
const SLIDES = [
  {
    id: "butterfly-pea",
    img: "/images/banner-head1.avif",
    imgAlt: "Saaral Butterfly Pea Collection — luxury botanical skincare",
    href: "/products?collection=butterfly-pea",
    dot: "#6B4FA1",
    dotBg: "rgba(107,79,161,0.18)",
    bg: "#EEE5F8",
  },
  {
    id: "red-wine",
    img: "/images/NewHeader/head2.avif",
    imgAlt: "Saaral Red Wine Collection — anti-aging luxury skincare",
    href: "/products?collection=red-wine",
    dot: "#C7A36A",
    dotBg: "rgba(199,163,106,0.18)",
    bg: "#140308",
  },
] as const;

const AUTOPLAY_MS = 5000;
const FADE_MS = 700;

export default function DesktopBannerSlider() {
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  // Track whether this is a click or a drag/swipe so we don't navigate on swipe
  const didSwipe = useRef(false);

  const s = SLIDES[current];

  /* ── Navigate to a specific slide ── */
  const goTo = useCallback(
    (idx: number) => {
      if (busy || idx === current) return;
      setBusy(true);
      setTimeout(() => {
        setCurrent(idx);
        setBusy(false);
      }, FADE_MS / 2 + 40);
    },
    [busy, current]
  );

  const next = useCallback(
    () => goTo((current + 1) % SLIDES.length),
    [current, goTo]
  );
  const prev = useCallback(
    () => goTo((current - 1 + SLIDES.length) % SLIDES.length),
    [current, goTo]
  );

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
    const handler = () => (document.hidden ? stopTimer() : startTimer());
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [startTimer, stopTimer]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { stopTimer(); prev(); startTimer(); }
      if (e.key === "ArrowRight") { stopTimer(); next(); startTimer(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, startTimer, stopTimer]);

  /* ── Touch swipe ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 48) {
      didSwipe.current = true;
      stopTimer();
      delta < 0 ? next() : prev();
      startTimer();
    }
  };

  return (
    <section
      aria-label="Featured Collections Banner"
      className="hidden md:block w-full"
      style={{ background: "#FDFAF8", padding: "0 40px 32px" }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Saaral featured collection slides"
        className="relative"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          aspectRatio: "2103 / 748",
          borderRadius: "20px",
          boxShadow: "0 4px 32px rgba(42,26,20,0.09)",
          cursor: "pointer",
          background: s.bg,
          transition: `background ${FADE_MS}ms ease`,
          overflow: "hidden",
        }}
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Image layers — opacity cross-fade, each is a full Link ── */}
        {SLIDES.map((sl, i) => (
          <Link
            key={sl.id}
            href={sl.href}
            aria-label={sl.imgAlt}
            tabIndex={i === current ? 0 : -1}
            onClick={(e) => {
              // Prevent navigation if this was a swipe gesture
              if (didSwipe.current) { e.preventDefault(); didSwipe.current = false; }
            }}
            className="absolute inset-0 block"
            style={{
              opacity: i === current ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease`,
              zIndex: i === current ? 1 : 0,
              pointerEvents: i === current ? "auto" : "none",
            }}
          >
            <Image
              src={sl.img}
              alt={sl.imgAlt}
              fill
              className="object-cover object-center select-none"
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              sizes="(min-width: 1400px) 1400px, 90vw"
              draggable={false}
            />
          </Link>
        ))}

        {/* ── ARIA live region ── */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {`Slide ${current + 1} of ${SLIDES.length}: ${s.imgAlt}`}
        </div>

        {/* ── Dot indicators — bottom center ── */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-[8px] z-10"
          role="tablist"
          aria-label="Banner slides"
        >
          {SLIDES.map((sl, i) => (
            <button
              key={sl.id}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                stopTimer();
                goTo(i);
                startTimer();
              }}
              className="rounded-full transition-all duration-500"
              style={{
                height: "3px",
                width: i === current ? "36px" : "10px",
                background: i === current ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.20)",
              }}
            />
          ))}
        </div>

        {/* ── Bottom progress bar ── */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[3px] z-10"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <div
            className="h-full"
            style={{
              background: "rgba(255,255,255,0.80)",
              width: `${((current + 1) / SLIDES.length) * 100}%`,
              transition: `width ${FADE_MS + 80}ms ease`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
