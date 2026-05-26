"use client";

import { useState, useEffect, useCallback } from "react";

const promos = [
  {
    label: "Limited Offer",
    headline: "Flat 15% OFF on Face Creams",
  },
  {
    label: "New Collection",
    headline: "Summer Glow Essentials",
  },
  {
    label: "Heritage Skincare",
    headline: "Glow Naturally — Herbal Radiance",
  },
  {
    label: "Luxury Rituals",
    headline: "Luxury Skincare Rituals",
  },
];

export default function MobilePromoStrip() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number | ((prev: number) => number)) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 280);
  }, []);

  const prev = () => go((current - 1 + promos.length) % promos.length);
  const next = () => go((current + 1) % promos.length);

  useEffect(() => {
    const id = setInterval(() => {
      go((c) => (c + 1) % promos.length);
    }, 4500);
    return () => clearInterval(id);
  }, [go]);

  const p = promos[current];

  return (
    <div
      className="block md:hidden w-full"
      style={{
        background:
          "linear-gradient(135deg, #C78DA0 0%, #D2A0B0 50%, #D8A8B7 100%)",
        minHeight: "70px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06)",
      }}
      aria-live="polite"
      aria-label="Promotional announcements"
    >
      {/* Soft ambient top glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "50%",
          background:
            "radial-gradient(ellipse at center top, rgba(255,255,255,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative flex items-center justify-between h-full px-4 py-3 gap-3">
        {/* Glassmorphic Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous promotion"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all duration-300"
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path
              d="M5 1L1 5L5 9"
              stroke="#FFFBF8"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Centered Editorial Text */}
        <div
          className="flex-1 text-center flex flex-col gap-1"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? "scale(0.97) translateY(-3px)"
              : "scale(1) translateY(0)",
            transition:
              "opacity 0.32s cubic-bezier(0.25, 1, 0.5, 1), transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "8.5px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255, 245, 240, 0.75)",
            }}
          >
            {p.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "14.5px",
              fontWeight: 500,
              fontStyle: "italic",
              color: "#FFF8F5",
              lineHeight: 1.35,
              letterSpacing: "0.01em",
            }}
          >
            {p.headline}
          </span>
        </div>

        {/* Glassmorphic Next arrow */}
        <button
          onClick={next}
          aria-label="Next promotion"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all duration-300"
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path
              d="M1 1L5 5L1 9"
              stroke="#FFFBF8"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Luxury Capsule Indicators */}
      <div className="flex justify-center gap-2 pb-2.5 -mt-0.5">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Promotion ${i + 1}`}
            style={{
              width: current === i ? "18px" : "5px",
              height: "3px",
              borderRadius: "1.5px",
              background:
                current === i
                  ? "rgba(255, 250, 245, 0.9)"
                  : "rgba(255, 255, 255, 0.3)",
              boxShadow:
                current === i
                  ? "0 0 6px rgba(255, 250, 245, 0.5)"
                  : "none",
              transition: "all 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
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
