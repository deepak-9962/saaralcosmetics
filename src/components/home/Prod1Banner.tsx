import LinkNext from "next/link";
import GoldParticles from "./GoldParticles";
import FadeIn from "@/components/layout/FadeIn";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.78, delay, ease },
});

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 2C8 6 4 8 4 13a8 8 0 0 0 16 0c0-5-4-7-8-11z" />
        <path d="M12 12c0 2 1.5 3.5 3 4" />
      </svg>
    ),
    label: "100% NATURAL",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    label: "ANCIENT AYURVEDIC WISDOM",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    label: "CRUELTY FREE",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M7 11.5V14l-2 2h14l-2-2v-2.5" />
        <path d="M12 2v9" />
        <path d="M8 6l4-4 4 4" />
        <path d="M5 20h14" />
      </svg>
    ),
    label: "HANDCRAFTED IN INDIA",
  },
];

export default function Prod1Banner() {
  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Saaral – Skincare Rooted In Ritual"
      style={{ minHeight: "clamp(520px, 72vh, 780px)" }}
    >
      {/* ── Solid/Gradient background matching the image tone ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, #FDF6F0 0%, #FBF0E6 38%, #EDD5C2 78%)",
        }}
        aria-hidden="true"
      />

      {/* ── Soft blurred botanical dappled shadow overlay ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-12 mix-blend-multiply" aria-hidden="true">
        <defs>
          <filter id="shadow-blur">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <g filter="url(#shadow-blur)" fill="#2A1A14">
          <path d="M 820,80 C 880,30 920,130 840,180 C 800,205 760,105 820,80 Z" />
          <path d="M 970,200 C 1020,160 1040,280 980,300 C 920,320 940,220 970,200 Z" />
          <path d="M 720,320 C 740,250 840,290 800,350 C 760,390 700,360 720,320 Z" />
          <path d="M 870,420 C 920,380 950,490 890,510 C 840,530 850,450 870,420 Z" />
        </g>
      </svg>

      {/* ── Responsive product image with mask applied directly to the image ── */}
      <picture
        className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none z-10 block"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 45%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 45%)",
        }}
        aria-hidden="true"
      >
        <source srcSet="/images/prod1.avif" type="image/avif" />
        <source srcSet="/images/prod1.webp" type="image/webp" />
        <img
          src="/images/prod1.png"
          alt="Saaral Skincare Ritual Products"
          className="h-full w-auto object-contain"
        />
      </picture>

      {/* ── Left-side text legibility gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(253,246,240,0.96) 0%, rgba(253,246,240,0.88) 28%, rgba(253,246,240,0.48) 52%, rgba(253,246,240,0.1) 72%, transparent 88%)",
        }}
        aria-hidden="true"
      />

      {/* ── Typography ambient gold/rose glow pool ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "12%",
          top: "28%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(201,167,77,0.08) 0%, rgba(196,119,142,0.04) 55%, transparent 100%)",
          filter: "blur(48px)",
          zIndex: 2,
        }}
        aria-hidden="true"
      />

      {/* ── Floating luxury gold particles ── */}
      <GoldParticles />

      {/* ── CONTENT — left column ── */}
      <div
        className="relative z-20 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24 py-16"
        style={{ minHeight: "clamp(520px, 72vh, 780px)", maxWidth: "620px" }}
      >
        {/* ── Eyebrow label with line divider ── */}
        <FadeIn
          className="flex items-center gap-4 mb-8"
          {...fadeUp(0.05)}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "8.5px",
              letterSpacing: "0.36em",
              fontWeight: 600,
              color: "#C9A74D",
              textTransform: "uppercase",
            }}
          >
            A Philosophy of Beauty
          </span>
          <div
            className="h-[1px] w-12"
            style={{ background: "linear-gradient(to right, rgba(201,167,77,0.7), rgba(201,167,77,0))" }}
          />
        </FadeIn>

        {/* ── Main Heading with Editorial Imbalance ── */}
        <div className="overflow-visible mb-6 flex flex-col gap-1.5">
          <FadeIn {...fadeUp(0.12)}>
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(46px, 5.8vw, 76px)",
                lineHeight: 1.02,
                letterSpacing: "-0.015em",
                fontWeight: 300,
                color: "#2A1A14",
              }}
            >
              Glow Begins
            </span>
          </FadeIn>

          <FadeIn {...fadeUp(0.24)} className="pl-6 md:pl-12 overflow-visible">
            <span
              style={{
                display: "inline-block",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(52px, 6.6vw, 86px)",
                lineHeight: 1.05,
                fontStyle: "italic",
                fontWeight: 400,
                background: "linear-gradient(135deg, #D48C9E 0%, #A85570 50%, #C87E92 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 14px rgba(168,85,112,0.18))",
              }}
            >
              With Ritual.
            </span>
          </FadeIn>
        </div>

        {/* ── Sub-text ── */}
        <FadeIn {...fadeUp(0.38)}>
          <p
            className="mb-10"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              lineHeight: 1.8,
              color: "rgba(90,58,44,0.65)",
              maxWidth: "340px",
              letterSpacing: "0.03em",
            }}
          >
            Ancient botanical formulations crafted for naturally radiant modern skin.
          </p>
        </FadeIn>

        {/* ── CTA Button ── */}
        <FadeIn {...fadeUp(0.48)}>
          <LinkNext
            href="/products"
            className="group inline-flex items-center gap-3 transition-all duration-500 luxury-cta-hover"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9.5px",
              letterSpacing: "0.24em",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "rgba(160,128,60,0.95)",
              border: "1px solid rgba(201,167,77,0.32)",
              borderRadius: "100px",
              padding: "13px 38px",
              background: "rgba(253,246,240,0.15)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 18px rgba(201,167,77,0.04)",
            }}
          >
            Explore Formulations
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300 ease-out"
              style={{ color: "#C9A74D" }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </LinkNext>
        </FadeIn>

        {/* ── Feature List — bottom horizontal layout ── */}
        <FadeIn
          className="mt-14 flex flex-wrap gap-x-8 gap-y-4"
          style={{ maxWidth: "520px" }}
          {...fadeUp(0.58)}
        >
          {features.map(({ icon, label }, index) => (
            <div key={label} className="flex items-center gap-3">
              {index > 0 && (
                <div
                  className="h-3.5 w-[1px] bg-gold/30 hidden sm:block"
                  style={{ backgroundColor: "rgba(201, 167, 77, 0.22)" }}
                />
              )}
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 text-[#C9A74D]" style={{ strokeWidth: 1.0 }}>
                  {icon}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "8.2px",
                    letterSpacing: "0.2em",
                    fontWeight: 600,
                    color: "rgba(90, 58, 44, 0.65)",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
