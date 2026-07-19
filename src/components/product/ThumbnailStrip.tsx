"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  url: string;
  alt: string;
}

interface ThumbnailStripProps {
  images: GalleryImage[];
  /** Controlled: which thumbnail should appear "active" (ring highlight) */
  activeIndex: number;
  /** Called when a thumbnail is clicked — parent updates its activeIndex */
  onThumbnailClick: (index: number) => void;
}

// ── ThumbnailStrip ────────────────────────────────────────────────────────────
/**
 * CONCERNS:
 *  1. THUMBNAIL CLICK → calls onThumbnailClick(index), which is the ONLY way
 *     this component affects the parent's activeIndex. It never stores its
 *     own "active" state — that always comes from the parent prop.
 *
 *  2. SCROLL NAVIGATION (prev/next arrows) → scrolls the container left/right
 *     by a fixed pixel amount (200px). This is COMPLETELY INDEPENDENT of
 *     activeIndex — it only moves the scroll viewport to reveal hidden thumbnails.
 *
 *  3. PROGRESS BAR → purely reflects scroll position of the thumbnail container:
 *       indicatorLeft  = (scrollLeft / (scrollWidth - clientWidth)) * 100   [%]
 *       indicatorWidth = (clientWidth / scrollWidth) * 100                  [%]
 *     It has NOTHING to do with which image is selected; it only shows how far
 *     the user has panned the thumbnail strip.
 */
export default function ThumbnailStrip({
  images,
  activeIndex,
  onThumbnailClick,
}: ThumbnailStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Scroll progress state ──────────────────────────────────────────────────
  // indicatorLeft  : left offset of the progress indicator (0–100%)
  // indicatorWidth : width of the progress indicator (0–100%), relative to track
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(100);
  // Whether the prev/next scroll arrows should be enabled
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ── Recalculate progress bar + arrow states from current scroll position ───
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const scrollable = scrollWidth - clientWidth;

    // Progress bar indicator:
    //   width  = proportion of scrollable content visible at once (thumb size)
    //   offset = how far we've scrolled as a percentage of the scrollable range
    setIndicatorWidth(scrollable > 0 ? (clientWidth / scrollWidth) * 100 : 100);
    setIndicatorLeft(scrollable > 0 ? (scrollLeft / scrollable) * (100 - (clientWidth / scrollWidth) * 100) : 0);

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollable - 1);
  }, []);

  // Initialise on mount and re-check when images change
  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    // Use ResizeObserver so the bar recalculates if the container width changes
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [images, updateScrollState]);

  // ── Scroll left/right by fixed pixel amount (does NOT change activeIndex) ──
  const scrollBy = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ── Thumbnail row ───────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        // Hide the native scrollbar but keep the element scrollable
        className="flex gap-3 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="listbox"
        aria-label="Product image thumbnails"
      >
        {images.map((img, idx) => (
          <button
            key={idx}
            role="option"
            aria-selected={idx === activeIndex}
            aria-label={`View image ${idx + 1}: ${img.alt}`}
            onClick={() => onThumbnailClick(idx)}
            className={[
              "relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              idx === activeIndex
                // Active: full opacity, brand ring, slight lift
                ? "ring-2 ring-offset-2 ring-[#b06080] opacity-100 scale-[1.03] shadow-md"
                // Inactive: dimmed, hover restores opacity
                : "opacity-70 hover:opacity-100 hover:scale-[1.01]",
            ].join(" ")}
            style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {/* ── Progress bar track + indicator ─────────────────────────────────── */}
      {/*
       * This bar reflects ONLY the scroll position of the thumbnail container.
       * It is NOT a dot-indicator for the active image.
       *
       * - Track  : full width, h-1, light gray
       * - Thumb  : shorter filled bar, positioned with left% and sized with width%
       *   left%  = scrollLeft / (scrollWidth - clientWidth) * (100 - thumbWidth%)
       *   width% = clientWidth / scrollWidth * 100
       */}
      <div className="relative h-1 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-full bg-gray-800 transition-all duration-100"
          style={{
            left: `${indicatorLeft}%`,
            width: `${indicatorWidth}%`,
          }}
        />
      </div>

      {/* ── Prev / Next arrows for THUMBNAIL STRIP scroll only ─────────────── */}
      {/*
       * These buttons scroll the thumbnail container left/right by 200px.
       * They do NOT affect activeIndex — the parent's main image does not change.
       * Left arrow is faded when already at start; right arrow faded at end.
       */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => scrollBy("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll thumbnails left"
          className={[
            "w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all duration-200",
            canScrollLeft
              ? "cursor-pointer hover:bg-gray-50 hover:border-gray-400"
              : "opacity-30 cursor-not-allowed",
          ].join(" ")}
        >
          <ChevronLeft size={14} className="text-gray-700" />
        </button>
        <button
          onClick={() => scrollBy("right")}
          disabled={!canScrollRight}
          aria-label="Scroll thumbnails right"
          className={[
            "w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all duration-200",
            canScrollRight
              ? "cursor-pointer hover:bg-gray-50 hover:border-gray-400"
              : "opacity-30 cursor-not-allowed",
          ].join(" ")}
        >
          <ChevronRight size={14} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
}
