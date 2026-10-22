"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        }
      );

      if (resetError) {
        // We still show the success screen regardless — avoids account enumeration
        console.error("[forgot-password] reset error:", resetError.message);
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow flex items-center justify-center px-5 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-3xl border border-outline-variant/30 p-8 md:p-10"
            style={{
              background: "rgba(255,250,247,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px -16px rgba(176,96,128,0.10), 0 8px 24px -8px rgba(0,0,0,0.05)",
            }}
          >
            {sent ? (
              // Success state
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_read
                </span>
                <h1 className="mt-4 font-display text-[22px] md:text-[26px] text-on-surface">
                  Check your inbox
                </h1>
                <p className="mt-3 font-body text-[14px] text-on-surface-variant leading-relaxed">
                  If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
                  Check your spam folder if you don&apos;t see it within a few minutes.
                </p>
                <Link
                  href="/account/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-outline-variant px-5 py-2.5 font-body text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <Link href="/" className="font-display text-[28px] font-bold text-on-surface tracking-tight">
                    Saaral
                  </Link>
                  <h1 className="mt-2 font-display text-[22px] md:text-[26px] text-on-surface leading-snug">
                    Reset your password
                  </h1>
                  <p className="mt-1.5 font-body text-[14px] text-on-surface-variant">
                    Enter your email and we&apos;ll send a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="forgot-email" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 font-body text-[13px] text-error"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-1 w-full rounded-full bg-primary text-on-primary font-body font-medium text-[15px] py-3.5 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/account/login"
                    className="inline-flex items-center gap-1.5 font-body text-[14px] text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
