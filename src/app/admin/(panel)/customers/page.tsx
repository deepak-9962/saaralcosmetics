"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { listCustomers, subscribeToCustomers } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Customer } from "@/lib/supabase/data";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await listCustomers();
        setCustomers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load customers.");
      } finally {
        setIsLoading(false);
      }
    }
    load();

    const unsub = subscribeToCustomers(() => {
      listCustomers().then(setCustomers).catch(console.error);
    });
    return unsub;
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.phone.includes(q) ||
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalRevenue = useMemo(() => customers.reduce((s, c) => s + c.total_spent, 0), [customers]);
  const returningCount = useMemo(() => customers.filter((c) => c.order_count > 1).length, [customers]);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-md)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">Customers</h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-1">
          All customers identified by phone number at checkout.
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Total Customers", value: customers.length.toString(), icon: "group" },
          { label: "Returning", value: returningCount.toString(), icon: "repeat" },
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: "payments" },
          {
            label: "Avg Spend / Customer",
            value: customers.length > 0 ? formatPrice(totalRevenue / customers.length) : "—",
            icon: "trending_up",
          },
        ].map((card) => (
          <div key={card.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                {card.label}
              </p>
              <span className="material-symbols-outlined text-primary text-[18px]">{card.icon}</span>
            </div>
            <p className="font-display text-[26px] leading-[1.2] text-on-surface">{card.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all"
        />
      </div>

      {error && <p className="font-body text-[14px] text-error border border-red-200 bg-red-50 rounded-lg p-3">{error}</p>}

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          <p className="font-body text-[14px] text-on-surface-variant">Loading customers...</p>
        </div>
      ) : (
        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                <tr>
                  <th className="p-4 font-normal">Customer</th>
                  <th className="p-4 font-normal">Phone</th>
                  <th className="p-4 font-normal">Orders</th>
                  <th className="p-4 font-normal">Total Spent</th>
                  <th className="p-4 font-normal">Last Order</th>
                  <th className="p-4 font-normal">Joined</th>
                </tr>
              </thead>
              <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td className="p-6 text-on-surface-variant" colSpan={6}>
                      {searchQuery ? "No customers match your search." : "No customers yet — they appear automatically when orders are placed."}
                    </td>
                  </tr>
                )}
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
                    <td className="p-4">
                      <Link href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-body text-[13px] font-medium flex-shrink-0">
                          {(customer.name ?? customer.phone).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[14px] group-hover:text-primary transition-colors">
                            {customer.name ?? "—"}
                          </p>
                          {customer.email && (
                            <p className="text-[12px] text-on-surface-variant">{customer.email}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <a
                        href={`https://wa.me/91${customer.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[14px] text-on-surface hover:text-emerald-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {customer.phone}
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">chat</span>
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${
                        customer.order_count > 1
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {customer.order_count} {customer.order_count === 1 ? "order" : "orders"}
                        {customer.order_count > 1 && " ✦"}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{formatPrice(customer.total_spent)}</td>
                    <td className="p-4 text-on-surface-variant text-[13px]">
                      {new Date(customer.last_seen_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-on-surface-variant text-[13px]">
                      {new Date(customer.first_seen_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}
    </div>
  );
}
