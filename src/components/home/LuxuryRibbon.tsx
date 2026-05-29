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
          DESKTOP — full cinematic luxury ribbon
          ══════════════════════════════════════ */}
      <section
        className="hidden md:block relative w-full overflow-hidden select-none luxury-ribbon-sec"
        style={{ height: "58px" }}
        aria-label="Saaral Cosmetics brand values"
      >
        {/* ── Layer 1: Cinematic background gradient ── */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 55% 200% at 15% 50%, rgba(242,213,224,0.50) 0%, transparent 65%),
              radial-gradient(ellipse 45% 200% at 85% 50%, rgba(201,167,77,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 65% 250% at 50% 50%, rgba(176,96,128,0.07) 0%, transparent 70%),
              linear-gradient(90deg,
                #F8EEF0 0%,
                #FCF0EC 18%,
                #FEF4EF 35%,
                #FDF2EC 52%,
                #FCF0EC 68%,
                #FAEEEf 85%,
                #F8EEF0 100%
              )
            `,
          }}
        />

        {/* ── Layer 2: Ambient glow blobs ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "12%",
            top: "-40px",
            width: "240px",
            height: "130px",
            background:
              "radial-gradient(ellipse, rgba(176,96,128,0.22) 0%, transparent 70%)",
            filter: "blur(24px)",
            opacity: "var(--bg-glow-1)",
            transition: "opacity 1s ease",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "18%",
            top: "-30px",
            width: "180px",
            height: "110px",
            background:
              "radial-gradient(ellipse, rgba(201,167,77,0.2) 0%, transparent 70%)",
            filter: "blur(20px)",
            opacity: "var(--bg-glow-2)",
            transition: "opacity 1s ease",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "46%",
            top: "-20px",
            width: "260px",
            height: "100px",
            background:
              "radial-gradient(ellipse, rgba(255,215,195,0.22) 0%, transparent 70%)",
            filter: "blur(26px)",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />

        {/* ── Layer 3: Glassmorphism overlay ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,250,247,0.30)",
            backdropFilter: "blur(1.5px)",
            WebkitBackdropFilter: "blur(1.5px)",
            borderTop: "1px solid rgba(255,255,255,0.58)",
            borderBottom: "1px solid rgba(255,255,255,0.42)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.32)",
          }}
        />

        {/* ── Layer 4: Shimmer sweep ── */}
        <ShimmerSweep />

        {/* ── Layer 5: Particles ── */}
        <LuxuryParticles />

        {/* ── Layer 6: Scrolling text (mask-image creates soft fade edges) ── */}
        <div
          className="absolute inset-0 flex items-center overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)",
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
                    fontWeight: 500,
                    letterSpacing: "0.26em",
                    color:
                      i % 4 < 2
                        ? "rgba(140,64,96,0.88)"
                        : "rgba(130,90,55,0.82)",
                    textShadow: "var(--text-glow)",
                    transition: "text-shadow 0.7s ease",
                  }}
                >
                  {signal.text}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Layer 8: Top glow border ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,167,77,0.45) 20%, rgba(176,96,128,0.55) 50%, rgba(201,167,77,0.45) 80%, transparent 100%)",
            boxShadow: "0 0 8px rgba(201,167,77,0.25)",
            opacity: "var(--border-1)",
            transition: "opacity 0.6s ease",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        {/* ── Layer 8: Bottom glow border ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(176,96,128,0.38) 30%, rgba(201,167,77,0.48) 50%, rgba(176,96,128,0.38) 70%, transparent 100%)",
            boxShadow: "0 0 6px rgba(176,96,128,0.2)",
            opacity: "var(--border-2)",
            transition: "opacity 0.6s ease",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      </section>
    </>
  );
}
