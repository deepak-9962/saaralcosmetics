"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import { getOrderById } from "@/lib/supabase/data";
import type { Order } from "@/lib/types";

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

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const orderData = await getOrderById(id);
        if (!orderData) {
          setError("Order not found.");
          return;
        }

        setOrder(orderData);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#B06080", "#7E6B9A", "#ffffff"],
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load order.");
      }
    }

    loadOrder();
  }, [id]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow flex items-center justify-center px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)]">
        <motion.div
          className="max-w-lg w-full text-center flex flex-col items-center gap-6"
          variants={container}
          initial="initial"
          animate="animate"
        >
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

          {error ? (
            <motion.p variants={item} className="font-body text-[16px] leading-[1.6] text-error">
              {error}
            </motion.p>
          ) : order ? (
            <>
              <motion.p variants={item} className="font-body text-[18px] leading-[1.6] text-on-surface-variant">
                Thank you for your order. Your order number is:
              </motion.p>

              <motion.div variants={item} className="bg-surface-container-low px-8 py-4 rounded-xl border border-outline-variant/30">
                <span className="font-display text-[32px] leading-[1.3] text-primary font-semibold">
                  {order.order_number}
                </span>
              </motion.div>

              <motion.p variants={item} className="font-body text-[16px] leading-[1.6] text-on-surface-variant max-w-sm">
                We&apos;ll contact you on WhatsApp for shipping updates. You can also
                track your order by chatting with us.
              </motion.p>

              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mt-4">
                <a
                  href={`https://wa.me/919999999999?text=${encodeURIComponent(
                    `Hi, I just placed order #${order.order_number}. Please confirm my order.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-8 py-3 rounded-full font-body text-[16px] leading-[1.6] font-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Chat on WhatsApp
                </a>
                <Link
                  href="/products"
                  className="border border-on-surface text-on-surface px-8 py-3 rounded-full font-body text-[16px] leading-[1.6] font-medium flex items-center justify-center gap-2 hover:bg-on-surface hover:text-surface active:scale-95 transition-all duration-200"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.p variants={item} className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Loading order details...
            </motion.p>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
