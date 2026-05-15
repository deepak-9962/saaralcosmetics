"use client";

import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "919999999999"; // Replace with actual number
const WHATSAPP_MESSAGE = "Hi, I have a question about Saaral Cosmetics";

export default function WhatsAppFAB() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed z-50 bg-[#25D366] text-white rounded-full flex items-center justify-center group"
      style={{
        bottom: "20px",
        right: "16px",
        width: "52px",
        height: "52px",
        boxShadow: "0 4px 16px rgba(37,211,102,0.4)",
        animation: "whatsapp-pulse 2s infinite",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}
      >
        chat
      </span>
      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-[#322f35] text-white font-body px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none"
        style={{ fontSize: "12px", letterSpacing: "0.05em" }}
      >
        Chat with us
      </span>
    </motion.a>
  );
}
