"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GradientBackground from "@/components/layout/GradientBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Failed to sign in.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        return;
      }

      if (user) {
        router.replace("/admin/dashboard");
      }
    }

    checkSession();
  }, [router]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-[var(--spacing-margin-mobile)]">
      <GradientBackground />
      <motion.div
        className="w-full max-w-md bg-surface p-8 md:p-10 rounded-xl border border-outline-variant/50 custom-shadow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] leading-[1.3] text-primary mb-2">
            Saaral Admin
          </h1>
          <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
            Management Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@saaralcosmetics.com"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline"
            />
          </div>
          <div>
            <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline"
            />
          </div>

          {error && (
            <p className="text-error font-body text-[14px] leading-[1.6]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-body text-[16px] leading-[1.6] font-medium hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
