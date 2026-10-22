"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  new: "text-[#8A6A00] bg-[#C9A74D]/15 border-[#C9A74D]/30",
  processing: "text-[#7E6B9A] bg-[#E9E2F8] border-[#7E6B9A]/20",
  shipped: "text-[#1a6fa8] bg-blue-50 border-blue-200",
  delivered: "text-green-700 bg-green-50 border-green-200",
  cancelled: "text-error bg-error/5 border-error/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "text-green-700 bg-green-50",
  pending: "text-[#8A6A00] bg-[#C9A74D]/10",
  failed: "text-error bg-error/5",
};

function SkeletonOrder() {
  return (
    <div className="rounded-2xl border border-outline-variant/30 p-5 md:p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 w-32 bg-surface-container rounded-full" />
        <div className="h-5 w-20 bg-surface-container rounded-full" />
      </div>
      <div className="h-4 w-48 bg-surface-container/70 rounded-full mb-2" />
      <div className="h-4 w-24 bg-surface-container/50 rounded-full" />
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items as OrderItem[];

  const statusClass = ORDER_STATUS_COLORS[order.order_status] ?? ORDER_STATUS_COLORS.new;
  const paymentClass = PAYMENT_COLORS[order.payment_status] ?? PAYMENT_COLORS.pending;

  return (
    <div
      className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden"
      style={{ boxShadow: "0 4px 20px rgba(42,26,20,0.04)" }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left p-5 md:p-6 cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-body text-[15px] font-semibold text-on-surface">
                #{order.order_number}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusClass}`}>
                {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${paymentClass}`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
            <p className="font-body text-[12px] text-on-surface-variant">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-[20px] font-bold text-primary">
              {formatPrice(order.total)}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              {expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            </span>
          </div>
        </div>

        {/* Item preview */}
        {!expanded && (
          <p className="mt-2 font-body text-[13px] text-on-surface-variant">
            {items.slice(0, 2).map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""}`).join(", ")}
            {items.length > 2 && ` +${items.length - 2} more`}
          </p>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-outline-variant/20 pt-4">
          {/* Items list */}
          <div className="flex flex-col gap-3 mb-5">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <span className="font-body text-[14px] text-on-surface">
                    {item.name}
                    {item.variant && (
                      <span className="text-on-surface-variant ml-1">({item.variant})</span>
                    )}
                  </span>
                  <span className="font-body text-[12px] text-on-surface-variant">
                    Qty: {item.qty} × {formatPrice(item.price)}
                  </span>
                </div>
                <span className="font-body text-[14px] font-medium text-on-surface shrink-0">
                  {formatPrice(item.qty * item.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-1.5">
            <div className="flex justify-between font-body text-[13px] text-on-surface-variant">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between font-body text-[13px] text-green-700">
                <span>Discount {order.promo_code_snapshot ? `(${order.promo_code_snapshot})` : ""}</span>
                <span>−{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-body text-[13px] text-on-surface-variant">
              <span>Shipping</span>
              <span>{order.shipping_charge === 0 ? "Free" : formatPrice(order.shipping_charge)}</span>
            </div>
            <div className="flex justify-between font-body text-[15px] font-bold text-on-surface border-t border-outline-variant/20 pt-2 mt-1">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping info */}
          <div className="mt-5 rounded-xl border border-outline-variant/20 p-4">
            <p className="font-body text-[12px] uppercase tracking-wider text-on-surface-variant mb-2">
              Shipping Address
            </p>
            <p className="font-body text-[13px] text-on-surface leading-relaxed">
              {order.customer_name}<br />
              {order.address_line1}
              {order.address_line2 && <>, {order.address_line2}</>}<br />
              {order.city}, {order.state} – {order.pincode}
            </p>
          </div>

          {/* Tracking */}
          {order.razorpay_payment_id && (
            <p className="mt-3 font-body text-[11px] text-on-surface-variant">
              Payment ref: {order.razorpay_payment_id}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: fetchError } = await (supabase as any)
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw new Error(fetchError.message);
      setOrders((data ?? []) as Order[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-8 md:py-14 pb-28 md:pb-14">
        <Link
          href="/account/dashboard"
          className="inline-flex items-center gap-1.5 font-body text-[13px] text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-[28px] md:text-[36px] text-on-surface mb-1">
            Order History
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant mb-8">
            Your past purchases with Saaral Cosmetics
          </p>

          {isLoading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((k) => <SkeletonOrder key={k} />)}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
              <p className="font-body text-[14px] text-error mb-3">{error}</p>
              <button
                onClick={loadOrders}
                className="inline-flex items-center gap-1.5 font-body text-[13px] text-primary hover:text-primary/80 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && orders.length === 0 && (
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-10 text-center">
              <span className="material-symbols-outlined text-primary text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                receipt_long
              </span>
              <h2 className="mt-4 font-display text-[24px] text-on-surface">No orders yet</h2>
              <p className="mt-2 font-body text-[14px] text-on-surface-variant max-w-sm mx-auto">
                Orders placed while signed in will appear here.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-on-primary font-body text-[14px] font-medium px-6 py-2.5"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {!isLoading && !error && orders.length > 0 && (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <WhatsAppFAB />
      <MobileBottomNav />
      <Footer />
    </div>
  );
}
