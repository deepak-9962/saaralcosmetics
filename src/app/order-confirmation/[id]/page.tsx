"use client";

import { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";

const container = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function OrderConfirmationPage() {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C9A96E", "#6750a4", "#ffffff"],
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow flex items-center justify-center px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)]">
        <motion.div
          className="max-w-lg w-full text-center flex flex-col items-center gap-6"
          variants={container}
          initial="initial"
          animate="animate"
        >
          {/* Success Checkmark */}
          <motion.div
            className="w-24 h-24 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.span
              className="material-symbols-outlined text-[#4CAF50] text-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              check_circle
            </motion.span>
          </motion.div>

          <motion.h1 variants={item} className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
            Order Confirmed!
          </motion.h1>
          <motion.p variants={item} className="font-body text-[18px] leading-[1.6] text-on-surface-variant">
            Thank you for your order. Your order number is:
          </motion.p>

          <motion.div variants={item} className="bg-surface-container-low px-8 py-4 rounded-xl border border-outline-variant/30">
            <span className="font-display text-[32px] leading-[1.3] text-primary font-semibold">
              SC-20260001
            </span>
          </motion.div>

          <motion.p variants={item} className="font-body text-[16px] leading-[1.6] text-on-surface-variant max-w-sm">
            We&apos;ll contact you on WhatsApp for shipping updates. You can also
            track your order by chatting with us.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href="https://wa.me/919999999999?text=Hi%2C%20I%20just%20placed%20order%20%23SC-20260001.%20Please%20confirm%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-8 py-3 rounded-full font-body text-[16px] leading-[1.6] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined">chat</span>
              Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="border border-on-surface text-on-surface px-8 py-3 rounded-full font-body text-[16px] leading-[1.6] font-medium flex items-center justify-center gap-2 hover:bg-on-surface hover:text-surface transition-all"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
