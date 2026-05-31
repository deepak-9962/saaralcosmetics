"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "918428251423";
const WHATSAPP_MESSAGE = "Hi! I need help choosing the right Saaral Cosmetics products.";

/* ─────────────────────────────────────────────
   Premium Support Chat FAB
   Bottom-left, above bottom nav bar
   Saaral gradient + glassmorphism + floating animation
   Tooltip: "Need Help Choosing Products?" auto-hides after 4s
───────────────────────────────────────────── */
export default function SupportChatFAB() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  /* Auto-show tooltip after 2.5s, auto-hide after 4s */
  useEffect(() => {
    if (tooltipDismissed) return;
    const showTimer = setTimeout(() => setShowTooltip(true), 2500);
    return () => clearTimeout(showTimer);
  }, [tooltipDismissed]);

  useEffect(() => {
    if (!showTooltip) return;
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
      setTooltipDismissed(true);
    }, 4000);
    return () => clearTimeout(hideTimer);
  }, [showTooltip]);

  /* Hide on admin, checkout, cart, product detail pages */
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-confirmation") ||
    pathname.startsWith("/cart") ||
    /^\/products\/.+/.test(pathname)
  ) {
    return null;
  }

  return (
    <div
      className="fixed z-50"
      style={{
        bottom: "82px", /* Above mobile bottom nav (64px) + gap */
        left: "16px",
      }}
    >
      {/* Tooltip — auto-show/hide */}
      <div
        aria-hidden={!showTooltip}
        style={{
          position: "absolute",
          bottom: "calc(100% + 10px)",
          left: "0",
          background: "rgba(30, 14, 10, 0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#FDF6F0",
          borderRadius: "12px",
          padding: "8px 13px",
          fontFamily: "var(--font-body)",
          fontSize: "11.5px",
          fontWeight: 500,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          border: "1px solid rgba(255,255,255,0.08)",
          pointerEvents: "none",
          opacity: showTooltip ? 1 : 0,
          transform: showTooltip ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        Need Help Choosing Products?
        {/* Tooltip tail */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-6px",
            left: "20px",
            width: "10px",
            height: "6px",
            background: "rgba(30, 14, 10, 0.88)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
      </div>

      {/* FAB button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Need help? Chat with Saaral support on WhatsApp"
        className="flex items-center justify-center rounded-full"
        onClick={() => { setShowTooltip(false); setTooltipDismissed(true); }}
        style={{
          width: "52px",
          height: "52px",
          background: "linear-gradient(135deg, #C47090 0%, #8B3A5E 55%, #6E2E4A 100%)",
          boxShadow:
            "0 6px 24px rgba(139,58,94,0.40), 0 2px 8px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.18) inset",
          animation: "support-fab-float 3s ease-in-out infinite",
          border: "2px solid rgba(255,255,255,0.18)",
          position: "relative",
        }}
      >
        {/* Glassmorphism inner ring */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "3px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.22)",
            pointerEvents: "none",
          }}
        />

        {/* Chat bubble icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H5.17L4 15.17V4h16v10z" />
          <path d="M7 9h10M7 12h6" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none"/>
        </svg>
      </a>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes support-fab-float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-4px) scale(1.02); }
          }
        `,
      }} />
    </div>
  );
}
