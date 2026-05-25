"use client";

import { useState, useEffect, useCallback } from "react";

const promos = [
  {
    label: "This Season",
    headline: "Your Summer Skincare Obsession",
  },
  {
    label: "New Collection",
    headline: "Glow Naturally — Herbal Radiance",
  },
  {
    label: "Limited Offer",
    headline: "Flat 15% OFF on All Face Creams",
  },
];

export default function MobilePromoStrip() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 220);
  }, []);

  const prev = () => go((current - 1 + promos.length) % promos.length);
  const next = () => go((current + 1) % promos.length);

  useEffect(() => {
    const id = setInterval(() => {
      go((c) => (c + 1) % promos.length);
    }, 4000);
    return () => clearInterval(id);
  }, [go]);

  const p = promos[current];

  return (
    <div
      className="block md:hidden w-full"
      style={{
        background: "linear-gradient(90deg, #5C2E1A 0%, #7A3D20 40%, #6B3318 100%)",
        minHeight: "64px",
      }}
      aria-live="polite"
      aria-label="Promotional announcements"
    >
      <div className="flex items-center justify-between h-full px-3 py-3 gap-2">
        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous promotion"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="7.5,2 3.5,6 7.5,10" stroke="#F0EAD6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Text */}
        <div
          className="flex-1 text-center flex flex-col gap-0.5"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(-4px)" : "translateY(0)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#C9A74D",
            }}
          >
            {p.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#F5EDE0",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {p.headline}
          </span>
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next promotion"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="4.5,2 8.5,6 4.5,10" stroke="#F0EAD6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-2">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Promotion ${i + 1}`}
            style={{
              width: current === i ? "16px" : "5px",
              height: "4px",
              borderRadius: "2px",
              background: current === i ? "#C9A74D" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
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
