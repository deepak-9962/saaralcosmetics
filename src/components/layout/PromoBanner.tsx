"use client";

import { useEffect, useState } from "react";
import type { PromoBannerCode } from "@/lib/types";

function formatBannerText(promo: PromoBannerCode): string {
  if (promo.description && promo.description.trim()) {
    return promo.description.trim();
  }
  if (promo.discount_type === "percentage") {
    const cap = promo.max_discount_cap ? ` (up to ₹${promo.max_discount_cap})` : "";
    return `Use code ${promo.code} for ${promo.discount_value}% off${cap}`;
  }
  return `Use code ${promo.code} for ₹${promo.discount_value} off`;
}

export default function PromoBanner() {
  const [codes, setCodes] = useState<PromoBannerCode[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch("/api/promo/banner")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.codes) && data.codes.length > 0) {
          setCodes(data.codes);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-rotate every 4.5s when multiple codes
  useEffect(() => {
    if (codes.length <= 1) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % codes.length);
        setVisible(true);
      }, 350); // fade-out duration
    }, 4500);

    return () => clearInterval(interval);
  }, [codes.length]);

  // No codes → hide banner entirely
  if (codes.length === 0) return null;

  const current = codes[activeIndex];

  return (
    <div className="flex min-h-7 bg-primary text-on-primary px-3 py-1 md:py-1.5 items-center justify-center overflow-hidden">
      <p
        className="font-body text-[9px] md:text-[10px] tracking-[0.08em] uppercase text-center whitespace-nowrap transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {formatBannerText(current)}
      </p>
      {/* Dot indicators for multiple codes */}
      {codes.length > 1 && (
        <div className="flex items-center gap-1 ml-3">
          {codes.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setVisible(false);
                setTimeout(() => {
                  setActiveIndex(i);
                  setVisible(true);
                }, 300);
              }}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? "bg-on-primary" : "bg-on-primary/40"
              }`}
              aria-label={`Show promo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
