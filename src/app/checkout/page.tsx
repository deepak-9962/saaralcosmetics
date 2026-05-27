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

  const checkoutMode = process.env.NEXT_PUBLIC_CHECKOUT_MODE || "live";
  const betaPasskey = process.env.NEXT_PUBLIC_CHECKOUT_BETA_PASSKEY || "";

  const [isBetaAuthorized, setIsBetaAuthorized] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("checkout_beta_authorized");
      if (auth === "true") {
        setIsBetaAuthorized(true);
      }
      setIsCheckingAuth(false);
    }
  }, []);

  const handleBetaUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError(null);

    if (passkeyInput.trim() === betaPasskey) {
      localStorage.setItem("checkout_beta_authorized", "true");
      setIsBetaAuthorized(true);
      toast.success("Beta access unlocked! You can now proceed to checkout.", { icon: "🔑" });
    } else {
      setPasskeyError("Invalid passkey. Access restricted.");
      toast.error("Invalid passkey", { icon: "🔒" });
    }
  };

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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (checkoutMode === "disabled") {
      setSubmitError("Online checkout is temporarily paused.");
      return;
    }

    if (checkoutMode === "beta" && !isBetaAuthorized && localStorage.getItem("checkout_beta_authorized") !== "true") {
      setSubmitError("Unauthorized to place beta orders. Please unlock checkout first.");
      return;
    }

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

      // 1. Create Supabase order first
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

      // 2. Dynamically load the Razorpay checkout script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setSubmitError("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 3. Request Razorpay order generation from API route
      const razorpayOrderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: grandTotal,
        }),
      });

      if (!razorpayOrderResponse.ok) {
        const errorData = await razorpayOrderResponse.json();
        throw new Error(errorData.error || "Failed to initiate Razorpay order.");
      }

      const { razorpayOrderId } = await razorpayOrderResponse.json();

      // 4. Trigger the custom-styled Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: grandTotal * 100,
        currency: "INR",
        name: "Saaral Cosmetics",
        description: "Pure. Natural. Luxury Skincare.",
        image: "/images/logo.png",
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            setIsSubmitting(true);
            setSubmitError("Verifying payment...");

            // 5. Send transaction details for cryptographic verification
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verificationResponse.ok) {
              const errorData = await verificationResponse.json();
              throw new Error(errorData.error || "Payment signature verification failed.");
            }

            clearCart();
            toast.success("Payment completed successfully!");
            router.push(`/order-confirmation/${order.id}`);
          } catch (verifyError) {
            setSubmitError(verifyError instanceof Error ? verifyError.message : "Payment verification failed.");
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          contact: formData.phone.trim(),
        },
        theme: {
          color: "#9D4D6E", // Premium brand primary color
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment checkout cancelled.");
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to place order.");
      setIsSubmitting(false);
    }
  };

  const shippingCharge = total >= 999 ? 0 : 50;
  const grandTotal = total + shippingCharge;

  // Tri-state checkout gating UI
  if (checkoutMode === "disabled") {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-between">
        <GradientBackground />
        <TopNavBar />
        <main className="flex-grow flex items-center justify-center py-20 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[580px] bg-surface/80 backdrop-blur-md border border-outline-variant/60 rounded-3xl p-8 md:p-12 custom-shadow flex flex-col items-center text-center gap-6"
          >
            {/* Elegant Luxury-styled Badge/Icon */}
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(157,77,110,0.1)]">
              <span className="material-symbols-outlined text-[36px] text-primary">
                payments
              </span>
            </div>
            <h1 className="font-display text-[28px] md:text-[36px] leading-[1.3] text-on-surface font-semibold tracking-wide">
              Perfecting Your Experience
            </h1>
            <div className="w-12 h-0.5 bg-primary/40 rounded-full" />
            <p className="font-body text-[15px] md:text-[16px] leading-[1.7] text-on-surface-variant max-w-[440px]">
              We are currently integrating our secure, high-end online payment gateway to ensure you receive a flawless checkout experience.
            </p>
            <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant/80 italic">
              Saaral Cosmetics will begin accepting online orders very soon. Thank you for your patience!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
              <Link
                href="/cart"
                className="flex-1 py-3.5 px-6 border border-outline-variant rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-all duration-200 text-center"
              >
                Back to Cart
              </Link>
              <Link
                href="/products"
                className="flex-1 py-3.5 px-6 bg-primary text-on-primary rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200 text-center"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (checkoutMode === "beta" && !isBetaAuthorized) {
    if (isCheckingAuth) {
      return (
        <div className="min-h-[100dvh] flex flex-col justify-between">
          <GradientBackground />
          <TopNavBar />
          <main className="flex-grow flex items-center justify-center">
            <span className="material-symbols-outlined text-[48px] animate-spin text-primary">
              progress_activity
            </span>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-[100dvh] flex flex-col justify-between">
        <GradientBackground />
        <TopNavBar />
        <main className="flex-grow flex items-center justify-center py-20 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[480px] bg-surface/85 backdrop-blur-md border border-outline-variant/60 rounded-3xl p-8 md:p-10 custom-shadow flex flex-col items-center text-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-[28px] text-primary">
                lock
              </span>
            </div>
            <div>
              <h1 className="font-display text-[26px] md:text-[30px] leading-[1.3] text-on-surface font-semibold tracking-wide">
                Private Beta Checkout
              </h1>
              <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant mt-2">
                Checkout is currently in private testing. Please enter your secure passkey to unlock checkout.
              </p>
            </div>

            <form onSubmit={handleBetaUnlock} className="w-full space-y-4">
              <div className="floating-label-group">
                <input
                  type="password"
                  name="passkey"
                  required
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder=" "
                  className="floating-label-field"
                  autoFocus
                />
                <label>Enter Passkey *</label>
              </div>

              {passkeyError && (
                <p className="font-body text-[13px] text-error text-left pl-1">
                  {passkeyError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-primary text-on-primary font-body text-[14px] leading-[1.0] tracking-[0.1em] font-medium rounded-xl hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200 flex justify-center items-center gap-2 custom-shadow"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                Unlock Checkout
              </button>
            </form>

            <Link
              href="/cart"
              className="font-body text-[13px] leading-[1.6] text-on-surface-variant hover:text-on-surface underline underline-offset-4 decoration-outline-variant transition-all duration-200"
            >
              Return to Cart
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

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
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                      Total
                    </span>
                    <span className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                       {formatPrice(grandTotal)}
                     </span>
                  </div>
                  <p className="font-body text-[10px] leading-[1] text-on-surface-variant/60 text-right">
                    (MRP inclusive of taxes)
                  </p>
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
