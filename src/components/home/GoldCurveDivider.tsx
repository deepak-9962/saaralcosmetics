"use client";

import { memo } from "react";

/* ─────────────────────────────────────────────
   Isolated shimmer — pure CSS, no state re-renders
───────────────────────────────────────────── */
const GoldShimmer = memo(function GoldShimmer() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "42%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,248,218,0.20) 48%, rgba(255,252,230,0.12) 55%, transparent 100%)",
          animation: "shimmer-ribbon 13s ease-in-out 2s infinite",
          pointerEvents: "none",
        }}
      />
      {/* Secondary delayed sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "30%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(201,167,77,0.09) 50%, transparent 100%)",
          animation: "shimmer-ribbon 13s ease-in-out 8.5s infinite",
          pointerEvents: "none",
        }}
      />
    </div>
  );
});

/* ─────────────────────────────────────────────
   MAIN — desktop only  (hidden md:block handled
   via className so mobile is untouched)
───────────────────────────────────────────── */
export default function GoldCurveDivider() {
  /*
   * Organic asymmetric path:
   * Flows from y=70 (left) → dips to y=88 around x=650 → rises
   * to y=42 at x=1050 → settles at y=58 (right).
   * No symmetry, no repetition — feels like a single brushstroke.
   */
  const curve =
    "M0,70 C220,58 460,95 700,78 C940,60 1140,38 1440,55";

  /* Highlight sits 0.8px above the main stroke */
  const curveHi =
    "M0,69.2 C220,57.2 460,94.2 700,77.2 C940,59.2 1140,37.2 1440,54.2";

  return (
    <div
      className="relative w-full hidden md:block overflow-hidden select-none"
      style={{
        height: "108px",
        /*
         * Top: ending warm tone of CuratedRituals (#F2E0D5)
         * Bottom: Featured Products background (#FAF0EE)
         */
        background:
          "linear-gradient(to bottom, #F2E0D5 0%, #F6E8E0 28%, #FAF3EE 65%, #FAF0EE 100%)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 108"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Champagne-gold gradient along the curve */}
          <linearGradient id="gc-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(201,167,77,0)"   />
            <stop offset="7%"   stopColor="rgba(195,160,68,0.55)" />
            <stop offset="22%"  stopColor="rgba(215,183,90,0.95)" />
            <stop offset="42%"  stopColor="rgba(222,190,98,1)"    />
            <stop offset="60%"  stopColor="rgba(210,176,82,0.97)" />
            <stop offset="80%"  stopColor="rgba(198,163,72,0.72)" />
            <stop offset="93%"  stopColor="rgba(190,155,65,0.45)" />
            <stop offset="100%" stopColor="rgba(201,167,77,0)"    />
          </linearGradient>

          {/* Wide diffuse halo filter */}
          <filter id="gc-halo" x="-8%" y="-400%" width="116%" height="900%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Tight glow filter */}
          <filter id="gc-glow" x="-4%" y="-300%" width="108%" height="700%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Layer A: wide diffuse champagne halo ── */}
        <path
          d={curve}
          fill="none"
          stroke="rgba(210,178,80,0.14)"
          strokeWidth="26"
          strokeLinecap="round"
          filter="url(#gc-halo)"
        />

        {/* ── Layer B: medium glow bloom ── */}
        <path
          d={curve}
          fill="none"
          stroke="rgba(218,185,88,0.22)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#gc-glow)"
        />

        {/* ── Layer C: main metallic stroke ── */}
        <path
          d={curve}
          fill="none"
          stroke="url(#gc-gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* ── Layer D: inner crystalline highlight ── */}
        <path
          d={curveHi}
          fill="none"
          stroke="rgba(255,253,240,0.48)"
          strokeWidth="0.55"
          strokeLinecap="round"
        />
      </svg>

      {/* Ambient center radial glow — sitting behind the curve */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "28%",
          width: "44%",
          height: "70%",
          background:
            "radial-gradient(ellipse, rgba(201,167,77,0.07) 0%, transparent 70%)",
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />

      {/* Left-side ambient rose glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "20%",
          height: "80%",
          background:
            "radial-gradient(ellipse, rgba(176,96,128,0.06) 0%, transparent 70%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      {/* Shimmer sweep layer */}
      <GoldShimmer />
    </div>
  );
}
