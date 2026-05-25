import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import ConfettiTrigger from "@/components/order/ConfettiTrigger";
import FadeIn from "@/components/layout/FadeIn";
import { getOrderById } from "@/lib/supabase/data";

interface Props {
  params: Promise<{ id: string }>;
}

const containerAnimation = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;

  let order = null;
  let error = null;

  try {
    order = await getOrderById(id);
    if (!order) {
      error = "Order not found.";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load order.";
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      {/* Confetti Trigger client-side leaf component */}
      {!error && order && <ConfettiTrigger />}

      <main className="flex-grow flex items-center justify-center px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)]">
        <FadeIn
          className="max-w-lg w-full text-center flex flex-col items-center gap-6"
          variants={containerAnimation}
          initial="initial"
          animate="animate"
        >
          <div className="w-24 h-24 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mb-4">
            <span
              className="material-symbols-outlined text-[#4CAF50] text-5xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              check_circle
            </span>
          </div>

          <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
            Order Confirmed!
          </h1>

          {error ? (
            <p className="font-body text-[16px] leading-[1.6] text-error">
              {error}
            </p>
          ) : order ? (
            <>
              <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant">
                Thank you for your order. Your order number is:
              </p>

              <div className="bg-surface-container-low px-8 py-4 rounded-xl border border-outline-variant/30">
                <span className="font-display text-[32px] leading-[1.3] text-primary font-semibold">
                  {order.order_number}
                </span>
              </div>

              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant max-w-sm">
                We&apos;ll contact you on WhatsApp for shipping updates. You can also
                track your order by chatting with us.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
              </div>
            </>
          ) : (
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Loading order details...
            </p>
          )}
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
