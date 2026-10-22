"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import GradientBackground from "@/components/layout/GradientBackground";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { useAuth } from "@/lib/auth";

const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone ?? "" });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (form.phone && !PHONE_RE.test(form.phone.trim())) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update profile.");
        setIsSaving(false);
        return;
      }

      await refreshProfile();
      setIsDirty(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Could not save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow w-full max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-8 md:py-14 pb-28 md:pb-14">
        {/* Back */}
        <Link
          href="/account/dashboard"
          className="inline-flex items-center gap-1.5 font-body text-[13px] text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl"
        >
          <h1 className="font-display text-[28px] md:text-[36px] text-on-surface mb-1">
            My Profile
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant mb-8">
            Manage your personal information
          </p>

          {/* Profile card */}
          <div
            className="rounded-2xl border border-outline-variant/30 p-6 md:p-8"
            style={{
              background: "rgba(255,250,247,0.85)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(42,26,20,0.05)",
            }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-7">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="font-display text-primary text-[26px] font-bold">
                  {(form.full_name || user?.email || "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-display text-[18px] font-semibold text-on-surface leading-snug">
                  {form.full_name || "Unnamed Customer"}
                </p>
                <p className="font-body text-[13px] text-on-surface-variant">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-name" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  id="profile-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Email (read-only — managed by Supabase Auth) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
                    disabled
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container/50 px-4 py-3 font-body text-[15px] text-on-surface-variant cursor-not-allowed"
                  />
                  <span
                    className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0"
                    title="Email cannot be changed here"
                  >
                    lock
                  </span>
                </div>
                <p className="font-body text-[11px] text-on-surface-variant/60">
                  Email is managed by your account — contact support to change it.
                </p>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-phone" className="font-body text-[13px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="flex-1 rounded-full bg-primary text-on-primary font-body font-medium text-[15px] py-3 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
                {isDirty && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ full_name: profile?.full_name ?? "", phone: profile?.phone ?? "" });
                      setIsDirty(false);
                    }}
                    className="px-5 rounded-full border border-outline-variant text-on-surface-variant font-body text-[14px] py-3 hover:border-primary/40 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Security section */}
          <div className="mt-6 rounded-2xl border border-outline-variant/30 p-5 md:p-6">
            <h2 className="font-display text-[18px] text-on-surface mb-3">Security</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[14px] text-on-surface">Password</p>
                <p className="font-body text-[12px] text-on-surface-variant">Change your account password</p>
              </div>
              <Link
                href="/account/forgot-password"
                className="font-body text-[13px] text-primary hover:text-primary/80 transition-colors"
              >
                Change →
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <WhatsAppFAB />
      <MobileBottomNav />
      <Footer />
    </div>
  );
}
