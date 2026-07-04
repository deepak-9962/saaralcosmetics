"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

type Slide = {
  id: string;
  image: string;
  alt: string;
  ctaHref: string;
  indicatorColor: string;
};

const slides: Slide[] = [
  {
    id: "slide1",
    image: "/images/slide1.avif",
    alt: "Saaral Face Cream — Saffron and Vetpalai Formula for Pigmentation & Glow",
    ctaHref: "/products?category=face-cream",
    indicatorColor: "#7A5020",
  },
  {
    id: "slide2",
    image: "/images/slide2.avif",
    alt: "Saaral Face Wash — Ancient Herbal Cleanse for Radiant Skin",
    ctaHref: "/products?category=face-wash",
    indicatorColor: "#8B3A5E",
  },
  {
    id: "slide3",
    image: "/images/slide3.avif",
    alt: "Saaral Heritage Ritual — Nalangu Maavu and Premium Soap Collection",
    ctaHref: "/products",
    indicatorColor: "#1A5828",
  },
];

export default function MobileHeroBanner() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const nextSlide = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goTo = (idx: number) => {
    setActive(idx);
  };

  // Auto-play logic
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if change in X is significantly greater than Y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <div 
      className="block md:hidden w-full bg-[#FDF6F0]"
      style={{ padding: "10px 12px 14px" }}
    >
      <div
        className="relative overflow-hidden w-full aspect-[16/9]"
        style={{
          borderRadius: "20px",
          boxShadow: "0 5px 24px rgba(0,0,0,0.09), 0 1px 6px rgba(0,0,0,0.05)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Mobile Hero Banner Carousel"
      >
        {slides.map((slide, i) => (
          <div
            key={`mobile-${slide.id}`}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: i === active ? 1 : 0,
              transition: "opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
              zIndex: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
            aria-hidden={i !== active}
          >
            <Link
              href={slide.ctaHref}
              tabIndex={i === active ? 0 : -1}
              className="block w-full h-full relative"
              aria-label={slide.alt}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-cover object-center"
                style={{ pointerEvents: "none" }}
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}

        {/* Dots Indicator — Mobile */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255, 255, 255, 0.35)", backdropFilter: "blur(8px)" }}
        >
          {slides.map((_, i) => (
            <button
              key={`mobile-dot-${i}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative border-none p-0 cursor-pointer"
              style={{
                width: active === i ? "16px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: active === i ? slides[active].indicatorColor : "rgba(42,26,20,0.3)",
                transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <span className="absolute -inset-2.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
