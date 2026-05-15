import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-high w-full border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--spacing-gutter)] px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] max-w-[var(--spacing-container-max)] mx-auto">
        {/* Brand & Copyright */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-display text-[24px] leading-[1.4] text-on-surface mb-2">
              Saaral Cosmetics
            </h3>
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant max-w-sm">
              Elevating daily self-care through pure, natural, and
              heritage-inspired botanical formulations.
            </p>
          </div>
          <div className="mt-8 md:mt-0 opacity-80">
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              © 2024 Saaral Cosmetics. Apothecary Heritage.
            </p>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="col-span-1 flex flex-col gap-4">
          <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface uppercase">
            Explore
          </span>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Terms of Service
          </Link>
        </div>

        {/* Links Column 2 */}
        <div className="col-span-1 flex flex-col gap-4">
          <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface uppercase">
            Customer Care
          </span>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Shipping
          </Link>
          <Link
            href="#"
            className="font-body text-[16px] leading-[1.6] text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Returns
          </Link>
        </div>
      </div>
    </footer>
  );
}
