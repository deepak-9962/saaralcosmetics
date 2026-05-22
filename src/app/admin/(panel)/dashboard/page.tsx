"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders, listAllProductsForAdmin, listCustomers, subscribeToOrders, subscribeToProducts, subscribeToCustomers } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order, Product } from "@/lib/types";
import type { Customer } from "@/lib/supabase/data";

const ORDER_STATUSES: Array<{
  status: Order["order_status"];
  label: string;
  colorClass: string;
}> = [
  { status: "new", label: "New", colorClass: "bg-blue-500" },
  { status: "processing", label: "Processing", colorClass: "bg-yellow-500" },
  { status: "shipped", label: "Shipped", colorClass: "bg-indigo-500" },
  { status: "delivered", label: "Delivered", colorClass: "bg-emerald-500" },
  { status: "cancelled", label: "Cancelled", colorClass: "bg-red-500" },
];

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">Out of Stock</span>;
  if (stock < 10) return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">Low: {stock}</span>;
  return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">{stock} in stock</span>;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function loadAll() {
      try {
        const [o, p, c] = await Promise.all([
          listOrders(),
          listAllProductsForAdmin(),
          listCustomers(),
        ]);
        setOrders(o);
        setProducts(p);
        setCustomers(c);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data.");
      }
    }
    loadAll();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const unsubOrders = subscribeToOrders(
      (newOrder) => {
        setOrders((prev) => [newOrder, ...prev]);
        setIsLive(true);
      },
      (updatedOrder) => {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    );
    const unsubProducts = subscribeToProducts(() => {
      listAllProductsForAdmin().then(setProducts).catch(console.error);
    });
    const unsubCustomers = subscribeToCustomers(() => {
      listCustomers().then(setCustomers).catch(console.error);
    });

    // Mark as live once subscriptions attached
    setTimeout(() => setIsLive(true), 1000);

    return () => { unsubOrders(); unsubProducts(); unsubCustomers(); };
  }, []);

  const stats = useMemo(() => {
    const todayKey = getDateKey(new Date());
    const todayOrdersList = orders.filter((o) => getDateKey(new Date(o.created_at)) === todayKey);
    const paidOrders = orders.filter((o) => o.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrdersList.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter((o) => o.order_status === "new" || o.order_status === "processing").length;
    const deliveredOrders = orders.filter((o) => o.order_status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.order_status === "cancelled").length;
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const paymentSuccessRate = orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0;
    const lowStockProducts = products.filter((p) => p.stock < 10 && p.is_active);
    const totalCustomers = customers.length;
    const returningCustomers = customers.filter((c) => c.order_count > 1).length;

    return {
      totalOrders: orders.length,
      todayOrders: todayOrdersList.length,
      totalRevenue,
      todayRevenue,
      avgOrderValue,
      paymentSuccessRate,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      totalCustomers,
      returningCustomers,
    };
  }, [orders, products, customers]);

  const statusBreakdown = useMemo(() => {
    const total = orders.length;
    return ORDER_STATUSES.map(({ status, label, colorClass }) => {
      const count = orders.filter((o) => o.order_status === status).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { status, label, colorClass, count, pct };
    });
  }, [orders]);

  const revenueByState = useMemo(() => {
    const revenueMap = new Map<string, number>();
    orders.forEach((o) => {
      if (o.payment_status !== "paid") return;
      revenueMap.set(o.state, (revenueMap.get(o.state) ?? 0) + o.total);
    });
    return Array.from(revenueMap.entries())
      .map(([state, revenue]) => ({ state, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  const maxRevenue = revenueByState[0]?.revenue ?? 0;

  const bestSellingProducts = useMemo(() => {
    const productMap = new Map<string, { productId: string; name: string; unitsSold: number; revenue: number }>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = productMap.get(item.product_id);
        productMap.set(item.product_id, {
          productId: item.product_id,
          name: item.name,
          unitsSold: (existing?.unitsSold ?? 0) + item.qty,
          revenue: (existing?.revenue ?? 0) + item.price * item.qty,
        });
      });
    });
    return Array.from(productMap.values()).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  }, [orders]);

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders.toString(), subtitle: `${stats.todayOrders} today`, icon: "all_inbox" },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), subtitle: `${formatPrice(stats.todayRevenue)} today`, icon: "payments" },
    { label: "Avg Order Value", value: formatPrice(stats.avgOrderValue), subtitle: "from paid orders", icon: "trending_up" },
    { label: "Payment Success", value: `${stats.paymentSuccessRate}%`, subtitle: "orders paid", icon: "verified" },
    { label: "Pending / Processing", value: stats.pendingOrders.toString(), subtitle: "needs attention", icon: "pending_actions" },
    { label: "Delivered", value: stats.deliveredOrders.toString(), subtitle: "fulfilled orders", icon: "inventory_2" },
    { label: "Total Customers", value: stats.totalCustomers.toString(), subtitle: `${stats.returningCustomers} returning`, icon: "group" },
    { label: "Today's Orders", value: stats.todayOrders.toString(), subtitle: new Date().toLocaleDateString("en-IN"), icon: "local_mall" },
  ];

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)] overflow-y-auto custom-scrollbar">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
              Dashboard Overview
            </h1>
            <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2">
              Live analytics across orders, payments, and fulfillment.
            </p>
          </div>
          {/* Live status badge */}
          <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-body font-medium ${
            isLive
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-outline-variant bg-surface-container text-on-surface-variant"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-outline"}`} />
            {isLive ? "Live" : "Connecting..."}
          </div>
        </div>
      </motion.header>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error border border-red-200 bg-red-50 rounded-lg p-3">{error}</p>}

      {/* Stat Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-gutter)]">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                {card.label}
              </p>
              <span className="material-symbols-outlined text-primary text-[20px]">{card.icon}</span>
            </div>
            <p className="font-display text-[28px] leading-[1.2] text-on-surface">{card.value}</p>
            <p className="font-body text-[12px] leading-[1.4] text-on-surface-variant mt-1">{card.subtitle}</p>
          </motion.div>
        ))}
      </section>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <motion.section
          className="bg-amber-50 border border-amber-200 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <h2 className="font-body text-[14px] leading-[1.0] tracking-[0.08em] font-medium text-amber-800 uppercase">
              Low Stock Alert — {stats.lowStockProducts.length} product{stats.lowStockProducts.length > 1 ? "s" : ""}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockProducts.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}/edit`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:border-amber-400 transition-colors"
              >
                <span className="font-body text-[13px] text-on-surface font-medium">{p.name}</span>
                <StockBadge stock={p.stock} />
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--spacing-gutter)]">
        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-4">Orders by Status</h2>
          <div className="space-y-4">
            {statusBreakdown.map(({ status, label, colorClass, count, pct }) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-body text-[14px] leading-[1.6] text-on-surface">{label}</p>
                  <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">{count} ({pct}%)</p>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-4">Revenue by State</h2>
          {revenueByState.length === 0 ? (
            <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">No paid orders yet.</p>
          ) : (
            <div className="space-y-4">
              {revenueByState.map(({ state, revenue }) => {
                const widthPct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={state}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-body text-[14px] leading-[1.6] text-on-surface">{state}</p>
                      <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">{formatPrice(revenue)}</p>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-tertiary-container"
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>

      {/* Best Sellers */}
      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6 border-b border-outline-variant/50">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Best-Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
              <tr>
                <th className="p-4 font-normal text-left">#</th>
                <th className="p-4 font-normal text-left">Product</th>
                <th className="p-4 font-normal text-left">Units Sold</th>
                <th className="p-4 font-normal text-left">Revenue</th>
              </tr>
            </thead>
            <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {bestSellingProducts.length === 0 && (
                <tr><td className="p-4 text-on-surface-variant" colSpan={4}>No order data yet.</td></tr>
              )}
              {bestSellingProducts.map((product, index) => (
                <tr key={product.productId} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-on-surface-variant">#{index + 1}</td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.unitsSold}</td>
                  <td className="p-4">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Recent Orders */}
      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Recent Orders</h2>
          <Link href="/admin/orders" className="font-body text-[14px] leading-[1.6] text-primary hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
              <tr>
                <th className="p-4 font-normal text-left">Order #</th>
                <th className="p-4 font-normal text-left">Customer</th>
                <th className="p-4 font-normal text-left">Date</th>
                <th className="p-4 font-normal text-left">Total</th>
                <th className="p-4 font-normal text-left">Payment</th>
                <th className="p-4 font-normal text-left">Status</th>
              </tr>
            </thead>
            <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {recentOrders.length === 0 && (
                <tr><td className="p-4 text-on-surface-variant" colSpan={6}>No orders yet.</td></tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4 text-on-surface-variant">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase ${
                      order.payment_status === "paid" ? "bg-emerald-100 text-emerald-800"
                      : order.payment_status === "failed" ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
