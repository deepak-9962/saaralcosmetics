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

        {/* WhatsApp icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M19.001 4.908A9.817 9.817 0 0 0 12.004 2c-5.402 0-9.799 4.397-9.802 9.8a9.76 9.76 0 0 0 1.311 4.921L2 22l5.421-1.422a9.774 9.774 0 0 0 4.58 1.155h.004c5.4 0 9.8-4.396 9.803-9.799a9.756 9.756 0 0 0 -2.807-7.026zm-6.997 15.393h-.003c-1.63 0-3.232-.438-4.634-1.265l-.332-.197-3.446.904.92-3.36-.216-.344a8.136 8.136 0 0 1 -1.248-4.24c.003-4.49 3.655-8.14 8.148-8.14a8.106 8.106 0 0 1 5.759 2.385a8.118 8.118 0 0 1 2.383 5.763c-.003 4.49-3.655 8.142-8.14 8.142zm4.463-6.096c-.244-.122-1.446-.713-1.67-.795-.224-.082-.387-.122-.55.122-.163.245-.632.795-.775.958-.143.163-.285.183-.529.061-.244-.122-1.03-.38-1.962-1.212-.724-.646-1.213-1.444-1.355-1.689-.143-.244-.015-.376.107-.497.11-.11.244-.286.367-.428.122-.143.163-.245.244-.408.082-.163.041-.306-.02-.428-.061-.122-.55-1.326-.753-1.815-.198-.479-.4-.413-.55-.42-.143-.008-.306-.008-.469-.008-.163 0-.428.061-.652.306-.224.245-.856.836-.856 2.039 0 1.203.876 2.366 1.00 2.529.121.163 1.722 2.63 4.17 3.687.583.25 1.038.4 1.393.513.586.186 1.119.16 1.54.098.47-.069 1.446-.59 1.65-.733.204-.143.204-.57.204-1.06.143-1.142-.061-.082-.224-.122-.469-.244z" />
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
