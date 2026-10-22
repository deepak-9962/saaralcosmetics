"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/lib/types";

const FALLBACK_BG = ["#EEE5F8", "#140308", "#F2E4CC", "#FAF0EE"];
const AUTOPLAY_MS = 5000;
const FADE_MS = 700;

interface DesktopBannerSliderProps {
  slides?: HeroSlide[];
}

export default function DesktopBannerSlider({ slides = [] }: DesktopBannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

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
    () => goTo((current + 1) % slides.length),
    [current, goTo, slides.length]
  );
  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, goTo, slides.length]
  );

  /* ── Autoplay ── */
  const startTimer = useCallback(() => {
    if (slides.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_MS);
  }, [next, slides.length]);

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
    if (slides.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { stopTimer(); prev(); startTimer(); }
      if (e.key === "ArrowRight") { stopTimer(); next(); startTimer(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, startTimer, stopTimer, slides.length]);

  /* ── Touch swipe ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || slides.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 48) {
      didSwipe.current = true;
      stopTimer();
      delta < 0 ? next() : prev();
      startTimer();
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const s = slides[current % slides.length];
  const bg = FALLBACK_BG[current % FALLBACK_BG.length];

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
          background: bg,
          transition: `background ${FADE_MS}ms ease`,
          overflow: "hidden",
        }}
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Image layers — opacity cross-fade, each is a full Link ── */}
        {slides.map((sl, i) => (
          <Link
            key={sl.id}
            href={sl.button_link || "/products"}
            aria-label={sl.title}
            tabIndex={i === current ? 0 : -1}
            onClick={(e) => {
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
              src={sl.image_url}
              alt={sl.title}
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
          {`Slide ${current + 1} of ${slides.length}: ${s?.title}`}
        </div>

        {/* ── Dot indicators — bottom center (only if > 1 slide) ── */}
        {slides.length > 1 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-[8px] z-10"
            role="tablist"
            aria-label="Banner slides"
          >
            {slides.map((sl, i) => (
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
        )}

        {/* ── Left/Right navigation arrows — bottom right (only if > 1 slide) ── */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2.5 z-10">
            {/* Prev arrow */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopTimer();
                prev();
                startTimer();
              }}
              aria-label="Previous slide"
              className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:scale-105"
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,167,77,0.35)",
                boxShadow: "0 2px 10px rgba(42,26,20,0.10)",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B3A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Next arrow */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopTimer();
                next();
                startTimer();
              }}
              aria-label="Next slide"
              className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:scale-105"
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,167,77,0.35)",
                boxShadow: "0 2px 10px rgba(42,26,20,0.10)",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B3A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Bottom progress bar ── */}
        {slides.length > 1 && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-[3px] z-10"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <div
              className="h-full"
              style={{
                background: "rgba(255,255,255,0.80)",
                width: `${((current + 1) / slides.length) * 100}%`,
                transition: `width ${FADE_MS + 80}ms ease`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
