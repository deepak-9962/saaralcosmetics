"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect destination after login
  const next = searchParams.get("next") ?? "/account/dashboard";

  // Show any error from the auth callback URL param
  useEffect(() => {
    if (searchParams.get("error") === "auth_callback_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !password) {
      setError("Please enter your email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });

      if (signInError) {
        // Supabase returns "Invalid login credentials" for both wrong email and wrong
        // password — we surface a friendly, intentionally vague message
        setError("Incorrect email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!");
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
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
          {/* Card */}
          <div
            className="rounded-3xl border border-outline-variant/30 p-8 md:p-10"
            style={{
              background: "rgba(255,250,247,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px -16px rgba(176,96,128,0.10), 0 8px 24px -8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="font-display text-[28px] font-bold text-on-surface tracking-tight">
                Saaral
              </Link>
              <h1 className="mt-2 font-display text-[22px] md:text-[26px] text-on-surface leading-snug">
                Sign in to your account
              </h1>
              <p className="mt-1.5 font-body text-[14px] text-on-surface-variant">
                Access your orders, wishlist & saved details
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-password" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 pr-11 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/account/forgot-password"
                    className="font-body text-[12px] text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 font-body text-[13px] text-error"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 w-full rounded-full bg-primary text-on-primary font-body font-medium text-[15px] py-3.5 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-6 text-center">
              <span className="font-body text-[14px] text-on-surface-variant">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/account/register"
                className="font-body text-[14px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Create one
              </Link>
            </div>
          </div>

          {/* Decorative label */}
          <p className="mt-6 text-center font-body text-[11px] uppercase tracking-[0.12em] text-outline/50">
            100% Ayurvedic · Handcrafted in India
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
