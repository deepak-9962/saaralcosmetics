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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

function passwordStrength(p: string): "weak" | "fair" | "strong" {
  if (p.length < 6) return "weak";
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (p.length >= 10 && score >= 3) return "strong";
  if (p.length >= 8 && score >= 2) return "fair";
  return "weak";
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const field = (name: string) => ({
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  const strength = passwordStrength(form.password);

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!EMAIL_RE.test(form.email.trim())) return "Please enter a valid email address.";
    if (form.phone && !PHONE_RE.test(form.phone.trim())) return "Please enter a valid phone number.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (strength === "weak") return "Password is too weak. Add uppercase letters, numbers, or symbols.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!form.acceptTerms) return "Please accept the terms and conditions.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true });
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        // Supabase returns "User already registered" if email exists
        if (signUpError.message.toLowerCase().includes("already")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      // If email confirmation is DISABLED in Supabase Dashboard (recommended),
      // the user is now signed in. Redirect to dashboard.
      // If confirmation is ENABLED, the user is NOT yet signed in and must confirm.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        toast.success("Account created! Welcome to Saaral Cosmetics.");
        router.push("/account/dashboard");
        router.refresh();
      } else {
        // Confirmation email sent
        toast.success("Check your inbox — a confirmation link is on its way.", { duration: 6000 });
        router.push("/account/login?registered=1");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const strengthColor = {
    weak: "bg-error",
    fair: "bg-[#C9A74D]",
    strong: "bg-green-500",
  }[strength];

  const strengthLabel = {
    weak: "Weak",
    fair: "Fair",
    strong: "Strong",
  }[strength];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow flex items-center justify-center px-5 py-12 md:py-16">
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
            {/* Header */}
            <div className="text-center mb-7">
              <Link href="/" className="font-display text-[28px] font-bold text-on-surface tracking-tight">
                Saaral
              </Link>
              <h1 className="mt-2 font-display text-[22px] md:text-[26px] text-on-surface leading-snug">
                Create your account
              </h1>
              <p className="mt-1.5 font-body text-[14px] text-on-surface-variant">
                Join and enjoy a personalized Saaral experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-name" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Priya Sharma"
                  required
                  {...field("fullName")}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {touched.fullName && !form.fullName.trim() && (
                  <p className="text-error text-[12px] font-body">Full name is required.</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  {...field("email")}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {touched.email && !EMAIL_RE.test(form.email) && (
                  <p className="text-error text-[12px] font-body">Enter a valid email address.</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-phone" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Phone Number <span className="text-outline/50 normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  {...field("phone")}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {touched.phone && form.phone && !PHONE_RE.test(form.phone) && (
                  <p className="text-error text-[12px] font-body">Enter a valid phone number.</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-password" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    required
                    {...field("password")}
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
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {["weak", "fair", "strong"].map((level, i) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            ["weak", "fair", "strong"].indexOf(strength) >= i
                              ? strengthColor
                              : "bg-outline-variant/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`font-body text-[11px] font-medium ${
                      strength === "weak" ? "text-error" : strength === "fair" ? "text-[#8A6A00]" : "text-green-600"
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-confirm" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Confirm Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Repeat your password"
                    required
                    {...field("confirmPassword")}
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
                {touched.confirmPassword && form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-error text-[12px] font-body">Passwords do not match.</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="reg-terms"
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => setForm((f) => ({ ...f, acceptTerms: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                />
                <span className="font-body text-[13px] text-on-surface-variant leading-snug">
                  I agree to the{" "}
                  <Link href="/about" className="text-primary underline underline-offset-2">
                    terms and conditions
                  </Link>
                </span>
              </label>

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
                {isLoading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="font-body text-[14px] text-on-surface-variant">
                Already have an account?{" "}
              </span>
              <Link
                href="/account/login"
                className="font-body text-[14px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center font-body text-[11px] uppercase tracking-[0.12em] text-outline/50">
            100% Ayurvedic · Handcrafted in India
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
