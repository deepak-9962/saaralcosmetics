"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders, updateOrderStatus } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

const tabs = ["All Orders", "Pending", "Paid", "Shipped"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await listOrders();
        setOrders(data);
        setSelectedOrderId(data[0]?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
      }
    }

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab =
        activeTab === "All Orders"
          ? true
          : activeTab === "Pending"
          ? order.payment_status === "pending" || order.order_status === "new"
          : activeTab === "Paid"
          ? order.payment_status === "paid"
          : order.order_status === "shipped";

      if (!matchesTab) {
        return false;
      }

      const query = searchTerm.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return (
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_phone.toLowerCase().includes(query)
      );
    });
  }, [orders, activeTab, searchTerm]);

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;

  const markAsShipped = async () => {
    if (!selectedOrder) {
      return;
    }

    try {
      await updateOrderStatus(selectedOrder.id, "shipped");
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? { ...order, order_status: "shipped" } : order
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update order.");
    }
  };

  return (
    <div className="flex-grow flex overflow-hidden">
      <div className="flex-grow flex flex-col overflow-y-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-md)] border-r border-outline-variant/30 custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-[32px] leading-[1.3] text-on-background tracking-tight">
            Order Management
          </h2>
          <div className="relative w-full max-w-md hidden md:block ml-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search orders, customers..."
              className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[16px] leading-[1.6] text-on-surface focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container transition-all custom-shadow"
            />
          </div>
        </div>

        {error && <p className="font-body text-[14px] leading-[1.6] text-error mb-4">{error}</p>}

        <div className="flex gap-6 border-b border-outline-variant mb-[var(--spacing-stack-md)] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-body text-[16px] leading-[1.6] whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all custom-shadow ${
                selectedOrder?.id === order.id
                  ? "bg-primary-container/10 border border-primary/20 hover:bg-primary-container/20"
                  : "bg-surface-container-lowest border border-outline-variant/50 hover:shadow-sm"
              }`}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    selectedOrder?.id === order.id
                      ? "bg-surface-container text-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {order.customer_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3
                    className={`font-body text-[18px] leading-[1.6] text-on-surface ${
                      selectedOrder?.id === order.id ? "font-bold" : "font-medium"
                    }`}
                  >
                    {order.order_number}
                  </h3>
                  <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                    {order.customer_name} • {order.items.length} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="font-body text-[18px] leading-[1.6] text-on-surface">
                    {formatPrice(order.total)}
                  </p>
                  <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mt-1">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium bg-surface-container text-on-surface uppercase">
                  {order.order_status}
                </span>
              </div>
            </motion.div>
          ))}
          {filteredOrders.length === 0 && (
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              No orders found.
            </p>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-col w-[400px] xl:w-[500px] bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto custom-scrollbar">
        <div className="p-[var(--spacing-gutter)] border-b border-outline-variant/50 flex items-center justify-between sticky top-0 bg-surface-container-lowest/90 backdrop-blur z-10">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Order Details
          </h2>
        </div>

        {selectedOrder ? (
          <div className="p-[var(--spacing-gutter)] flex flex-col gap-[var(--spacing-stack-md)]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-[36px] leading-[1.2] text-on-background mb-1">
                  {selectedOrder.order_number}
                </h3>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-lg">
                <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                <span className="font-body text-[16px] leading-[1.6] font-medium text-on-surface capitalize">
                  {selectedOrder.order_status}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
              <h4 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-4">
                Customer Information
              </h4>
              <p className="font-body text-[18px] leading-[1.6] text-on-surface font-medium">
                {selectedOrder.customer_name}
              </p>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                {selectedOrder.customer_phone}
              </p>
              {selectedOrder.customer_email && (
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  {selectedOrder.customer_email}
                </p>
              )}
              <div className="h-px bg-outline-variant/30 w-full my-4" />
              <p className="font-body text-[16px] leading-[1.6] text-on-surface whitespace-pre-line">
                {selectedOrder.address_line1}
                {selectedOrder.address_line2 ? `\n${selectedOrder.address_line2}` : ""}
                {`\n${selectedOrder.city}, ${selectedOrder.state} - ${selectedOrder.pincode}`}
              </p>
            </div>

            <div>
              <h4 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-4">
                Order Items
              </h4>
              <div className="flex flex-col gap-4">
                {selectedOrder.items.map((item, i) => (
                  <div key={`${item.product_id}-${i}`} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline-variant">
                        inventory_2
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-body text-[16px] leading-[1.6] text-on-surface font-medium">
                        {item.name}
                      </p>
                      <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                        Qty: {item.qty}
                      </p>
                    </div>
                    <p className="font-body text-[18px] leading-[1.6] text-on-surface">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest border-t border-outline-variant/50 pt-4">
              <div className="flex justify-between mb-2">
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  Subtotal
                </p>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface">
                  {formatPrice(selectedOrder.subtotal)}
                </p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  Shipping
                </p>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface">
                  {formatPrice(selectedOrder.shipping_charge)}
                </p>
              </div>
              <div className="h-px bg-outline-variant/30 w-full my-4" />
              <div className="flex justify-between items-center">
                <p className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                  Total
                </p>
                <p className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                  {formatPrice(selectedOrder.total)}
                </p>
              </div>
              <button
                onClick={markAsShipped}
                className="w-full mt-6 bg-tertiary-container text-on-background font-body text-[18px] leading-[1.6] py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 custom-shadow"
              >
                <span className="material-symbols-outlined">local_shipping</span>
                Mark as Shipped
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Select an order to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
