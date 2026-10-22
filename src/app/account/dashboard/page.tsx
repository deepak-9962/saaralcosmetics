"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/account/dashboard", icon: "dashboard" },
  { label: "My Profile", href: "/account/profile", icon: "person" },
  { label: "My Orders", href: "/account/orders", icon: "receipt_long" },
  { label: "Cart", href: "/cart", icon: "shopping_bag" },
  { label: "Wishlist", href: "/wishlist", icon: "favorite" },
];

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6 flex flex-col gap-3 transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5"
      style={{ boxShadow: "0 4px 20px rgba(42,26,20,0.04)" }}
    >
      <span
        className="material-symbols-outlined text-primary text-[28px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <div>
        <p className="font-display text-[26px] md:text-[30px] font-bold text-on-surface leading-none">
          {value}
        </p>
        <p className="mt-1 font-body text-[13px] text-on-surface-variant">{label}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const { itemCount, total } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out. See you soon!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Customer";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-8 md:py-14 pb-28 md:pb-14">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden md:flex flex-col gap-2 w-52 shrink-0">
            <div className="mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-display text-primary text-[22px] font-bold">
                  {displayName[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
              <p className="mt-3 font-display text-[18px] font-semibold text-on-surface leading-snug">{displayName}</p>
              {joinDate && (
                <p className="mt-0.5 font-body text-[12px] text-on-surface-variant">Member since {joinDate}</p>
              )}
            </div>

            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-body text-[14px] text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-150"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-2 flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-body text-[14px] text-error/70 hover:text-error hover:bg-error/5 transition-all duration-150 cursor-pointer disabled:opacity-50 text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              {isSigningOut ? "Signing out…" : "Sign Out"}
            </button>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-body text-[13px] uppercase tracking-[0.1em] text-[#C9A74D]">
                Account Overview
              </p>
              <h1 className="mt-1 font-display text-[32px] md:text-[40px] text-on-surface leading-tight">
                Welcome back, {displayName.split(" ")[0]}
              </h1>
              {user?.email && (
                <p className="mt-1 font-body text-[14px] text-on-surface-variant">{user.email}</p>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              <StatCard label="Items in Cart" value={itemCount} icon="shopping_bag" href="/cart" />
              <StatCard label="Cart Total" value={formatPrice(total)} icon="payments" href="/cart" />
              <StatCard label="Wishlist Items" value={wishlistCount} icon="favorite" href="/wishlist" />
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="mt-8"
            >
              <h2 className="font-display text-[20px] md:text-[24px] text-on-surface mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Edit Profile", href: "/account/profile", icon: "edit", desc: "Update your name, phone and email" },
                  { label: "View Orders", href: "/account/orders", icon: "receipt_long", desc: "Track your past purchases" },
                  { label: "Browse Products", href: "/products", icon: "storefront", desc: "Discover more Saaral rituals" },
                  { label: "Your Wishlist", href: "/wishlist", icon: "favorite", desc: "View your saved products" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary text-[20px]">{action.icon}</span>
                    </div>
                    <div>
                      <p className="font-body text-[14px] font-semibold text-on-surface">{action.label}</p>
                      <p className="font-body text-[12px] text-on-surface-variant">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Mobile sign out */}
            <div className="md:hidden mt-8">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-error/30 text-error font-body text-[14px] py-3 hover:bg-error/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                {isSigningOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppFAB />
      <MobileBottomNav />
      <Footer />
    </div>
  );
}
