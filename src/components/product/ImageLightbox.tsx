"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  images: { url: string; alt: string }[];
  /** Index of the currently displayed image */
  activeIndex: number;
  onClose: () => void;
}

/**
 * Full-screen lightbox modal.
 * Dismissable via:
 *   – the × button
 *   – clicking the dark backdrop
 *   – pressing the Escape key
 *
 * Scroll-locks the page while open.
 */
export default function ImageLightbox({
  images,
  activeIndex,
  onClose,
}: ImageLightboxProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Scroll-lock body while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const image = images[activeIndex];
  if (!image) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        // Close on backdrop click (not on image itself)
        if (e.target === backdropRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Product image lightbox"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      {/* Image — fills most of viewport, maintains aspect ratio */}
      <div
        className="relative w-full max-w-3xl aspect-square rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 95vw, 768px"
          priority
        />
      </div>

      {/* Image counter */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-[13px] text-white/60">
        {activeIndex + 1} / {images.length}
      </p>
    </div>
  );
}
