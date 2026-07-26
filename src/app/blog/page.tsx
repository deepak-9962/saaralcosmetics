import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import BlogListingClient from "./BlogListingClient";
import { listBlogCategories, listPublishedBlogPosts } from "@/lib/supabase/blog";

export const metadata: Metadata = {
  title: "Blog & Botanical Secrets | Saaral Cosmetics",
  description:
    "Explore traditional Tamil apothecary secrets, natural skincare guides, ingredient deep-dives, and wellness rituals from Saaral Cosmetics.",
};

export default async function PublicBlogPage() {
  const [categories, initialPosts] = await Promise.all([
    listBlogCategories(),
    listPublishedBlogPosts(),
  ]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-on-background font-body relative overflow-x-hidden">
      <GradientBackground />

      <TopNavBar />

      <main className="flex-1 relative z-10">
        {/* Hero Banner */}
        <section className="relative py-16 md:py-24 border-b border-gold/15 bg-gradient-to-b from-surface-container-low/80 to-transparent">
          <div className="max-w-[1280px] mx-auto px-4 md:px-[72px] text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/25 text-primary text-[12px] font-medium uppercase tracking-[0.15em]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Saaral Journal
            </div>
            <h1 className="font-display text-[34px] sm:text-[44px] md:text-[54px] leading-[1.15] font-bold text-primary max-w-3xl mx-auto">
              Ancient Botanical Wisdom for Modern Skin
            </h1>
            <p className="font-body text-[15px] sm:text-[17px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
              Discover natural ingredient science, Tamil apothecary rituals, and holistic skincare guidance curated by Saaral.
            </p>
          </div>
        </section>

        {/* Client Listing & Filter */}
        <BlogListingClient categories={categories} initialPosts={initialPosts} />
      </main>

      <Footer />
      <WhatsAppFAB />
      <MobileBottomNav />
    </div>
  );
}
