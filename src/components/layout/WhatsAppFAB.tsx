"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "918428251423";
const WHATSAPP_MESSAGE = "Hi, I have a question about Saaral Cosmetics";

export default function WhatsAppFAB() {
  const pathname = usePathname();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

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
    <motion.div
      className="fixed z-50 group right-4 bottom-24 md:bottom-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Tooltip — desktop only */}
      <span className="hidden md:block absolute right-16 bottom-2 bg-[#2A1A14] text-[#FDF6F0] shadow-xl rounded-xl px-4 py-2 font-body text-[12px] tracking-[0.04em] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
        Chat with us
      </span>

      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="flex items-center justify-center rounded-full"
        style={{
          width: "48px",
          height: "48px",
          background: "linear-gradient(135deg, #B06080 0%, #8B3A5E 100%)",
          boxShadow: "0 4px 20px rgba(139,58,94,0.35), 0 1px 0 rgba(255,255,255,0.15) inset",
        }}
        whileHover={{ scale: 1.08, boxShadow: "0 6px 28px rgba(139,58,94,0.45), 0 1px 0 rgba(255,255,255,0.2) inset" }}
        whileTap={{ scale: 0.93 }}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
        >
          chat_bubble
        </span>
      </motion.a>
    </motion.div>
  );
}
