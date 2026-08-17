import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import FadeIn from "@/components/layout/FadeIn";

export const metadata: Metadata = {
  title: "About Us — Apothecary Heritage & Modern Rituals | Saaral Cosmetics",
  description:
    "Discover the story of Saaral Cosmetics. Handcrafted luxury botanical skincare rooted in ancient Tamil apothecary wisdom and modern natural science.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#FDF7F2" }}>
      <GradientBackground />

      {/* Atmospheric Ambient Glows */}
      <div
        className="fixed top-20 -left-32 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, #F2D5E0 0%, transparent 70%)" }}
      />
      <div
        className="fixed top-[45%] -right-32 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-25"
        style={{ background: "radial-gradient(circle, #E9E2F8 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-10 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #FFE0A0 0%, transparent 70%)" }}
      />

      {/* Fine grain texture overlay */}
      <div
        className="fixed inset-0 -z-[5] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      <TopNavBar />

      <main className="flex-grow flex flex-col pb-24 md:pb-16 overflow-x-hidden">
        
        {/* ─────────────────────────────────────────────
           1. HERO BRAND STORY SECTION
        ───────────────────────────────────────────── */}
        <section className="relative max-w-[1280px] mx-auto px-4 md:px-16 pt-8 md:pt-20 pb-16 md:pb-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Story Column */}
            <FadeIn
              className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Eyebrow Label with Gold Filigree Accent */}
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-[#C9A74D] to-transparent" />
                <span className="font-body text-[11px] md:text-[12px] uppercase font-semibold tracking-[0.26em] text-[#C9A74D] flex items-center gap-1.5">
                  <span>✦</span> Tamil Apothecary Heritage
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-[#C9A74D] to-transparent" />
              </div>

              {/* Majestic Editorial Heading */}
              <h1
                className="font-display text-[34px] sm:text-[46px] md:text-[58px] leading-[1.12] tracking-[-0.025em]"
                style={{ color: "#1A0E0A" }}
              >
                Apothecary Heritage,
                <br />
                <span
                  className="font-serif italic font-normal bg-gradient-to-r from-[#B06080] via-[#8B3A5E] to-[#C9A74D] bg-clip-text text-transparent"
                >
                  Modern Rituals.
                </span>
              </h1>

              {/* Lead Paragraph */}
              <p
                className="font-body text-[16px] md:text-[19px] leading-[1.75] font-normal"
                style={{ color: "#3A241C" }}
              >
                Born from a deep reverence for centuries-old South Indian botanical mastery,
                <strong className="font-semibold text-[#1A0E0A]"> Saaral Cosmetics</strong> bridges
                the sacred heritage of ancient apothecary remedies with pure, restorative skincare science.
              </p>

              {/* Detailed Story */}
              <p
                className="font-body text-[14px] md:text-[16px] leading-[1.8]"
                style={{ color: "rgba(58,36,28,0.78)" }}
              >
                We believe in the transformative touch of unadulterated nature. Each formulation is
                handcrafted in micro-batches using unrefined cold-pressed oils, sacred botanicals like
                Butterfly Pea (Sangoo Poo) and Vetpalai, antioxidant-rich Red Wine extracts, and traditional
                herbal blends. No sulfates. No artificial parabens. No compromise on purity.
              </p>

              {/* Editorial Quote Box with Gold Accent Line */}
              <div
                className="p-6 md:p-7 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(250,242,235,0.85) 100%)",
                  border: "1.5px solid rgba(201,167,77,0.30)",
                  boxShadow: "0 8px 30px rgba(42,26,20,0.04), 0 1px 0 rgba(255,255,255,0.9) inset",
                }}
              >
                <div
                  className="absolute -top-3 -right-2 text-[72px] font-serif text-[#C9A74D]/15 leading-none select-none pointer-events-none"
                >
                  “
                </div>
                <p
                  className="font-serif italic text-[16px] md:text-[18px] leading-relaxed relative z-10"
                  style={{ color: "#2E1810" }}
                >
                  “Skincare is not an obligation — it is a daily, sacred ceremony to reconnect with the healing energy of the earth.”
                </p>
                <div className="flex items-center gap-2 mt-3 relative z-10">
                  <div className="w-4 h-px bg-[#C9A74D]" />
                  <span className="font-body text-[11px] uppercase tracking-[0.18em] font-semibold text-[#8A6A00]">
                    The Saaral Promise
                  </span>
                </div>
              </div>

              {/* 4 Core Pillars Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { icon: "eco", label: "100% Herbal", color: "#4A7C59" },
                  { icon: "spa", label: "Ancient Rituals", color: "#8B3A5E" },
                  { icon: "verified", label: "Cruelty Free", color: "#C9A74D" },
                  { icon: "auto_awesome", label: "Small Batch", color: "#7E6B9A" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(201,167,77,0.25)",
                      boxShadow: "0 2px 8px rgba(42,26,20,0.03)",
                    }}
                  >
                    <span className="material-symbols-outlined text-[17px]" style={{ color: item.color }}>
                      {item.icon}
                    </span>
                    <span className="font-body text-[12px] font-medium text-[#2A1A14] whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right Image Column with Double Filigree Border */}
            <FadeIn
              className="lg:col-span-5 order-1 lg:order-2 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative mx-auto max-w-[480px] lg:max-w-none">
                {/* Background Ambient Aura */}
                <div
                  className="absolute -inset-5 rounded-3xl blur-2xl pointer-events-none opacity-45"
                  style={{
                    background: "radial-gradient(circle, rgba(176,96,128,0.30) 0%, rgba(201,167,77,0.22) 70%, transparent 100%)",
                  }}
                />

                {/* Outer Luxury Frame */}
                <div
                  className="relative rounded-3xl p-2"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,230,215,0.6) 100%)",
                    border: "1.5px solid rgba(201,167,77,0.40)",
                    boxShadow: "0 25px 50px -12px rgba(42,26,20,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYm5e8wFw8uCH6-vUQeq_660IPZb1B8-AC72bicZ5s2kWSba9lkHGD9ajh9BnhPbsRxGG9yfgMNRpDifOXbbktBxLtOXRIJVGMSBQkhF-8Y0vqYWuEw1bIp8WZ2mLzTSjHWSvqze9WO-I8IjwFdsboJnyrxC0OSm_GnuwMXYqx49N-jPCp5zRhLobl6dvkxNA1xyG04IY08mwCje-jruD29DGfTq_vCIY8gGokT2HDaH1OXDbB5MDsl96bnEbtR4KjbPx96iu0Nkva"
                      alt="Saaral Apothecary Formulations — pure amber glass and botanical extracts"
                      width={640}
                      height={520}
                      priority
                      className="w-full h-[360px] sm:h-[440px] lg:h-[500px] object-cover"
                    />

                    {/* Top Live Badge */}
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-2"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(201,167,77,0.35)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#4A7C59] animate-pulse" />
                      <span className="font-body text-[11px] font-semibold text-[#1A0E0A] tracking-[0.04em]">
                        100% Wildcrafted
                      </span>
                    </div>

                    {/* Glassmorphic Floating Bottom Banner */}
                    <div
                      className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl flex items-center justify-between"
                      style={{
                        background: "rgba(255,252,247,0.92)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(201,167,77,0.30)",
                        boxShadow: "0 10px 30px rgba(42,26,20,0.10)",
                      }}
                    >
                      <div>
                        <span className="font-body text-[10px] uppercase tracking-[0.20em] font-semibold text-[#8B3A5E] block">
                          Handcrafted in Tamil Nadu
                        </span>
                        <span className="font-display text-[15px] sm:text-[16px] font-semibold text-[#1A0E0A]">
                          Pure Botanical Alchemy
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#8B3A5E]/10 flex items-center justify-center text-[#8B3A5E] border border-[#8B3A5E]/20">
                        <span className="material-symbols-outlined text-[22px]">spa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </section>

        {/* ─────────────────────────────────────────────
           2. THREE GUIDING PILLARS SECTION
        ───────────────────────────────────────────── */}
        <section
          className="w-full py-16 md:py-24 border-y relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #FAF1EA 0%, #F5E8DC 100%)",
            borderColor: "rgba(201,167,77,0.22)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 md:px-16 relative z-10">
            
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto mb-14 flex flex-col gap-3">
              <span className="font-body text-[11px] uppercase tracking-[0.24em] font-semibold text-[#C9A74D] flex items-center justify-center gap-2">
                <span>✦</span> Our Guiding Principles <span>✦</span>
              </span>
              <h2
                className="font-display text-[30px] sm:text-[36px] md:text-[42px] leading-[1.18]"
                style={{ color: "#1A0E0A" }}
              >
                The Heart of Our Formulations
              </h2>
              <p
                className="font-body text-[15px] md:text-[16px] leading-relaxed"
                style={{ color: "rgba(42,26,20,0.72)" }}
              >
                Every bar, oil, and cream is crafted under three non-negotiable standards of botanical integrity.
              </p>
            </div>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  num: "01",
                  title: "Cold-Pressed Purity",
                  desc: "We extract our oils without chemical solvents or high-heat destruction. From virgin coconut oil to castor and olive infusions, each ingredient preserves its full cellular vitality.",
                  accent: "#8B3A5E",
                  icon: "water_drop",
                },
                {
                  num: "02",
                  title: "Sacred Herbal Wisdom",
                  desc: "Inspired by millennia of Tamil Siddha and Ayurvedic medicine — including Butterfly Pea (Sangoo Poo), Vetpalai healing leaves, and traditional pre-bath Nalangu Maavu rituals.",
                  accent: "#C9A74D",
                  icon: "nature",
                },
                {
                  num: "03",
                  title: "Conscious Crafting",
                  desc: "Slow, artisanal cold-process curing, ethical cruelty-free sourcing, and zero harmful sulfates. Formulated to fortify your skin barrier and nurture long-term radiance.",
                  accent: "#4A7C59",
                  icon: "all_inclusive",
                },
              ].map((pillar) => (
                <div
                  key={pillar.num}
                  className="p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group relative"
                  style={{
                    background: "#FFFFFF",
                    border: "1.5px solid rgba(201,167,77,0.22)",
                    boxShadow: "0 10px 30px rgba(42,26,20,0.04), 0 1px 0 rgba(255,255,255,0.9) inset",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="font-display text-[32px] font-bold"
                        style={{ color: pillar.accent }}
                      >
                        {pillar.num}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${pillar.accent}14`, color: pillar.accent }}
                      >
                        <span className="material-symbols-outlined text-[20px]">{pillar.icon}</span>
                      </div>
                    </div>

                    <h3
                      className="font-display text-[22px] md:text-[24px] mb-3.5 font-semibold"
                      style={{ color: "#1A0E0A" }}
                    >
                      {pillar.title}
                    </h3>
                    <p
                      className="font-body text-[14px] md:text-[15px] leading-[1.75]"
                      style={{ color: "rgba(42,26,20,0.74)" }}
                    >
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────
           3. LUXURY CONCIERGE & CONNECT SECTION
        ───────────────────────────────────────────── */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-16 pt-16 md:pt-24 pb-12 w-full">
          
          {/* Section Heading */}
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-6 bg-[#C9A74D]" />
              <span className="font-body text-[11px] uppercase tracking-[0.24em] font-semibold text-[#C9A74D]">
                Concierge & Assistance
              </span>
              <div className="h-px w-6 bg-[#C9A74D]" />
            </div>

            <h2 className="font-display text-[32px] sm:text-[40px] text-[#1A0E0A] leading-tight">
              Connect With Our Team
            </h2>
            <p className="font-body text-[15px] text-[#3A241C]/75 leading-relaxed">
              Have questions regarding formulations, bespoke recommendations, or order support?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Big WhatsApp Concierge Card (7 cols) */}
            <div
              className="lg:col-span-7 p-8 md:p-11 rounded-3xl flex flex-col justify-between relative overflow-hidden group"
              style={{
                background: "linear-gradient(145deg, #FFFDFB 0%, #FAF0E6 100%)",
                border: "1.5px solid rgba(201,167,77,0.35)",
                boxShadow: "0 16px 40px rgba(42,26,20,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              {/* Subtle gold watermark glow */}
              <div
                className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
                style={{ background: "radial-gradient(circle, #C9A74D 0%, #B06080 100%)" }}
              />

              <div className="flex flex-col gap-6 relative z-10">
                
                {/* Live Status Badge */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full w-max"
                  style={{
                    background: "rgba(74,124,89,0.10)",
                    border: "1px solid rgba(74,124,89,0.25)",
                  }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
                  </span>
                  <span className="font-body text-[11px] uppercase tracking-[0.14em] font-semibold text-[#3B6647]">
                    Live Concierge Available
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-[26px] sm:text-[32px] text-[#1A0E0A] font-semibold leading-[1.2] mb-3">
                    Chat Directly with Herbal Experts
                  </h3>
                  <p className="font-body text-[15px] md:text-[16px] leading-relaxed text-[#4A3024]/85 max-w-lg">
                    Need help choosing the right ritual for your skin type or have questions about our ingredients?
                    Our formulation concierge team is available to assist you instantly.
                  </p>
                </div>

                {/* Consultation Bullet Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { text: "Skin Consultation", icon: "face" },
                    { text: "Instant Order Help", icon: "local_shipping" },
                    { text: "Wholesale & Gifts", icon: "card_giftcard" },
                  ].map((perk) => (
                    <div
                      key={perk.text}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.75)",
                        border: "1px solid rgba(201,167,77,0.20)",
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#8B3A5E]">{perk.icon}</span>
                      <span className="font-body text-[12px] font-medium text-[#2A1A14]">{perk.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA & Response Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 mt-6 border-t border-[#C9A74D]/20 relative z-10">
                <a
                  href="https://wa.me/918428251423?text=Hi%2C%20I%20have%20a%20question%20about%20Saaral%20Cosmetics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-body text-[15px] font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_8px_25px_rgba(139,58,94,0.28)] group-hover:shadow-[0_12px_32px_rgba(139,58,94,0.36)]"
                  style={{
                    background: "linear-gradient(135deg, #B06080 0%, #8B3A5E 100%)",
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>Start WhatsApp Chat</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </a>

                <div className="flex items-center gap-2 text-[#6A4836] font-body text-[12px]">
                  <span className="material-symbols-outlined text-[16px] text-[#C9A74D]">schedule</span>
                  <span>Typical response: <strong>&lt; 15 mins</strong></span>
                </div>
              </div>
            </div>

            {/* Right Stack Cards (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              
              {/* Email Card */}
              <div
                className="p-7 rounded-3xl flex flex-col justify-between flex-1 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(201,167,77,0.25)",
                  boxShadow: "0 10px 30px rgba(42,26,20,0.03)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(139,58,94,0.08)", border: "1px solid rgba(139,58,94,0.18)" }}
                  >
                    <span className="material-symbols-outlined text-[24px] text-[#8B3A5E]">mail</span>
                  </div>
                  <div>
                    <h4 className="font-display text-[19px] font-semibold text-[#1A0E0A] mb-1">
                      Email Concierge
                    </h4>
                    <p className="font-body text-[13px] leading-relaxed text-[#4A3024]/70 mb-3">
                      For press inquiries, corporate orders, and bespoke requests.
                    </p>
                    <a
                      href="mailto:saaralcosmetics@gmail.com"
                      className="font-body text-[14px] font-semibold text-[#8B3A5E] hover:text-[#C9A74D] transition-colors break-all inline-flex items-center gap-1.5"
                    >
                      <span>saaralcosmetics@gmail.com</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram Card */}
              <div
                className="p-7 rounded-3xl flex flex-col justify-between flex-1 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(201,167,77,0.25)",
                  boxShadow: "0 10px 30px rgba(42,26,20,0.03)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(201,167,77,0.12)", border: "1px solid rgba(201,167,77,0.25)" }}
                  >
                    <span className="material-symbols-outlined text-[24px] text-[#8A6A00]">photo_camera</span>
                  </div>
                  <div>
                    <h4 className="font-display text-[19px] font-semibold text-[#1A0E0A] mb-1">
                      Follow Our Journey
                    </h4>
                    <p className="font-body text-[13px] leading-relaxed text-[#4A3024]/70 mb-3">
                      Behind-the-scenes harvests, formulation secrets, and rituals.
                    </p>
                    <a
                      href="https://www.instagram.com/saaral_cosmetics/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[14px] font-semibold text-[#8B3A5E] hover:text-[#C9A74D] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>@saaral_cosmetics</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Heritage Origin Stamp */}
              <div
                className="p-5 rounded-2xl flex items-center gap-3.5"
                style={{
                  background: "linear-gradient(135deg, rgba(201,167,77,0.10) 0%, rgba(139,58,94,0.06) 100%)",
                  border: "1px dashed rgba(201,167,77,0.35)",
                }}
              >
                <span className="material-symbols-outlined text-[20px] text-[#C9A74D]">location_on</span>
                <p className="font-body text-[12px] text-[#3A241C]/80 leading-tight">
                  Formulated & handcrafted with pride in <strong>Tamil Nadu, India</strong>.
                </p>
              </div>

            </div>

          </div>
        </section>

      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
