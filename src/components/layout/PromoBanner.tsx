"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import type { PromoBannerCode } from "@/lib/types";
import { CURRENT_PROMOTION } from "@/config/promotion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

function calculateTimeLeft(endDateStr?: string | null): TimeLeft {
  if (!endDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
  }
  const target = new Date(endDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, totalMs: diff, isExpired: false };
}

const formatDigit = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export default function PromoBanner() {
  const [codes, setCodes] = useState<PromoBannerCode[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBannerCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/promo/banner", {
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data.codes) && data.codes.length > 0) {
        setCodes(data.codes);
      } else {
        setCodes([]);
      }
    } catch {
      // Fallback silently if network fails
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchBannerCodes();
  }, [fetchBannerCodes]);

  // Auto-rotate if multiple codes exist and not currently hovered
  useEffect(() => {
    if (codes.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % codes.length);
      setIsCopied(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [codes.length, isHovered]);

  const current = codes[activeIndex] || codes[0];

  // Active target date: promo expiry or promotional campaign fallback
  const targetEndDate = useMemo(() => {
    return current?.expires_at || CURRENT_PROMOTION.endDate;
  }, [current?.expires_at]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetEndDate));

  // Live timer tick every 1000ms
  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetEndDate));

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(targetEndDate);
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetEndDate]);

  const handleCopy = (code: string) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast.success(`Promo code ${code} copied!`, {
        icon: "✓",
        style: {
          borderRadius: "10px",
          background: "#2A1A14",
          color: "#FFFFFF",
          fontSize: "13px",
          fontWeight: 600,
        },
      });

      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch {
      // Fallback if clipboard permission denied
    }
  };

  // If no codes are active in banner, check if fallback promotion is enabled
  if (codes.length === 0 && !CURRENT_PROMOTION.enabled) {
    return null;
  }

  const promoCode = current?.code?.trim()?.toUpperCase() || "";
  const desc = current?.description?.trim();

  // Determine discount display text
  const discountLabel = current
    ? current.discount_type === "percentage"
      ? `${current.discount_value}% OFF${
          current.max_discount_cap ? ` (UP TO ₹${current.max_discount_cap})` : ""
        }`
      : `₹${current.discount_value} OFF`
    : "";

  // Check if description already includes the code
  const descHasCode = Boolean(desc && promoCode && desc.toUpperCase().includes(promoCode));

  return (
    <aside
      role="banner"
      aria-label="Promotional announcement and live sale countdown"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full text-white select-none transition-colors duration-200"
      style={{
        background: "linear-gradient(90deg, #9C4B6C 0%, #B06483 50%, #9C4B6C 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.14)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-2 md:py-2.5 flex items-center justify-center min-h-[44px] md:min-h-[48px]">
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-5 text-center">
          {/* ── Promo Code Offer Segment ── */}
          {promoCode ? (
            <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2">
              {descHasCode ? (
                <p className="font-body text-[11.5px] sm:text-[12.5px] md:text-[13.5px] font-bold tracking-[0.06em] uppercase text-white drop-shadow-xs">
                  {desc}
                </p>
              ) : (
                <>
                  <span className="font-body text-[11px] sm:text-[12px] md:text-[13px] font-semibold tracking-[0.06em] uppercase text-white/90">
                    USE CODE
                  </span>

                  {/* Interactive Code Pill */}
                  <button
                    type="button"
                    onClick={() => handleCopy(promoCode)}
                    title="Click to copy promo code"
                    className="group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-white text-[#9C4B6C] font-extrabold text-[12px] sm:text-[13px] tracking-wider shadow-xs hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{promoCode}</span>
                    {isCopied ? (
                      <svg
                        className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-150"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 text-[#9C4B6C]/70 group-hover:text-[#9C4B6C] transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>

                  <span className="font-body text-[11px] sm:text-[12px] md:text-[13px] font-bold tracking-[0.06em] uppercase text-white drop-shadow-xs">
                    {desc ? `FOR ${desc.toUpperCase()}` : `FOR ${discountLabel}`}
                  </span>
                </>
              )}


            </div>
          ) : (
            <p className="font-body text-[11.5px] sm:text-[12.5px] md:text-[13.5px] font-bold tracking-[0.06em] uppercase text-white drop-shadow-xs">
              {CURRENT_PROMOTION.message}
            </p>
          )}

          {/* ── Divider & Countdown Timer Segment ── */}
          {!timeLeft.isExpired && (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-block text-white/60 text-[12px]">|</span>
              <span className="font-body text-[10px] sm:text-[11px] md:text-[12px] font-bold tracking-[0.08em] uppercase text-white/90">
                ENDS IN
              </span>

              {/* 4-Pill Vilvah Countdown Layout */}
              <div
                className="flex items-center gap-1.5 md:gap-2"
                aria-live="off"
                aria-label={
                  isMounted
                    ? `Time remaining: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`
                    : "Promotional countdown timer"
                }
                suppressHydrationWarning
              >
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div
                    suppressHydrationWarning
                    className="bg-white text-[#9C4B6C] font-bold text-[11px] md:text-[13px] px-1.5 md:px-2 py-0.5 rounded-[5px] md:rounded-[6px] min-w-[28px] md:min-w-[32px] text-center shadow-xs leading-none"
                  >
                    {isMounted ? formatDigit(timeLeft.days) : "00"}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-bold text-white/85 tracking-[0.08em] uppercase mt-0.5">
                    DAYS
                  </span>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div
                    suppressHydrationWarning
                    className="bg-white text-[#9C4B6C] font-bold text-[11px] md:text-[13px] px-1.5 md:px-2 py-0.5 rounded-[5px] md:rounded-[6px] min-w-[28px] md:min-w-[32px] text-center shadow-xs leading-none"
                  >
                    {isMounted ? formatDigit(timeLeft.hours) : "00"}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-bold text-white/85 tracking-[0.08em] uppercase mt-0.5">
                    HRS
                  </span>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div
                    suppressHydrationWarning
                    className="bg-white text-[#9C4B6C] font-bold text-[11px] md:text-[13px] px-1.5 md:px-2 py-0.5 rounded-[5px] md:rounded-[6px] min-w-[28px] md:min-w-[32px] text-center shadow-xs leading-none"
                  >
                    {isMounted ? formatDigit(timeLeft.minutes) : "00"}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-bold text-white/85 tracking-[0.08em] uppercase mt-0.5">
                    MIN
                  </span>
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div
                    suppressHydrationWarning
                    className="bg-white text-[#9C4B6C] font-bold text-[11px] md:text-[13px] px-1.5 md:px-2 py-0.5 rounded-[5px] md:rounded-[6px] min-w-[28px] md:min-w-[32px] text-center shadow-xs leading-none"
                  >
                    {isMounted ? formatDigit(timeLeft.seconds) : "00"}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-bold text-white/85 tracking-[0.08em] uppercase mt-0.5">
                    SEC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dot Indicators for Multiple Codes */}
          {codes.length > 1 && (
            <div className="flex items-center gap-1.5 ml-1">
              {codes.map((c, i) => (
                <button
                  key={c.code || i}
                  type="button"
                  onClick={() => {
                    setActiveIndex(i);
                    setIsCopied(false);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "bg-white w-3"
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Show promo code ${c.code}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
