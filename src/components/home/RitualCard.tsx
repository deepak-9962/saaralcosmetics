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

          {/* ── Soft bottom gradient scrim to ensure black text is 100% legible against any image ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 34%, rgba(255,255,255,0.40) 58%, transparent 78%)",
            }}
          />

          {/* Tag pill */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-[10px] tracking-[0.12em] uppercase font-bold backdrop-blur-md shadow-sm"
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "#111111",
              }}
            >
              <span className="material-symbols-outlined text-[12px] text-[#111111]">
                {ritual.icon}
              </span>
              {ritual.tag}
            </span>
          </div>

          {/* Arrow CTA — subtle hover feedback */}
          <div
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            <span className="material-symbols-outlined text-[#111111] text-[15px]">
              arrow_outward
            </span>
          </div>

          {/* Text block at bottom — clearly legible black text */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            {/* Ritual subtitle */}
            <p
              className="font-body text-[10px] tracking-[0.18em] uppercase font-bold mb-1 text-[#111111]"
            >
              {ritual.ritual}
            </p>

            {/* Category name */}
            <h3
              className="font-display text-[#111111] font-semibold leading-tight mb-2"
              style={{ fontSize: "clamp(22px, 2.5vw, 30px)", letterSpacing: "-0.01em" }}
            >
              {ritual.name}
            </h3>

            {/* Story line */}
            <p
              className="font-body text-[#111111]/90 font-medium text-[12px] leading-relaxed line-clamp-2"
              style={{ maxWidth: "260px" }}
            >
              {ritual.story}
            </p>

            {/* Accent underline */}
            <div
              className="h-[2.5px] mt-3 rounded-full transition-all duration-300 w-8 group-hover:w-14 motion-reduce:transition-none"
              style={{ background: ritual.accent && ritual.accent !== "#ffffff" ? ritual.accent : "#111111" }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
