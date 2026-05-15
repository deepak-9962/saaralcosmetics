import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#12100F] text-white/80 w-full border-t border-white/10 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--spacing-gutter)] px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] max-w-[var(--spacing-container-max)] mx-auto">
        {/* Brand & Copyright */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-display text-[28px] leading-[1.3] text-white mb-2">
              Saaral Cosmetics
            </h3>
            <p className="font-body text-[14px] leading-[1.6] text-white/50 max-w-sm">
              Pure. Natural. You. Heritage-inspired botanical formulations for
              mindful daily self-care.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#C9A96E] hover:border-[#C9A96E]/60 transition-colors"
                aria-label="WhatsApp"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#C9A96E] hover:border-[#C9A96E]/60 transition-colors"
                aria-label="Instagram"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </a>
            </div>
          </div>
          <div className="mt-8 md:mt-10 border-t border-white/10 pt-6">
            <p className="font-body text-[12px] leading-[1.6] text-white/30">
              © 2026 Saaral Cosmetics. Apothecary Heritage.
            </p>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="col-span-1 flex flex-col gap-4">
          <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-white uppercase">
            Explore
          </span>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-white/55 hover:text-[#C9A96E] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-white/55 hover:text-[#C9A96E] transition-colors"
          >
            Terms of Service
          </Link>
        </div>

        {/* Links Column 2 */}
        <div className="col-span-1 flex flex-col gap-4">
          <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-white uppercase">
            Customer Care
          </span>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-white/55 hover:text-[#C9A96E] transition-colors"
          >
            Shipping
          </Link>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-white/55 hover:text-[#C9A96E] transition-colors"
          >
            Returns
          </Link>
        </div>
      </div>
    </footer>
  );
}
