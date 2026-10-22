"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function passwordStrength(p: string): "weak" | "fair" | "strong" {
  if (p.length < 6) return "weak";
  const score = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
  if (p.length >= 10 && score >= 3) return "strong";
  if (p.length >= 8 && score >= 2) return "fair";
  return "weak";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = passwordStrength(password);

  const strengthColor = {
    weak: "bg-error",
    fair: "bg-[#C9A74D]",
    strong: "bg-green-500",
  }[strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (strength === "weak") {
      setError("Password is too weak. Add uppercase letters, numbers, or symbols.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      // The user must have a valid recovery session from the email link
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        if (updateError.message.includes("session")) {
          setError("Your password reset link has expired. Please request a new one.");
        } else {
          setError(updateError.message);
        }
        setIsLoading(false);
        return;
      }

      toast.success("Password updated! You are now signed in.");
      router.push("/account/dashboard");
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
          <div
            className="rounded-3xl border border-outline-variant/30 p-8 md:p-10"
            style={{
              background: "rgba(255,250,247,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px -16px rgba(176,96,128,0.10), 0 8px 24px -8px rgba(0,0,0,0.05)",
            }}
          >
            <div className="text-center mb-7">
              <Link href="/" className="font-display text-[28px] font-bold text-on-surface tracking-tight">
                Saaral
              </Link>
              <h1 className="mt-2 font-display text-[22px] md:text-[26px] text-on-surface leading-snug">
                Choose a new password
              </h1>
              <p className="mt-1.5 font-body text-[14px] text-on-surface-variant">
                Your new password must be at least 8 characters
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-password" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 pr-11 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {["weak", "fair", "strong"].map((level, i) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            ["weak", "fair", "strong"].indexOf(strength) >= i ? strengthColor : "bg-outline-variant/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`font-body text-[11px] font-medium ${
                      strength === "weak" ? "text-error" : strength === "fair" ? "text-[#8A6A00]" : "text-green-600"
                    }`}>
                      {{ weak: "Weak", fair: "Fair", strong: "Strong" }[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-confirm" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 pr-11 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
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
                {isLoading ? "Updating…" : "Update Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/account/forgot-password"
                className="font-body text-[13px] text-on-surface-variant hover:text-primary transition-colors"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
