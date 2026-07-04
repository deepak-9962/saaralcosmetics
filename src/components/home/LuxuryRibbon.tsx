import { memo } from "react";

/* ─────────────────────────────────────────────
   SIGNAL DATA
───────────────────────────────────────────── */
const signals = [
  { text: "HANDCRAFTED IN INDIA" },
  { text: "NO HARMFUL CHEMICALS" },
  { text: "ANCIENT AYURVEDIC WISDOM" },
  { text: "100% NATURAL INGREDIENTS" },
  { text: "CRUELTY FREE" },
  { text: "ETHICALLY SOURCED" },
  { text: "LUXURY BOTANICAL FORMULATIONS" },
];

/* ─────────────────────────────────────────────
   SEPARATOR ICON — alternates between three glyphs
───────────────────────────────────────────── */
function Separator({ index }: { index: number }) {
  const glyph = index % 3 === 0 ? "✦" : index % 3 === 1 ? "◆" : "✧";
  const color =
    index % 3 === 0 ? "rgba(201,167,77,0.9)" : "rgba(176,96,128,0.75)";
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        margin: "0 36px",
        fontSize: "8px",
        color,
        filter: `drop-shadow(0 0 3px ${color})`,
        animation: `golden-shimmer ${4 + (index % 3)}s ease-in-out infinite`,
        animationDelay: `${(index * 0.4) % 3}s`,
      }}
    >
      {glyph}
    </span>
  );
}

/* ─────────────────────────────────────────────
   PARTICLES — fully isolated, pure CSS, no state
───────────────────────────────────────────── */
const LuxuryParticles = memo(function LuxuryParticles() {
  const particles = [
    { left: "6%",  top: "28%", sz: 2.5, dur: "7s",   del: "0s",    tint: 0 },
    { left: "14%", top: "62%", sz: 3,   dur: "9.5s",  del: "1.3s",  tint: 1 },
    { left: "22%", top: "38%", sz: 2,   dur: "6.5s",  del: "2.6s",  tint: 2 },
    { left: "31%", top: "72%", sz: 3.5, dur: "8s",    del: "0.8s",  tint: 0 },
    { left: "40%", top: "22%", sz: 2,   dur: "11s",   del: "3.2s",  tint: 1 },
    { left: "50%", top: "58%", sz: 4,   dur: "7.5s",  del: "1.9s",  tint: 2 },
    { left: "59%", top: "32%", sz: 2.5, dur: "9s",    del: "0.5s",  tint: 0 },
    { left: "67%", top: "68%", sz: 3,   dur: "6s",    del: "2.4s",  tint: 1 },
    { left: "76%", top: "42%", sz: 2,   dur: "8.5s",  del: "1.1s",  tint: 2 },
    { left: "83%", top: "65%", sz: 3.5, dur: "7s",    del: "3.5s",  tint: 0 },
    { left: "90%", top: "25%", sz: 2.5, dur: "10s",   del: "0.3s",  tint: 1 },
    { left: "96%", top: "55%", sz: 2,   dur: "6.5s",  del: "2.1s",  tint: 2 },
  ] as const;

  const tints = [
    "radial-gradient(circle, rgba(201,167,77,0.95) 0%, transparent 70%)",
    "radial-gradient(circle, rgba(176,96,128,0.85) 0%, transparent 70%)",
    "radial-gradient(circle, rgba(255,235,220,0.95) 0%, transparent 70%)",
  ];

  const anims = ["bubble-float-1", "bubble-float-2", "bubble-float-3"];

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: `${p.sz}px`,
            height: `${p.sz}px`,
            borderRadius: "50%",
            background: tints[p.tint],
            opacity: 0.45 + (i % 4) * 0.08,
            filter: "blur(0.6px)",
            animation: `${anims[p.tint]} ${p.dur} ease-in-out ${p.del} infinite`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
});

/* ─────────────────────────────────────────────
   SHIMMER SWEEP — isolated CSS animation
───────────────────────────────────────────── */
const ShimmerSweep = memo(function ShimmerSweep() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: 0,
          width: "35%",
          height: "120%",
          background:
            "linear-gradient(105deg, transparent 20%, rgba(255,245,230,0.28) 45%, rgba(255,252,245,0.18) 55%, transparent 80%)",
          animation: "shimmer-ribbon 9s cubic-bezier(0.45, 0, 0.55, 1) infinite",
          opacity: "var(--shimmer-1)",
          transition: "opacity 0.7s ease",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
      {/* secondary delayed sweep */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: 0,
          width: "20%",
          height: "120%",
          background:
            "linear-gradient(108deg, transparent 20%, rgba(201,167,77,0.10) 50%, transparent 80%)",
          animation: "shimmer-ribbon 9s cubic-bezier(0.45, 0, 0.55, 1) 4.5s infinite",
          opacity: "var(--shimmer-2)",
          transition: "opacity 0.7s ease",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
    </div>
  );
});

/* ─────────────────────────────────────────────
   MAIN EXPORT — 100% Server Component with pure CSS hover
───────────────────────────────────────────── */
export default function LuxuryRibbon() {
  /* Duplicate for seamless loop: animates 0 → -50% */
  const marqueeItems = [...signals, ...signals];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .luxury-ribbon-sec {
          --bg-glow-1: 0.5;
          --bg-glow-2: 0.45;
          --shimmer-1: 0.65;
          --shimmer-2: 0.55;
          --border-1: 0.7;
          --border-2: 0.6;
          --text-glow: 0 0 6px rgba(176,96,128,0.08);
        }
        .luxury-ribbon-sec:hover {
          --bg-glow-1: 0.9;
          --bg-glow-2: 0.9;
          --shimmer-1: 0.95;
          --shimmer-2: 0.9;
          --border-1: 1;
          --border-2: 1;
          --text-glow: 0 0 14px rgba(176,96,128,0.22);
        }
      `}} />

      {/* ══════════════════════════════════════
          MOBILE — clean premium marquee, no FX
          ══════════════════════════════════════ */}
      <section
        className="md:hidden w-full overflow-hidden py-3.5"
        style={{
          borderTop: "1px solid rgba(176,96,128,0.2)",
          borderBottom: "1px solid rgba(176,96,128,0.2)",
          background: "rgba(255,245,240,0.85)",
        }}
      >
        <div className="flex animate-marquee whitespace-nowrap gap-14">
          {marqueeItems.map((s, i) => (
            <span
              key={i}
              className="label-caps text-[#B06080] flex items-center gap-3"
            >
              <span className="text-[#C9A74D] text-xs">✦</span> {s.text}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          DESKTOP — clean solid ribbon
          ══════════════════════════════════════ */}
      <section
        className="hidden md:block relative w-full overflow-hidden select-none"
        style={{
          height: "52px",
          background: "#E4F4D1",
          borderTop: "1px solid rgba(80,140,50,0.18)",
          borderBottom: "1px solid rgba(80,140,50,0.18)",
        }}
        aria-label="Saaral Cosmetics brand values"
      >
        {/* Scrolling text with soft fade edges */}
        <div
          className="absolute inset-0 flex items-center overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          }}
        >
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: "luxury-marquee 52s linear infinite",
              willChange: "transform",
            }}
          >
            {marqueeItems.map((signal, i) => (
              <span key={i} className="inline-flex items-center">
                <Separator index={i} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    fontWeight: 650,
                    letterSpacing: "0.26em",
                    color: "#1A3A0A",
                  }}
                >
                  {signal.text}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
