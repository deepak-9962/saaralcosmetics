"use client";

import Link from "next/link";
import Image from "next/image";

export interface RitualItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  href: string;
  bg: string;
  icon: string;
}

interface RitualCardProps {
  ritual: RitualItem;
  index?: number;
}

export default function RitualCard({ ritual, index = 0 }: RitualCardProps) {
  return (
    <Link
      href={ritual.href}
      aria-label={`Explore ${ritual.name} - ${ritual.subtitle}`}
      className="group relative flex w-full rounded-[22px] md:rounded-[26px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(42,26,20,0.08)] cursor-pointer select-none"
      style={{
        backgroundColor: ritual.bg,
        border: "1px solid rgba(0, 0, 0, 0.04)",
        minHeight: "142px",
        height: "clamp(145px, 15vw, 162px)",
      }}
    >
      {/* ── Left Column: Icon, Subtitle, Title + Arrow Action ── */}
      <div className="relative z-10 w-[55%] sm:w-[54%] md:w-[56%] h-full p-4 sm:p-5 pr-1 flex flex-col justify-between">
        {/* Top: Minimalist Botanical Icon + Tracking Subtitle */}
        <div>
          <span
            className="material-symbols-outlined text-[19px] sm:text-[21px] md:text-[22px] leading-none"
            style={{ color: "rgba(26, 14, 10, 0.85)" }}
          >
            {ritual.icon}
          </span>
          <p
            className="font-body text-[9.5px] sm:text-[10px] tracking-[0.16em] uppercase font-bold mt-1.5 leading-tight"
            style={{ color: "#6E5A4E" }}
          >
            {ritual.subtitle}
          </p>
        </div>

        {/* Bottom: Elegant Serif Title & Circular Arrow Action Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-auto pt-2">
          <h3
            className="font-display font-bold text-[#1A0E0A] text-[18px] sm:text-[20px] md:text-[21px] lg:text-[23px] tracking-tight leading-none group-hover:text-[#B06080] transition-colors"
          >
            {ritual.name}
          </h3>

          <div
            className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-black/[0.05] text-[#1A0E0A] shadow-xs group-hover:scale-110 group-hover:bg-[#1A0E0A] group-hover:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[12px] sm:text-[13px] md:text-[14px]">
              north_east
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Column: Botanical Product Composition Image ── */}
      <div className="absolute right-0 top-0 bottom-0 w-[52%] sm:w-[54%] md:w-[56%] pointer-events-none select-none flex items-center justify-end overflow-hidden">
        <Image
          src={ritual.image}
          alt={ritual.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 280px"
          className="object-contain object-right group-hover:scale-105 transition-transform duration-500"
          priority={index < 2}
        />
        {/* Soft edge blend gradient on the left boundary */}
        <div
          className="absolute inset-y-0 left-0 w-8 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${ritual.bg} 0%, transparent 100%)`,
          }}
        />
      </div>
    </Link>
  );
}
