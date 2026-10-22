"use client";

import Link from "next/link";
import Image from "next/image";

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

export default function RitualCard({ ritual, index }: RitualCardProps) {
  return (
    <div className="relative group rounded-[24px] overflow-hidden">
      <Link href={ritual.href} className="block">
        {/* ── Image container — static, calm, no 3D tilt or bouncing ── */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
          {/* Static image with Next.js Image component */}
          <Image
            src={ritual.image}
            alt={ritual.name}
            fill
            sizes="(max-width: 768px) 75vw, 25vw"
            className="object-cover transition-opacity duration-300"
          />

          {/* Elegant gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${ritual.accent}E6 0%, ${ritual.accent}55 42%, transparent 70%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(26,10,5,0.30) 0%, transparent 30%)",
            }}
          />

          {/* Tag pill */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-[10px] tracking-[0.12em] uppercase font-semibold backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.35)",
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

          {/* Arrow CTA — subtle fade on hover */}
          <div
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:transition-none"
            style={{
              background: "rgba(255,255,255,0.20)",
              border: "1px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(6px)",
            }}
          >
            <span className="material-symbols-outlined text-white text-[15px]">
              arrow_outward
            </span>
          </div>

          {/* Text block at bottom — always readable, static and calm */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            {/* Ritual subtitle */}
            <p
              className="font-body text-[10px] tracking-[0.18em] uppercase mb-1"
              style={{ color: "rgba(255,255,255,0.75)" }}
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

            {/* Story line */}
            <p
              className="font-body text-white/80 text-[12px] leading-relaxed line-clamp-2"
              style={{ maxWidth: "240px" }}
            >
              {ritual.story}
            </p>

            {/* Accent underline */}
            <div
              className="h-[2px] mt-3 rounded-full transition-all duration-300 w-8 group-hover:w-14 motion-reduce:transition-none"
              style={{ background: ritual.accent }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
