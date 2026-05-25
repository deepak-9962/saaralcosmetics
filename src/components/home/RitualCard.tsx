"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface Ritual {
  id: string;
  name: string;
  ritual: string;
  story: string;
  image: string;
  href: string;
  accent: string;
  accentLight: string;
  tag: string;
  icon: string;
}

interface RitualCardProps {
  ritual: Ritual;
  index: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function RitualCard({ ritual, index }: RitualCardProps) {
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
