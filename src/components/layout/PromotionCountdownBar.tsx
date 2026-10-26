"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CURRENT_PROMOTION, type PromotionCampaign } from "@/config/promotion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

function calculateTimeLeft(endDateStr: string): TimeLeft {
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

interface PromotionCountdownBarProps {
  customConfig?: Partial<PromotionCampaign>;
}

export default function PromotionCountdownBar({ customConfig }: PromotionCountdownBarProps) {
  const config = useMemo(() => {
    return { ...CURRENT_PROMOTION, ...customConfig };
  }, [customConfig]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(config.endDate));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Live timer tick every 1000ms
  useEffect(() => {
    if (!config.enabled) return;

    // Immediately sync on mount
    setTimeLeft(calculateTimeLeft(config.endDate));

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(config.endDate);
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.enabled, config.endDate]);

  // Guard: Not enabled
  if (!config.enabled) {
    return null;
  }

  // Guard: If expired and set to hide
  if (timeLeft.isExpired && config.onExpire === "hide") {
    return null;
  }

  const formatDigit = (n: number) => String(Math.max(0, n)).padStart(2, "0");

  const ContentWrapper = config.targetUrl
    ? ({ children }: { children: React.ReactNode }) => (
        <Link
          href={config.targetUrl!}
          className="w-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-95"
        >
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="w-full flex items-center justify-center">{children}</div>
      );

  return (
    <aside
      role="banner"
      aria-label="Promotional announcement and sale countdown"
      className="relative w-full text-white overflow-hidden select-none"
      style={{
        background: "linear-gradient(90deg, #9C4B6C 0%, #B06483 50%, #9C4B6C 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-2 md:py-2.5 flex items-center justify-center min-h-[44px] md:min-h-[48px]">
        {/* Main Content Area */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6">
          {timeLeft.isExpired ? (
            /* Expired State */
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              <p className="font-body text-[12px] md:text-[13px] font-bold tracking-[0.1em] uppercase text-white/95">
                {config.expiredMessage}
              </p>
            </div>
          ) : (
            /* Active Promotional State */
            <ContentWrapper>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 md:gap-5">
                {/* Offer Headline */}
                <p className="font-body text-[11px] sm:text-[12px] md:text-[13.5px] font-bold tracking-[0.06em] md:tracking-[0.08em] uppercase text-center text-white drop-shadow-xs">
                  {config.message}
                </p>

                {/* Countdown Cards Group (Vilvah style 4-pill layout) */}
                <div
                  className="flex items-center gap-1.5 md:gap-2"
                  aria-live="off"
                  aria-label={
                    isMounted
                      ? `Time remaining: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`
                      : "Promotional offer countdown timer"
                  }
                  suppressHydrationWarning
                >
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <div
                      suppressHydrationWarning
                      className="bg-white text-[#9C4B6C] font-bold text-[12px] md:text-[14px] px-1.5 md:px-2 py-0.5 rounded-[6px] min-w-[32px] md:min-w-[36px] text-center shadow-xs leading-none"
                    >
                      {isMounted ? formatDigit(timeLeft.days) : "00"}
                    </div>
                    <span className="text-[7.5px] md:text-[8.5px] font-bold text-white/90 tracking-[0.08em] uppercase mt-0.5">
                      DAYS
                    </span>
                  </div>

                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div
                      suppressHydrationWarning
                      className="bg-white text-[#9C4B6C] font-bold text-[12px] md:text-[14px] px-1.5 md:px-2 py-0.5 rounded-[6px] min-w-[32px] md:min-w-[36px] text-center shadow-xs leading-none"
                    >
                      {isMounted ? formatDigit(timeLeft.hours) : "00"}
                    </div>
                    <span className="text-[7.5px] md:text-[8.5px] font-bold text-white/90 tracking-[0.08em] uppercase mt-0.5">
                      HRS
                    </span>
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div
                      suppressHydrationWarning
                      className="bg-white text-[#9C4B6C] font-bold text-[12px] md:text-[14px] px-1.5 md:px-2 py-0.5 rounded-[6px] min-w-[32px] md:min-w-[36px] text-center shadow-xs leading-none"
                    >
                      {isMounted ? formatDigit(timeLeft.minutes) : "00"}
                    </div>
                    <span className="text-[7.5px] md:text-[8.5px] font-bold text-white/90 tracking-[0.08em] uppercase mt-0.5">
                      MIN
                    </span>
                  </div>

                  {/* Seconds */}
                  <div className="flex flex-col items-center">
                    <div
                      suppressHydrationWarning
                      className="bg-white text-[#9C4B6C] font-bold text-[12px] md:text-[14px] px-1.5 md:px-2 py-0.5 rounded-[6px] min-w-[32px] md:min-w-[36px] text-center shadow-xs leading-none"
                    >
                      {isMounted ? formatDigit(timeLeft.seconds) : "00"}
                    </div>
                    <span className="text-[7.5px] md:text-[8.5px] font-bold text-white/90 tracking-[0.08em] uppercase mt-0.5">
                      SEC
                    </span>
                  </div>
                </div>
              </div>
            </ContentWrapper>
          )}
        </div>
      </div>
    </aside>
  );
}
