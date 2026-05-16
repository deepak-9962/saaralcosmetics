import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #140808 0%, #1E0D10 50%, #120815 100%)" }}>

      {/* Atmospheric glows */}
      <div className="absolute top-0 left-0 w-[400px] h-[300px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #B06080 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[350px] h-[300px] rounded-full blur-[100px] opacity-8 pointer-events-none" style={{ background: "radial-gradient(circle, #7E6B9A 0%, transparent 70%)" }} />

      {/* Newsletter band */}
      <div className="relative border-b border-white/8">
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-10 flex flex-col md:flex-row items-center gap-5 justify-between">
          <div>
            <span className="label-caps text-[#C9A74D] block mb-1">Stay Connected</span>
            <p className="font-display text-white text-[22px] leading-tight">Rituals, in your inbox.</p>
          </div>
          <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-64 bg-white/6 border border-white/15 rounded-full px-5 py-2.5 font-body text-[14px] text-white/80 placeholder:text-white/35 focus:outline-none focus:border-[#B06080]/50"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full font-body text-[12px] tracking-[0.15em] uppercase font-semibold transition-all hover:opacity-90"
              style={{ background: "#B06080", color: "#fff" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="font-display text-white text-[28px] leading-tight mb-3">Saaral Cosmetics</h3>
          <p className="font-body text-white/45 text-[14px] leading-relaxed max-w-sm mb-6">
            Pure. Natural. You. Heritage-inspired botanical formulations for mindful daily self-care. Crafted with love in Tamil Nadu, India.
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#C9A74D] text-[18px]">location_on</span>
            <span className="font-body text-white/40 text-[13px]">Made in Tamil Nadu, India 🇮🇳</span>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#C9A74D] text-[18px]">eco</span>
            <span className="font-body text-white/40 text-[13px]">100% Natural · Cruelty Free · Sustainable</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/50 hover:text-[#B06080] hover:border-[#B06080]/40 transition-all"
              aria-label="WhatsApp"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/50 hover:text-[#B06080] hover:border-[#B06080]/40 transition-all"
              aria-label="Instagram"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-3">
          <span className="label-caps text-white/60 mb-1">Explore</span>
          {[
            { label: "Shop All", href: "/products" },
            { label: "Face Cream", href: "/products?category=face-cream" },
            { label: "Face Wash", href: "/products?category=face-wash" },
            { label: "Soap", href: "/products?category=soap" },
            { label: "Nalangu Maavu", href: "/products?category=nalangu-maavu" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="font-body text-[15px] text-white/45 hover:text-[#B06080] transition-colors">{l.label}</Link>
          ))}
        </div>

        {/* Customer Care */}
        <div className="flex flex-col gap-3">
          <span className="label-caps text-white/60 mb-1">Customer Care</span>
          {[
            { label: "Shipping Policy", href: "#" },
            { label: "Returns & Exchanges", href: "#" },
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "Contact Us", href: "/contact" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="font-body text-[15px] text-white/45 hover:text-[#B06080] transition-colors">{l.label}</Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-body text-white/25 text-[12px]">© 2026 Saaral Cosmetics. All rights reserved.</p>
          <p className="font-body text-white/20 text-[12px] italic">Ancient Wisdom. Modern Ritual.</p>
        </div>
      </div>
    </footer>
  );
}
