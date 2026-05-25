import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Promo cards data
───────────────────────────────────────────── */
const promoCards = [
  {
    id: "new-launches",
    title: "New Launches",
    subtitle: "Fresh Rituals",
    href: "/products",
    bg: "linear-gradient(135deg, #E8F0E0 0%, #D4E8C4 100%)",
    accentColor: "#4A6B3A",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="2" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="24" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6.1" y1="6.1" x2="10.3" y2="10.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21.7" y1="21.7" x2="25.9" y2="25.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    productImage: "/images/cat-face-cream.webp",
  },
  {
    id: "bestsellers",
    title: "Best Sellers",
    subtitle: "Most Loved",
    href: "/products",
    bg: "linear-gradient(135deg, #F5E8E0 0%, #EDCFBC 100%)",
    accentColor: "#8B3A5E",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
        <path d="M16 4 L18.5 12 L27 12 L20.5 17 L23 25 L16 20 L9 25 L11.5 17 L5 12 L13.5 12 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    productImage: "/images/cat-face-wash.webp",
  },
  {
    id: "combos",
    title: "Combos Under ₹999",
    subtitle: "Bundle Deals",
    href: "/products",
    bg: "linear-gradient(135deg, #E8E0F0 0%, #D4C8E8 100%)",
    accentColor: "#5A4A7E",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
        <rect x="4" y="10" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10V8a6 6 0 0112 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    productImage: "/images/cat-soap.webp",
  },
  {
    id: "genz",
    title: "Gen Z Favourites",
    subtitle: "Trending Now",
    href: "/products",
    bg: "linear-gradient(135deg, #FBF0D8 0%, #F5E0A8 100%)",
    accentColor: "#7A5A20",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
        <path d="M16 4C10 4 6 8 6 13c0 5 3 8 7 10 1 .5 2 1.5 3 3 1-1.5 2-2.5 3-3 4-2 7-5 7-10 0-5-4-9-10-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    productImage: "/images/cat-nalangu-maavu.webp",
  },
];

/* ─────────────────────────────────────────────
   Single promo card
───────────────────────────────────────────── */
function PromoCard({ card }: { card: (typeof promoCards)[number] }) {
  return (
    <Link
      href={card.href}
      className="relative overflow-hidden flex flex-col justify-between active:scale-[0.97] transition-transform duration-200"
      style={{
        borderRadius: "20px",
        background: card.bg,
        minHeight: "130px",
        padding: "16px 14px 14px",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow:
          "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      {/* Top row: icon + product image */}
      <div className="flex items-start justify-between">
        <div style={{ color: card.accentColor, opacity: 0.75 }}>
          {card.icon}
        </div>
        <div
          className="relative"
          style={{ width: "56px", height: "56px" }}
        >
          <Image
            src={card.productImage}
            alt={card.title}
            fill
            className="object-contain object-center"
            sizes="56px"
          />
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-auto">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: card.accentColor,
            opacity: 0.7,
            marginBottom: "3px",
          }}
        >
          {card.subtitle}
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "#2A1A14",
            letterSpacing: "-0.01em",
          }}
        >
          {card.title}
        </h3>
      </div>

      {/* Decorative blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
          filter: "blur(12px)",
        }}
        aria-hidden="true"
      />
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Main export — mobile only
───────────────────────────────────────────── */
export default function MobilePromoGrid() {
  return (
    <div
      className="block md:hidden w-full px-4 py-5"
      style={{ background: "#FDF6F0" }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#B06080",
          }}
        >
          Explore
        </span>
        <Link
          href="/products"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            fontWeight: 500,
            color: "#8B3A5E",
          }}
        >
          View All
        </Link>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {promoCards.map((card) => (
          <PromoCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
