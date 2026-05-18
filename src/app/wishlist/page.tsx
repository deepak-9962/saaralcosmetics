"use client";

import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistPage() {
  const { items: wishlistItems, itemCount } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-8 md:py-[var(--spacing-stack-lg)] pb-24 md:pb-[var(--spacing-stack-lg)]">
        <section className="flex flex-col gap-4 pt-3 md:pt-8">
          <h1 className="font-display text-[34px] md:text-[48px] leading-[1.15] md:tracking-[-0.01em] text-primary">
            Wishlist
          </h1>
          <p className="font-body text-[16px] md:text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl">
            Save your favorite rituals and return to them anytime. You currently have {itemCount} saved {itemCount === 1 ? "item" : "items"}.
          </p>
        </section>

        {wishlistItems.length === 0 ? (
          <section className="mt-8 md:mt-10 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-10 shadow-[0_10px_30px_rgba(26,26,26,0.04)]">
            <div className="flex flex-col items-center text-center gap-4">
              <span className="material-symbols-outlined text-primary text-[44px]">favorite</span>
              <h2 className="font-display text-[26px] md:text-[32px] leading-[1.2] text-on-surface">
                No saved products yet
              </h2>
              <p className="font-body text-[15px] md:text-[16px] leading-[1.6] text-on-surface-variant max-w-xl">
                Start exploring and tap the heart on product cards to build your wishlist.
              </p>
              <Link
                href="/products"
                className="mt-1 inline-flex items-center justify-center rounded-full bg-primary text-on-primary px-7 py-3 font-body text-[15px] md:text-[16px] font-medium"
              >
                Browse Products
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8 md:mt-10 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-[24px] md:text-[30px] leading-[1.2] text-on-surface">
                Saved Items
              </h2>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-outline-variant px-4 py-2 font-body text-[14px] text-on-surface-variant hover:text-on-surface hover:border-primary/50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {wishlistItems.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
