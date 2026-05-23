"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const rituals = [
  {
    id: "face-cream",
    name: "Face Cream",
    ritual: "Morning Radiance",
    story: "A slow-pour of botanical actives that restore luminosity while you sleep and protect through the day.",
    image: "/images/cat-face-cream.webp",
    href: "/products?category=face-cream",
    accent: "#B06080",
    accentLight: "rgba(176,96,128,0.15)",
    tag: "Bestseller",
    icon: "spa",
  },
  {
    id: "face-wash",
    name: "Face Wash",
    ritual: "Cleansing Ceremony",
    story: "Ancient botanicals meet fresh-water clarity — a ritual that resets the skin's natural balance.",
    image: "/images/cat-face-wash.webp",
    href: "/products?category=face-wash",
    accent: "#7E6B9A",
    accentLight: "rgba(126,107,154,0.15)",
    tag: "Daily Essential",
    icon: "water_drop",
  },
  {
    id: "soap",
    name: "Botanical Soap",
    ritual: "Purifying Ritual",
    story: "Cold-pressed, handcrafted bars that lather with intention and leave skin irresistibly soft.",
    image: "/images/cat-soap.webp",
    href: "/products?category=soap",
    accent: "#4A7C59",
    accentLight: "rgba(74,124,89,0.15)",
    tag: "Handcrafted",
    icon: "local_florist",
  },
  {
    id: "nalangu-maavu",
    name: "Nalangu Maavu",
    ritual: "Heritage Ceremony",
    story: "A 2,000-year-old Tamil Nadu bridal tradition — turmeric, sandalwood, and pulse flour in harmony.",
    image: "/images/cat-nalangu-maavu.webp",
    href: "/products?category=nalangu-maavu",
    accent: "#C9A74D",
    accentLight: "rgba(201,167,77,0.18)",
    tag: "Heritage Formula",
    icon: "auto_awesome",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────
   TILT CARD — isolated client leaf
───────────────────────────────────────────── */
function RitualCard({
  ritual,
  index,
}: {
  ritual: (typeof rituals)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 28,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 28,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.72, delay: index * 0.09, ease }}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative group rounded-[24px] overflow-hidden cursor-pointer"
      >
        <Link href={ritual.href} className="block">
          {/* ── Image ── */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ritual.image}
              alt={ritual.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
              style={{
                transform: hovered ? "scale(1.08)" : "scale(1.02)",
              }}
            />

            {/* Cinematic gradient overlays */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: `linear-gradient(to top, ${ritual.accent}CC 0%, ${ritual.accent}44 38%, transparent 65%)`,
                opacity: hovered ? 1 : 0.75,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(26,10,5,0.35) 0%, transparent 30%)",
              }}
            />

            {/* Ambient glow orb on hover */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-700"
              style={{
                background: `radial-gradient(ellipse at 50% 80%, ${ritual.accent}55 0%, transparent 65%)`,
                opacity: hovered ? 1 : 0,
              }}
            />

            {/* Tag pill */}
            <div className="absolute top-4 left-4 z-10">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-[10px] tracking-[0.12em] uppercase font-semibold backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <span className="material-symbols-outlined text-[11px]">
                  {ritual.icon}
                </span>
                {ritual.tag}
              </span>
            </div>

            {/* Arrow CTA — appears on hover */}
            <motion.div
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
              }}
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
              transition={{ duration: 0.3, ease }}
            >
              <span className="material-symbols-outlined text-white text-[15px]">
                arrow_outward
              </span>
            </motion.div>

            {/* Text block at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              {/* Ritual subtitle */}
              <p
                className="font-body text-[10px] tracking-[0.18em] uppercase mb-1.5 transition-all duration-500"
                style={{
                  color: "rgba(255,255,255,0.65)",
                  transform: hovered ? "translateY(0)" : "translateY(2px)",
                }}
              >
                {ritual.ritual}
              </p>

              {/* Category name */}
              <h3
                className="font-display text-white leading-tight mb-2"
                style={{ fontSize: "clamp(20px, 2.5vw, 28px)", letterSpacing: "-0.01em" }}
              >
                {ritual.name}
              </h3>

              {/* Story line — appears on hover */}
              <motion.p
                className="font-body text-white/70 text-[12px] leading-relaxed"
                style={{ maxWidth: "220px" }}
                animate={{
                  opacity: hovered ? 1 : 0,
                  height: hovered ? "auto" : 0,
                  y: hovered ? 0 : 8,
                }}
                transition={{ duration: 0.38, ease }}
              >
                {ritual.story}
              </motion.p>

              {/* Gold accent line */}
              <motion.div
                className="h-px mt-3"
                style={{ background: ritual.accent }}
                animate={{ width: hovered ? "60px" : "32px" }}
                transition={{ duration: 0.45, ease }}
              />
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────── */
export default function CuratedRituals() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FDF6F0 0%, #F7EAE2 40%, #F2E0D5 100%)",
        padding: "80px 0 96px",
      }}
    >
      {/* ── Ambient background orbs ── */}
      <div
        className="absolute top-[-80px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, #F2D5E0 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-60px] right-[-80px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-25"
        style={{ background: "radial-gradient(circle, #C9A74D 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #7E6B9A 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px]">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="label-caps text-[#C9A74D]">Shop By Category</span>
            </div>

            {/* Headline */}
            <h2
              className="font-display text-[#2A1A14]"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
              }}
            >
              Curated{" "}
              <em style={{ fontStyle: "italic", color: "#B06080" }}>Rituals</em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="flex flex-col gap-3"
          >
            <p
              className="font-body text-[#5A3A2C]/65 text-[14px] leading-relaxed md:text-right"
              style={{ maxWidth: "320px" }}
            >
              Discover formulations crafted for every stage of your skincare ritual.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 label-caps text-[#B06080] hover:gap-3 transition-all duration-300 group self-start md:self-end"
            >
              View All Products
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </Link>
          </motion.div>
        </div>

        {/* ── Desktop Grid: asymmetric 2-2 layout ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {rituals.map((ritual, i) => (
            <RitualCard key={ritual.id} ritual={ritual} index={i} />
          ))}
        </div>

        {/* ── Mobile: horizontal scroll snap ── */}
        <div className="md:hidden -mx-5 px-5 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 pb-2">
          {rituals.map((ritual, i) => (
            <div
              key={ritual.id}
              className="snap-center shrink-0"
              style={{ width: "72vw", maxWidth: "280px" }}
            >
              <RitualCard ritual={ritual} index={i} />
            </div>
          ))}
        </div>

        {/* ── Bottom editorial strip ── */}
        <motion.div
          className="mt-14 md:mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, delay: 0.3, ease }}
        >
          {[
            { icon: "spa", label: "100% Natural" },
            { icon: "pets", label: "Cruelty Free" },
            { icon: "handyman", label: "Handmade" },
            { icon: "eco", label: "Ethically Sourced" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(176,96,128,0.1)",
                  border: "1px solid rgba(176,96,128,0.2)",
                }}
              >
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ color: "#B06080" }}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className="font-body text-[12px] tracking-[0.1em] uppercase"
                style={{ color: "#5A3A2C", opacity: 0.7 }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
