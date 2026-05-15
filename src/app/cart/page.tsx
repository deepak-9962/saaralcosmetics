"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import GradientBackground from "@/components/layout/GradientBackground";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)]">
        {/* Header */}
        <div className="mb-[var(--spacing-stack-lg)] flex flex-col md:flex-row justify-between items-start md:items-end gap-[var(--spacing-stack-sm)]">
          <motion.h1
            className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Cart
          </motion.h1>
          <Link
            href="/products"
            className="font-body text-[16px] leading-[1.6] text-on-surface-variant hover:text-on-surface underline underline-offset-4 decoration-outline-variant hover:decoration-on-surface transition-all duration-200"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              shopping_bag
            </span>
            <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant">
              Your cart is empty
            </p>
            <Link
              href="/products"
              className="bg-tertiary-container text-on-tertiary-container font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium px-8 py-3 rounded-full hover:bg-tertiary transition-colors"
            >
              Shop Now
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-stack-lg)] items-start">
            {/* Items List */}
            <div className="lg:col-span-8 flex flex-col gap-[var(--spacing-stack-md)]">
              {/* Column Headers (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-[var(--spacing-gutter)] pb-[var(--spacing-stack-sm)] border-b border-outline-variant/30 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product_id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-gutter)] py-[var(--spacing-stack-md)] border-b border-outline-variant/30 items-center relative"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-6 flex gap-[var(--spacing-gutter)] items-center">
                      <div className="w-24 h-32 flex-shrink-0 bg-surface-container-low rounded-lg overflow-hidden relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-display text-[24px] leading-[1.4] text-on-surface">
                          {item.name}
                        </h3>
                        <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                          {item.variant_name}
                        </p>
                        <span className="md:hidden font-body text-[18px] leading-[1.6] text-on-surface mt-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="md:col-span-3 flex items-center justify-start md:justify-center mt-4 md:mt-0">
                      <div className="flex items-center border border-outline-variant rounded-lg p-1 bg-surface">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-symbols-outlined text-sm">
                            remove
                          </span>
                        </button>
                        <span className="w-8 text-center font-body text-[16px] leading-[1.6]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                          aria-label="Increase quantity"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="hidden md:block md:col-span-2 text-right font-body text-[18px] leading-[1.6] text-on-surface">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove */}
                    <div className="md:col-span-1 flex justify-end md:justify-center absolute md:relative right-0 top-0 mt-[var(--spacing-stack-md)] mr-[var(--spacing-margin-mobile)] md:mt-0 md:mr-0">
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-outline hover:text-error transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-[var(--spacing-stack-md)] ambient-shadow-sm border border-outline-variant/20 sticky top-32">
              <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-md)] pb-[var(--spacing-stack-sm)] border-b border-outline-variant/30">
                Order Summary
              </h2>
              <div className="flex flex-col gap-[var(--spacing-stack-sm)] font-body text-[16px] leading-[1.6] text-on-surface-variant mb-[var(--spacing-stack-md)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-on-surface">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-on-surface">Calculated at next step</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-[var(--spacing-stack-sm)] border-t border-outline-variant/30 mb-[var(--spacing-stack-lg)]">
                <span className="font-body text-[18px] leading-[1.6] text-on-surface">
                  Total
                </span>
                <span className="font-display text-[24px] leading-[1.4] text-on-surface">
                  ${total.toFixed(2)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="w-full py-4 bg-tertiary-container text-on-tertiary-container font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium rounded-lg hover:bg-tertiary-fixed transition-colors duration-200 flex justify-center items-center gap-2"
              >
                Proceed to Checkout
              </Link>
              <div className="mt-[var(--spacing-stack-sm)] text-center">
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    lock
                  </span>
                  Secure Encrypted Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
