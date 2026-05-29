"use client";

import { useRef } from "react";

interface BestsellersCarouselProps {
  children: React.ReactNode;
}

export default function BestsellersCarousel({ children }: BestsellersCarouselProps) {
  const bestsellerScrollRef = useRef<HTMLDivElement>(null);

  const scrollBestsellers = (direction: "left" | "right") => {
    const container = bestsellerScrollRef.current;
    if (!container) {
      return;
    }
    const scrollAmount = Math.max(240, container.clientWidth * 0.7);
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={bestsellerScrollRef}
        className="overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory md:overflow-visible md:snap-none"
      >
        <div
          className="flex w-max items-stretch gap-4 pb-4 md:grid md:grid-cols-4 md:w-full md:gap-6 md:pb-0 md:!px-0"
          style={{
            paddingLeft: "calc(50vw - 130px)",
            paddingRight: "calc(50vw - 130px)",
          }}
        >
          {children}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => scrollBestsellers("left")}
          className="h-12 w-12 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:border-outline hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Scroll bestsellers left"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <button
          type="button"
          onClick={() => scrollBestsellers("right")}
          className="h-12 w-12 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant flex items-center justify-center hover:border-outline hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Scroll bestsellers right"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
