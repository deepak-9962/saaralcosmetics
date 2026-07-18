"use client";

/**
 * ProductImage — Reusable next/image wrapper for Supabase-hosted product photos.
 *
 * Features:
 *  • Skeleton shimmer loader while the image is fetching
 *  • Graceful fallback to /images/placeholder-product.webp on error or null src
 *  • object-cover with smooth hover-scale support via className prop
 *  • Works with Supabase Storage public URLs (already whitelisted in next.config.ts)
 */

import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  /** Public Supabase Storage URL, or any image URL. Pass null to show placeholder. */
  src: string | null | undefined;
  alt: string;
  /** Additional className forwarded to the wrapping <div>. Use to set aspect ratio, rounded corners, etc. */
  className?: string;
  /** Passed to next/image sizes attribute for responsive loading. Defaults to a sensible product-card value. */
  sizes?: string;
  /** Set to true for above-the-fold / LCP images to disable lazy loading and set fetchPriority=high. */
  priority?: boolean;
  /** Inline style overrides (e.g. transform for hover-scale from the parent). */
  imageStyle?: React.CSSProperties;
}

/** The local fallback shown when src is null or the remote image fails to load. */
const PLACEHOLDER_SRC = "/images/placeholder-product.webp";

export default function ProductImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  imageStyle,
}: ProductImageProps) {
  // Show skeleton until the image fires its onLoad event
  const [isLoaded, setIsLoaded] = useState(false);
  // Switch to placeholder if the remote image errors (e.g. deleted from Storage)
  const [hasError, setHasError] = useState(false);

  const resolvedSrc =
    !src || hasError ? PLACEHOLDER_SRC : src;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* ── Skeleton shimmer (visible while image loads) ── */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(90deg, #F2D5E0 0%, #F9E8EF 50%, #F2D5E0 100%)",
            backgroundSize: "200% 100%",
            animation: "product-image-shimmer 1.6s ease-in-out infinite",
          }}
        />
      )}

      {/* ── The actual image ── */}
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.35s ease",
          ...imageStyle,
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          // If the Supabase URL fails (e.g. file deleted), fall back gracefully
          setHasError(true);
          setIsLoaded(true); // hide skeleton even on error
        }}
      />

      {/* ── Shimmer keyframes injected inline so no global CSS needed ── */}
      <style>{`
        @keyframes product-image-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
