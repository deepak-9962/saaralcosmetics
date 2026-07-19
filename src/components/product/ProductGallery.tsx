"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ZoomIn } from "lucide-react";
import ThumbnailStrip, { type GalleryImage } from "./ThumbnailStrip";
import ImageLightbox from "./ImageLightbox";

// Re-export so consumers can import GalleryImage from ProductGallery directly
export type { GalleryImage };

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductGalleryProps {
  images: GalleryImage[];
}

// ── ProductGallery ────────────────────────────────────────────────────────────
/**
 * ARCHITECTURE — TWO SEPARATE NAVIGATION SYSTEMS
 *
 * 1. MAIN IMAGE NAVIGATION  (activeIndex state in this component)
 *    Controlled by:
 *      a) Left arrow button (top-left of main image) → decrement, wrap to last
 *      b) Keyboard: ← ArrowLeft / → ArrowRight
 *      c) Clicking a thumbnail → ThumbnailStrip calls onThumbnailClick(idx)
 *
 * 2. THUMBNAIL STRIP SCROLL NAVIGATION  (managed entirely inside ThumbnailStrip)
 *    Controlled by:
 *      a) Prev/Next arrows below the progress bar → scroll strip left/right 200px
 *      b) User's native swipe/scroll on the strip
 *    DOES NOT affect activeIndex — it only moves the visible window of thumbnails.
 *
 * The progress bar inside ThumbnailStrip reflects the strip's scroll position,
 * not which image is active. These are intentionally decoupled.
 */
export default function ProductGallery({ images }: ProductGalleryProps) {
  // ── Main image active index ────────────────────────────────────────────────
  // This is the ONLY shared state between the main image and the thumbnail strip.
  // ThumbnailStrip reads it (to show the active ring) but cannot write it directly —
  // it calls onThumbnailClick() and this component decides how to update state.
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Lightbox ───────────────────────────────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ── Crossfade transition ───────────────────────────────────────────────────
  // We trigger a brief opacity dip when the activeIndex changes to create a
  // smooth 200ms crossfade between images (no external animation library needed).
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Guard: clamp activeIndex if images array shrinks
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));

  // ── Go to previous image (wraps from 0 → last) ────────────────────────────
  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 150);
  }, [images.length]);

  // ── Go to specific index (used by thumbnail clicks) ───────────────────────
  const goToIndex = useCallback((index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 150);
  }, [activeIndex]);

  // ── Keyboard support (← → arrow keys for accessibility) ──────────────────
  useEffect(() => {
    if (lightboxOpen) return; // lightbox handles its own keyboard events
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
          setIsTransitioning(false);
        }, 150);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, goToPrev, lightboxOpen]);

  if (images.length === 0) {
    return (
      <div
        className="w-full aspect-square rounded-2xl flex items-center justify-center border border-outline-variant/30"
        style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}
        aria-label="No product images available"
      >
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">image</span>
      </div>
    );
  }

  const currentImage = images[safeIndex];

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        {/* ── PART 1: MAIN IMAGE CONTAINER ──────────────────────────────────── */}
        <div
          className="relative w-full aspect-square rounded-2xl overflow-hidden border border-outline-variant/30"
          style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}
          // Touch swipe support (mobile)
          role="img"
          aria-label={`Product gallery — image ${safeIndex + 1} of ${images.length}: ${currentImage.alt}`}
        >
          {/* Main image with crossfade transition */}
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            priority={safeIndex === 0}
            className={[
              "object-cover transition-opacity duration-200",
              isTransitioning ? "opacity-0" : "opacity-100",
            ].join(" ")}
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* ── LEFT ARROW — TOP-LEFT, not vertically centered ─────────────── */}
          {/*
           * Positioned at top-4 left-4 (near the top-left corner per spec).
           * onClick: go to previous image (wraps to last if at index 0).
           * Only shown when there are multiple images.
           */}
          {images.length > 1 && (
            <button
              onClick={goToPrev}
              aria-label="Previous image"
              className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white"
            >
              <ChevronLeft size={16} className="text-gray-700" />
            </button>
          )}

          {/* ── ZOOM BUTTON — BOTTOM-RIGHT ─────────────────────────────────── */}
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="Open full-screen image"
            className="absolute bottom-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white"
          >
            <ZoomIn size={18} className="text-gray-700" />
          </button>

          {/* Image counter pill — subtle, top-right */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
              <span className="font-body text-[11px] text-white/90 tabular-nums">
                {safeIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {/* ── PART 2: THUMBNAIL STRIP ────────────────────────────────────────── */}
        {/*
         * ThumbnailStrip manages its OWN scroll state (ref + onScroll handler).
         * It receives activeIndex READ-ONLY (for the ring highlight) and calls
         * onThumbnailClick when the user selects a thumbnail, which updates
         * this component's activeIndex. The strip's prev/next arrows ONLY
         * scroll the strip viewport — they never touch activeIndex.
         */}
        {images.length > 1 && (
          <ThumbnailStrip
            images={images}
            activeIndex={safeIndex}
            onThumbnailClick={goToIndex}
          />
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          activeIndex={safeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
