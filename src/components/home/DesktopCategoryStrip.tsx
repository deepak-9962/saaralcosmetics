"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomepageCategory } from "@/lib/types";

interface DesktopCategoryStripProps {
  categories?: HomepageCategory[];
}

export default function DesktopCategoryStrip({ categories = [] }: DesktopCategoryStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const overflow = maxScroll > 4; // Tolerance for fractional subpixel rendering
    setHasOverflow(overflow);
    setCanScrollLeft(overflow && scrollLeft > 2);
    setCanScrollRight(overflow && scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    checkScroll();

    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      resizeObserver?.disconnect();
    };
  }, [checkScroll, categories]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Scroll roughly 70% of the visible container width or at least 320px
    const scrollDistance = Math.max(320, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({
      left: direction === "left" ? -scrollDistance : scrollDistance,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Shop by Category"
      className="hidden md:block w-full"
      style={{
        background: "#FDFAF8",
        borderBottom: "1px solid rgba(42,26,20,0.06)",
      }}
    >
      <div
        className="max-w-[1440px] mx-auto"
        style={{ padding: "12px 32px 36px" }}
      >
        {/* ── Eyebrow label ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-6 shrink-0" style={{ background: "#C9A74D" }} />
          <span
            className="font-body text-[10px] tracking-[0.22em] uppercase font-semibold"
            style={{ color: "#C9A74D" }}
          >
            Shop By Category
          </span>
        </div>

        {/* ── Category strip: horizontal single-row scroll with clean external arrow navigation ── */}
        <div className="relative flex items-center">
          {/* Left Arrow Button */}
          {hasOverflow && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className={`shrink-0 mr-3 z-10 w-9 h-9 rounded-full border border-[#D4A0B0]/80 bg-white text-[#8B3A5E] shadow-[0_2px_8px_rgba(180,100,130,0.12)] flex items-center justify-center transition-all duration-200 hover:bg-[#FFF9F7] hover:border-[#B06080] hover:scale-105 active:scale-95 cursor-pointer ${
                !canScrollLeft
                  ? "opacity-0 pointer-events-none cursor-default"
                  : "opacity-100"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Horizontally scrollable row — strictly single row without wrapping */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1 flex-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                href={cat.link_url || "/products"}
                aria-label={`Browse ${cat.title}`}
                className="group flex flex-col items-center gap-2.5 cursor-pointer shrink-0"
                style={{ width: "126px" }}
              >
                {/*
                  Outer wrapper: calm, steady presentation.
                  Subtle 2px hover elevation without bounce, oscillation, or excessive scaling.
                */}
                <div
                  className="relative flex items-end justify-center transition-transform duration-200 ease-out group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                  style={{
                    width: "126px",
                    height: "148px",
                  }}
                >
                  {/* Pastel blob circle — sits at bottom of wrapper */}
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-shadow duration-200 motion-reduce:transition-none group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                    style={{
                      width: "112px",
                      height: "112px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 42% 52%, ${cat.blob_color || "#F2D5C0"} 0%, ${cat.blob_color2 || "#EEC4A8"} 60%, rgba(255,255,255,0.45) 100%)`,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.9) inset",
                      border: "1.5px solid rgba(255,255,255,0.80)",
                    }}
                  >
                    {/* Inner highlight */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.50) 0%, transparent 65%)",
                      }}
                    />
                  </div>

                  {/* Product image — static, calm, no bounce or aggressive zoom */}
                  <Image
                    src={cat.image_url}
                    alt={cat.title}
                    width={104}
                    height={130}
                    {...(index === 0
                      ? { priority: true, fetchPriority: "high" as const }
                      : { loading: "lazy" as const })}
                    className="relative z-10"
                    style={{
                      objectFit: "contain",
                      objectPosition: "bottom",
                      maxHeight: "130px",
                      width: "auto",
                      filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.09))",
                    }}
                  />
                </div>

                {/* Pill label — white bg, dusty-rose border, arrow with gentle color transition */}
                <div
                  className="flex items-center gap-1 px-3 py-[5px] transition-all duration-200 group-hover:border-[#B06080] group-hover:bg-[#FFF9F7] motion-reduce:transition-none"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #D4A0B0",
                    borderRadius: "100px",
                    boxShadow: "0 1px 4px rgba(180,100,130,0.08)",
                    minWidth: "86px",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="font-body whitespace-nowrap"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#3A2418",
                      letterSpacing: "0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {cat.title}
                  </span>
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M2 5h6M6 2.5L8.5 5 6 7.5"
                      stroke="#B06080"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow Button */}
          {hasOverflow && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
              className={`shrink-0 ml-3 z-10 w-9 h-9 rounded-full border border-[#D4A0B0]/80 bg-white text-[#8B3A5E] shadow-[0_2px_8px_rgba(180,100,130,0.12)] flex items-center justify-center transition-all duration-200 hover:bg-[#FFF9F7] hover:border-[#B06080] hover:scale-105 active:scale-95 cursor-pointer ${
                !canScrollRight
                  ? "opacity-0 pointer-events-none cursor-default"
                  : "opacity-100"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
