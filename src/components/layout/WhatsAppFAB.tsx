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
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M19.001 4.908A9.817 9.817 0 0 0 12.004 2c-5.402 0-9.799 4.397-9.802 9.8a9.76 9.76 0 0 0 1.311 4.921L2 22l5.421-1.422a9.774 9.774 0 0 0 4.58 1.155h.004c5.4 0 9.8-4.396 9.803-9.799a9.756 9.756 0 0 0 -2.807-7.026zm-6.997 15.393h-.003c-1.63 0-3.232-.438-4.634-1.265l-.332-.197-3.446.904.92-3.36-.216-.344a8.136 8.136 0 0 1 -1.248-4.24c.003-4.49 3.655-8.14 8.148-8.14a8.106 8.106 0 0 1 5.759 2.385a8.118 8.118 0 0 1 2.383 5.763c-.003 4.49-3.655 8.142-8.14 8.142zm4.463-6.096c-.244-.122-1.446-.713-1.67-.795-.224-.082-.387-.122-.55.122-.163.245-.632.795-.775.958-.143.163-.285.183-.529.061-.244-.122-1.03-.38-1.962-1.212-.724-.646-1.213-1.444-1.355-1.689-.143-.244-.015-.376.107-.497.11-.11.244-.286.367-.428.122-.143.163-.245.244-.408.082-.163.041-.306-.02-.428-.061-.122-.55-1.326-.753-1.815-.198-.479-.4-.413-.55-.42-.143-.008-.306-.008-.469-.008-.163 0-.428.061-.652.306-.224.245-.856.836-.856 2.039 0 1.203.876 2.366 1.00 2.529.121.163 1.722 2.63 4.17 3.687.583.25 1.038.4 1.393.513.586.186 1.119.16 1.54.098.47-.069 1.446-.59 1.65-.733.204-.143.204-.57.204-1.06.143-1.142-.061-.082-.224-.122-.469-.244z" />
        </svg>
      </motion.a>
    </motion.div>
  );
}
