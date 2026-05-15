"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await listOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data.");
      }
    }

    loadOrders();
  }, []);

  const todayStats = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    const todayOrders = orders.filter((order) => {
      const createdDate = new Date(order.created_at);
      const orderKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
      return orderKey === todayKey;
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(
      (order) => order.order_status === "new" || order.order_status === "processing"
    ).length;

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      pendingOrders,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)]">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
          Dashboard Overview
        </h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2 max-w-2xl">
          Live metrics from your Supabase orders data.
        </p>
      </motion.header>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error">{error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-gutter)]">
        {[
          { label: "Total Orders", value: todayStats.totalOrders.toString(), icon: "all_inbox" },
          { label: "Today's Orders", value: todayStats.todayOrders.toString(), icon: "local_mall" },
          { label: "Total Revenue", value: formatPrice(todayStats.totalRevenue), icon: "payments" },
          { label: "Pending Orders", value: todayStats.pendingOrders.toString(), icon: "pending_actions" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-surface-container-lowest border rounded-xl p-6 border-outline-variant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                {stat.label}
              </h3>
              <span className="material-symbols-outlined text-primary">{stat.icon}</span>
            </div>
            <p className="font-display text-[32px] leading-[1.3] text-on-surface">{stat.value}</p>
          </motion.div>
        ))}
      </section>

      <motion.section
        className="bg-surface-container-lowest border rounded-xl overflow-hidden flex flex-col border-outline-variant"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b border-outline-variant/50">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              <tr>
                <th className="p-4 font-normal">Order #</th>
                <th className="p-4 font-normal">Customer</th>
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Total</th>
                <th className="p-4 font-normal">Payment</th>
                <th className="p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="font-body text-[16px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4 text-on-surface-variant">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container text-on-surface font-body text-[10px] tracking-[0.1em] font-medium uppercase">
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-[10px] tracking-[0.1em] font-medium uppercase">
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td className="p-4 text-on-surface-variant" colSpan={6}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
