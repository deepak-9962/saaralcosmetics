"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import { useCart } from "@/lib/cart";
import { createOrder, getActiveProductIds } from "@/lib/supabase/data";
import { INDIAN_STATES } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, total, clearCart, removeItem } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const validatedRef = useRef(false);

  // Validate cart on mount — remove any items that have since been deactivated
  useEffect(() => {
    if (validatedRef.current || items.length === 0) return;
    validatedRef.current = true;
    const productIds = items.map((i) => i.product_id);
    getActiveProductIds(productIds)
      .then((activeIds) => {
        items.forEach((item) => {
          if (!activeIds.has(item.product_id)) {
            removeItem(item.product_id);
            toast.error(`"${item.name}" is no longer available and was removed.`, { duration: 5000, icon: "🚫" });
          }
        });
      })
      .catch(() => { /* silently ignore network errors */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const isFieldValid = (name: keyof typeof formData) => {
    const value = formData[name].trim();
    if (!value) return false;
    if (name === "phone") return /^[0-9]{10}$/.test(value);
    if (name === "pincode") return /^[0-9]{6}$/.test(value);
    return true;
  };

  const renderInput = ({
    name,
    label,
    type = "text",
    required = false,
    pattern,
  }: {
    name: keyof typeof formData;
    label: string;
    type?: string;
    required?: boolean;
    pattern?: string;
  }) => {
    const valid = required && touched[name] && isFieldValid(name);
    return (
      <div className="floating-label-group">
        <input
          type={type}
          name={name}
          required={required}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=" "
          pattern={pattern}
          className="floating-label-field"
        />
        <label>{label}</label>
        {valid && (
          <span className="material-symbols-outlined text-green-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            check_circle
          </span>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      setIsSubmitting(true);

      // Re-validate all cart items right before placing the order
      const productIds = items.map((i) => i.product_id);
      const activeIds = await getActiveProductIds(productIds);
      const unavailableItems = items.filter((i) => !activeIds.has(i.product_id));

      if (unavailableItems.length > 0) {
        unavailableItems.forEach((item) => {
          removeItem(item.product_id);
          toast.error(`"${item.name}" is no longer available and was removed.`, { duration: 5000, icon: "🚫" });
        });
        setSubmitError("Some items in your cart are no longer available and have been removed. Please review your cart before proceeding.");
        setIsSubmitting(false);
        return;
      }

      const order = await createOrder({
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        customer_email: formData.email.trim() || null,
        address_line1: formData.address1.trim(),
        address_line2: formData.address2.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        items,
        subtotal: total,
        shipping_charge: shippingCharge,
        total: grandTotal,
      });
      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to place order.");
      setIsSubmitting(false);
    }
  };

  const shippingCharge = total >= 500 ? 0 : 50;
  const grandTotal = total + shippingCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <GradientBackground />
        <TopNavBar />
        <main className="flex-grow flex flex-col items-center justify-center gap-6 py-24">
          <span className="material-symbols-outlined text-6xl text-outline-variant">
            shopping_cart
          </span>
          <p className="px-6 text-center font-body text-[16px] md:text-[18px] leading-[1.6] text-on-surface-variant">
            Your cart is empty. Add items before checkout.
          </p>
          <Link
            href="/products"
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-10 md:py-[var(--spacing-stack-lg)]">
        <motion.h1
          className="font-display text-[32px] md:text-[48px] leading-[1.2] text-on-surface mb-[var(--spacing-stack-lg)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-stack-lg)] items-start">
            {/* Form Fields */}
            <motion.div
              className="order-2 lg:order-1 lg:col-span-7 flex flex-col gap-[var(--spacing-stack-md)]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Contact Info */}
              <section className="bg-surface p-5 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow">
                <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-6 pb-4 border-b border-outline-variant/30">
                  Contact Information
                </h2>
                <div className="space-y-5">
                  {renderInput({ name: "name", label: "Full Name *", required: true })}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {renderInput({ name: "phone", label: "Phone Number *", type: "tel", required: true, pattern: "[0-9]{10}" })}
                    {renderInput({ name: "email", label: "Email (Optional)", type: "email" })}
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-surface p-5 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow">
                <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-6 pb-4 border-b border-outline-variant/30">
                  Shipping Address
                </h2>
                <div className="space-y-5">
                  {renderInput({ name: "address1", label: "Address Line 1 *", required: true })}
                  {renderInput({ name: "address2", label: "Address Line 2" })}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {renderInput({ name: "city", label: "City *", required: true })}
                    <div className="floating-label-group">
                        <select
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`floating-label-field appearance-none ${formData.state ? "has-value" : ""}`}
                        >
                          <option value="">Select</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <label>State *</label>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                          expand_more
                        </span>
                        {touched.state && isFieldValid("state") && (
                          <span className="material-symbols-outlined text-green-500 absolute right-11 top-1/2 -translate-y-1/2 pointer-events-none">
                            check_circle
                          </span>
                        )}
                    </div>
                    {renderInput({ name: "pincode", label: "Pincode *", required: true, pattern: "[0-9]{6}" })}
                  </div>
                </div>
              </section>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              className="order-1 lg:order-2 lg:col-span-5 bg-surface-container-low rounded-xl p-5 md:p-8 ambient-shadow-sm border border-outline-variant/20 lg:sticky lg:top-32"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-[22px] md:text-[24px] leading-[1.4] text-on-surface mb-6 pb-4 border-b border-outline-variant/30">
                Order Summary
              </h2>

              {/* Items */}
              <div className="flex flex-col gap-4 mb-6">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-body text-[16px] leading-[1.6] text-on-surface font-medium">
                        {item.name}
                      </p>
                      <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-body text-[16px] leading-[1.6] text-on-surface">
                           {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant/30 pt-4 space-y-2">
                <div className="flex justify-between font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="text-on-surface">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-on-surface">
                    {shippingCharge === 0
                      ? "Free"
                        : formatPrice(shippingCharge)}
                  </span>
                </div>
                <div className="h-px bg-outline-variant/30 w-full my-3" />
                <div className="flex justify-between">
                  <span className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                    Total
                  </span>
                  <span className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                     {formatPrice(grandTotal)}
                   </span>
                 </div>
               </div>

               {submitError && (
                 <p className="mt-4 font-body text-[14px] leading-[1.6] text-error text-center">
                   {submitError}
                 </p>
               )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary text-on-primary font-body text-[16px] md:text-[18px] leading-[1.6] py-4 rounded-xl hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 custom-shadow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">payments</span>
                    Pay Now
                  </>
                )}
              </button>

              <p className="text-center font-body text-[14px] leading-[1.6] text-on-surface-variant mt-4 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  lock
                </span>
                Secured by Razorpay
              </p>
            </motion.div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
