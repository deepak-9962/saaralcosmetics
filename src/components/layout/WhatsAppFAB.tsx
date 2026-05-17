"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "918428251423"; // Updated with actual number
const WHATSAPP_MESSAGE = "Hi, I have a question about Saaral Cosmetics";

export default function WhatsAppFAB() {
  const pathname = usePathname();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) {
    return null;
  }

  return (
    <motion.div
      className="fixed z-50 group right-4 bottom-24 md:bottom-5"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
    >
      <span
        className="hidden md:block absolute right-16 bottom-1 bg-white text-[#322f35] shadow-xl rounded-xl px-4 py-2 font-body text-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap"
      >
        Need help? Chat with us!
      </span>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="bg-[#25D366] text-white rounded-full flex items-center justify-center"
        style={{
          width: "52px",
          height: "52px",
          boxShadow: "0 4px 16px rgba(37,211,102,0.4)",
          animation: "whatsapp-pulse 2.5s ease-out infinite",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}
        >
          chat
        </span>
      </motion.a>
    </motion.div>
  );
}
