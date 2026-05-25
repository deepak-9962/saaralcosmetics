"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface MobileHeroSliderProps {
  // We can pass nothing because slides are static and we can render them directly here to optimize
}

export default function MobileHeroSlider() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderScroll = () => {
    const container = sliderRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const scrollDistance = width - 24;
    const index = Math.round(scrollLeft / scrollDistance);
    setActiveSlideIndex(index);
  };

  return (
    <section className="block md:hidden relative w-full bg-[#FDF6F0] pt-16 pb-6 overflow-hidden">
      <div
        ref={sliderRef}
        onScroll={handleSliderScroll}
        className="w-full overflow-x-auto flex snap-x snap-mandatory no-scrollbar gap-4 scroll-smooth px-5"
      >
        {/* Slide 1: Original Hero Section Content */}
        <div
          className="w-[calc(100vw-40px)] shrink-0 snap-center relative min-h-[520px] flex flex-col justify-center px-6 py-10 overflow-hidden rounded-2xl border border-outline-variant/15 shadow-sm"
          style={{ background: "#FDF6F0" }}
        >
          {/* Hero Background Image */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <picture className="absolute inset-0 block w-full h-full">
              <source srcSet="/images/hero.avif" type="image/avif" />
              <source srcSet="/images/hero.webp" type="image/webp" />
              <img
                src="/images/hero.png"
                alt=""
                className="w-full h-full object-cover object-bottom"
              />
            </picture>
          </div>

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to bottom,
                  #FDF6F0 0%,
                  rgba(253,246,240,0.92) 50%,
                  rgba(253,246,240,0.3) 80%,
                  transparent 100%
                )
              `,
            }}
          />

          {/* Eyebrow */}
          <div className="relative z-10 flex items-center gap-2 mb-4">
            <div className="w-6 h-px bg-[#C9A74D]" />
            <span className="font-body text-[#C9A74D] text-[10px] tracking-[0.14em] uppercase font-semibold">
              Apothecary Heritage
            </span>
          </div>

          {/* Headline */}
          <div className="relative z-10 overflow-hidden mb-4">
            <span
              className="font-display text-[#2A1A14] block"
              style={{ fontSize: "32px", lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              Luxury Skincare,<br />Rooted in Nature.
            </span>
          </div>

          {/* Sub-text */}
          <p className="relative z-10 font-body text-[#2A1A14]/70 text-[14px] leading-relaxed max-w-[240px] mb-6">
            Ancient botanical ingredients crafted for naturally radiant modern skin.
          </p>

          {/* CTAs */}
          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-body text-[11px] tracking-[0.14em] uppercase font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
              style={{ background: "#8B3A5E", color: "#fff" }}
            >
              Shop
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-body text-[11px] tracking-[0.14em] uppercase font-medium border border-[#2A1A14]/25 text-[#2A1A14]/65 hover:border-[#8B3A5E]/60 hover:text-[#8B3A5E] transition-all duration-300"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Slide 2: Banner 2 */}
        <div className="w-[calc(100vw-40px)] shrink-0 snap-center relative min-h-[520px] overflow-hidden rounded-2xl border border-outline-variant/15 shadow-sm">
          <Link href="/products" className="absolute inset-0 block">
            <picture className="absolute inset-0 block w-full h-full select-none">
              <source srcSet="/images/saaral-banner-2.avif" type="image/avif" />
              <source srcSet="/images/saaral-banner-2.webp" type="image/webp" />
              <img
                src="/images/saaral-banner-2.png"
                alt="Saaral Cosmetics Banner 2"
                className="w-full h-full object-cover object-center"
              />
            </picture>
          </Link>
        </div>

        {/* Slide 3: Banner 3 */}
        <div className="w-[calc(100vw-40px)] shrink-0 snap-center relative min-h-[520px] overflow-hidden rounded-2xl border border-outline-variant/15 shadow-sm">
          <Link href="/products" className="absolute inset-0 block">
            <picture className="absolute inset-0 block w-full h-full select-none">
              <source srcSet="/images/saaral-banner-3.avif" type="image/avif" />
              <source srcSet="/images/saaral-banner-3.webp" type="image/webp" />
              <img
                src="/images/saaral-banner-3.png"
                alt="Saaral Cosmetics Banner 3"
                className="w-full h-full object-cover object-center"
              />
            </picture>
          </Link>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-5">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const container = sliderRef.current;
              if (!container) return;
              const width = container.clientWidth;
              container.scrollTo({
                left: idx * (width - 24),
                behavior: "smooth",
              });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSlideIndex === idx
                ? "bg-[#8B3A5E] w-5"
                : "bg-[#2A1A14]/25"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
