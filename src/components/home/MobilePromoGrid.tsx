import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Promo cards data
   Luxury photographic campaign backgrounds
───────────────────────────────────────────── */
const promoCards = [
  {
    id: "new-launches",
    title: "Modern Glow Essentials",
    subtitle: "New Launches",
    href: "/products",
    bgImage: "/images/card1.webp",
    accentColor: "#A97882",
    cta: "Discover Now",
    objectPosition: "right 22%",
  },
  {
    id: "bestsellers",
    title: "Most Loved Skincare",
    subtitle: "Best Sellers",
    href: "/products",
    bgImage: "/images/card2.webp",
    accentColor: "#A97882",
    cta: "Shop Now",
    objectPosition: "right 18%",
  },
  {
    id: "combos",
    title: "Glow Ritual Collection",
    subtitle: "Limited Edition",
    href: "/products",
    bgImage: "/images/card3.webp",
    accentColor: "#A97882",
    cta: "Explore Now",
    objectPosition: "right 12%",
  },
  {
    id: "genz",
    title: "Hydration Essentials",
    subtitle: "Summer Skin",
    href: "/products",
    bgImage: "/images/card4.webp",
    accentColor: "#A97882",
    cta: "Shop Now",
    objectPosition: "right 25%",
  },
];

/* ─────────────────────────────────────────────
   Single promo card
───────────────────────────────────────────── */
function PromoCard({ card }: { card: (typeof promoCards)[number] }) {
  return (
    <Link
      href={card.href}
      className="group relative overflow-hidden flex flex-col justify-between active:scale-[0.98] transition-all duration-300"
      style={{
        borderRadius: "20px",
        minHeight: "165px",
        padding: "20px 14px 14px",
        border: "1px solid rgba(255,255,255,0.45)",
        boxShadow: "0 4px 16px rgba(169, 120, 130, 0.04)",
      }}
    >
      {/* Immersive Background Image (fills entire card) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[20px]">
        <Image
          src={card.bgImage}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: card.objectPosition }}
          sizes="(max-width: 768px) 50vw, 25vw"
          priority
        />
        {/* Soft elegant gradient overlay to ensure text contrast and legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 h-full flex flex-col justify-between flex-grow">
        {/* Top Text Block */}
        <div>
          <span
            className="label-caps block text-[#A97882]"
            style={{
              fontSize: "8.5px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              opacity: 0.85,
            }}
          >
            {card.subtitle}
          </span>
          
          {/* Small horizontal divider line under the subtitle */}
          <div className="w-6 h-[1.2px] bg-[#A97882]/40 my-2" />

          <h3
            className="font-display text-[#2A1A14]"
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
              maxWidth: "58%",
            }}
          >
            {card.title}
          </h3>
        </div>

        {/* Minimal Luxury CTA */}
        <div
          className="mt-6 flex items-center gap-1.5 text-[#A97882] font-body"
          style={{
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {card.cta}
          <span className="material-symbols-outlined text-[12px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Main export — mobile only
───────────────────────────────────────────── */
export default function MobilePromoGrid() {
  return (
    <div
      className="block md:hidden w-full px-4 py-6"
      style={{ background: "#FAF0EE" }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="label-caps text-[#A97882]"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.18em",
          }}
        >
          Explore
        </span>
        <Link
          href="/products"
          className="font-body text-[#A97882] hover:text-[#B06080] transition-colors flex items-center gap-1"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          View All
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
