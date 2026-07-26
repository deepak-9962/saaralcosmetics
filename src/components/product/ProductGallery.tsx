"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import ThumbnailStrip, { type GalleryImage } from "./ThumbnailStrip";
import ImageLightbox from "./ImageLightbox";

// Re-export so consumers can import GalleryImage from ProductGallery directly
export type { GalleryImage };

interface ProductGalleryProps {
  images: GalleryImage[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Guard: clamp activeIndex if images array shrinks
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));

  // ── Go to previous image (wraps from 0 → last) ────────────────────────────
  const goToPrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 150);
  }, [images.length]);

  // ── Go to next image (wraps from last → 0) ────────────────────────────────
  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
    if (lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goToPrev, goToNext, lightboxOpen]);

  if (images.length === 0) {
    return (
      <div
        className="w-full aspect-square rounded-2xl flex items-center justify-center border border-outline-variant/30"
        style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}
        aria-label="No product images available"
      >
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">
          image
        </span>
      </div>
    );
  }

  const currentImage = images[safeIndex];

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        {/* ── MAIN IMAGE CONTAINER WITH SPLIT CLICK ZONES ──────────────────── */}
        <div
          className="relative w-full aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 select-none group"
          style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}
          role="region"
          aria-label={`Product gallery — image ${safeIndex + 1} of ${images.length}: ${currentImage.alt}`}
        >
          {/* Main image with crossfade transition */}
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            priority={safeIndex === 0}
            className={[
              "object-cover transition-opacity duration-200 pointer-events-none",
              isTransitioning ? "opacity-0" : "opacity-100",
            ].join(" ")}
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* ── INVISIBLE SPLIT-CLICK ZONES (LEFT 50% & RIGHT 50%) ─────────── */}
          {images.length > 1 && (
            <>
              {/* LEFT HALF — Click to Previous Image */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                style={{
                  cursor:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='rgba(42,26,20,0.65)'/%3E%3Cpolyline points='14 18 8 12 14 6'/%3E%3C/svg%3E\") 16 16, w-resize",
                }}
                title="Previous Image (Click left side)"
                aria-label="Previous Image"
              />

              {/* RIGHT HALF — Click to Next Image */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                style={{
                  cursor:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='rgba(42,26,20,0.65)'/%3E%3Cpolyline points='10 6 16 12 10 18'/%3E%3C/svg%3E\") 16 16, e-resize",
                }}
                title="Next Image (Click right side)"
                aria-label="Next Image"
              />
            </>
          )}

          {/* ── VISIBLE CHEVRON HINTS (Higher Z-index so they don't block clicks) ── */}
          {images.length > 1 && (
            <>
              {/* Left Chevron Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white text-gray-800"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Right Chevron Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white text-gray-800"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* ── ZOOM BUTTON — BOTTOM-RIGHT (z-20 stops event propagation) ── */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            aria-label="Open full-screen image"
            className="absolute bottom-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white"
          >
            <ZoomIn size={18} className="text-gray-700" />
          </button>

          {/* Image counter pill — top-right (z-20) */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 z-20 px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-sm">
              <span className="font-body text-[11px] font-medium text-white/90 tabular-nums">
                {safeIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {/* ── THUMBNAIL STRIP ────────────────────────────────────────────────── */}
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
