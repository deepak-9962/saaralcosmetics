import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Promo cards — gradient backgrounds (matching reference)
   2-col grid, 4 cards, botanical decorative accents
───────────────────────────────────────────── */
const promoCards = [
  {
    id: "new-arrivals",
    title: "New\nArrivals",
    href: "/products",
    bgGradient: "linear-gradient(135deg, #F5EDD5 0%, #EDE0BE 60%, #E8D8B0 100%)",
    productImage: "/images/explore-new-launches.avif",
    accentColor: "#8B6A3A",
    arrowBg: "rgba(139,106,58,0.15)",
    arrowColor: "#8B6A3A",
    BotanicalAccent: LeafAccent,
  },
  {
    id: "best-sellers",
    title: "Best\nSellers",
    href: "/products",
    bgGradient: "linear-gradient(135deg, #F8E4EA 0%, #F0D0DA 60%, #ECC8D5 100%)",
    productImage: "/images/explore-best-sellers.avif",
    accentColor: "#8B3A5E",
    arrowBg: "rgba(139,58,94,0.15)",
    arrowColor: "#8B3A5E",
    BotanicalAccent: FlowerAccent,
    hasArrowButton: true,
  },
  {
    id: "combos",
    title: "Combos\nUnder ₹999",
    href: "/products",
    bgGradient: "linear-gradient(135deg, #DFF0E4 0%, #CCE4D4 60%, #BFD8C8 100%)",
    productImage: "/images/explore-limited-edition.avif",
    accentColor: "#2E6640",
    arrowBg: "rgba(46,102,64,0.15)",
    arrowColor: "#2E6640",
    BotanicalAccent: HerbAccent,
  },
  {
    id: "genz",
    title: "Gen Z\nFavourites",
    href: "/products",
    bgGradient: "linear-gradient(135deg, #EAE0F4 0%, #DDD0EE 60%, #D4C8E8 100%)",
    productImage: "/images/explore-summer-skin.avif",
    accentColor: "#5A3A8A",
    arrowBg: "rgba(90,58,138,0.15)",
    arrowColor: "#5A3A8A",
    BotanicalAccent: LavenderAccent,
    hasArrowButton: true,
  },
];

/* ─────────────────────────────────────────────
   Botanical SVG accents
───────────────────────────────────────────── */
function LeafAccent() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="absolute bottom-[-8px] right-[-8px] w-20 h-20 pointer-events-none"
      style={{ opacity: 0.18 }}
      aria-hidden="true"
    >
      <path
        d="M20 70 C 30 55, 40 30, 45 10"
        stroke="#8B6A3A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M38 45 C 55 38, 68 42, 72 52 C 58 60, 40 55, 38 45 Z"
        fill="#8B6A3A"
      />
      <path
        d="M34 28 C 20 22, 8 28, 5 38 C 18 44, 30 36, 34 28 Z"
        fill="#8B6A3A"
      />
    </svg>
  );
}

function FlowerAccent() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="absolute bottom-[-6px] right-[-6px] w-18 h-18 pointer-events-none"
      style={{ opacity: 0.18, width: "72px", height: "72px" }}
      aria-hidden="true"
    >
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <ellipse
          key={i}
          cx={40 + 16 * Math.cos((deg * Math.PI) / 180)}
          cy={40 + 16 * Math.sin((deg * Math.PI) / 180)}
          rx="10"
          ry="6"
          transform={`rotate(${deg} ${40 + 16 * Math.cos((deg * Math.PI) / 180)} ${
            40 + 16 * Math.sin((deg * Math.PI) / 180)
          })`}
          fill="#8B3A5E"
        />
      ))}
      <circle cx="40" cy="40" r="6" fill="#8B3A5E" />
    </svg>
  );
}

function HerbAccent() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="absolute bottom-[-8px] right-[-8px] w-20 h-20 pointer-events-none"
      style={{ opacity: 0.18 }}
      aria-hidden="true"
    >
      <path d="M40 72 L 40 20" stroke="#2E6640" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 50 C 25 44, 14 48, 10 55 C 22 60, 34 55, 38 50 Z" fill="#2E6640" />
      <path d="M42 35 C 55 28, 66 32, 70 40 C 58 44, 46 40, 42 35 Z" fill="#2E6640" />
      <path d="M38 22 C 30 15, 20 18, 16 24 C 26 28, 34 24, 38 22 Z" fill="#2E6640" />
    </svg>
  );
}

function LavenderAccent() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="absolute bottom-[-8px] right-[-8px] w-20 h-20 pointer-events-none"
      style={{ opacity: 0.18 }}
      aria-hidden="true"
    >
      <path d="M40 72 L 40 25" stroke="#5A3A8A" strokeWidth="1.5" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={38 - i * 2} cy={25 + i * 10} rx="5" ry="3.5" fill="#5A3A8A" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={42 + i * 2} cy={28 + i * 10} rx="5" ry="3.5" fill="#5A3A8A" />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Single promo card
───────────────────────────────────────────── */
function PromoCard({ card }: { card: (typeof promoCards)[number] }) {
  const BotanicalAccent = card.BotanicalAccent;
  return (
    <Link
      href={card.href}
      className="group relative overflow-hidden flex flex-col justify-between active:scale-[0.97] transition-all duration-300"
      style={{
        borderRadius: "22px",
        minHeight: "162px",
        background: card.bgGradient,
        padding: "16px 14px 14px",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {/* Botanical decorative accent — bottom right */}
      <BotanicalAccent />

      {/* Product image — upper right */}
      <div
        className="absolute transition-transform duration-500 group-active:scale-105"
        style={{
          right: "6px",
          top: "8px",
          width: "80px",
          height: "90px",
        }}
      >
        <Image
          src={card.productImage}
          alt={card.title.replace("\n", " ")}
          fill
          sizes="80px"
          className="object-contain object-right-top"
          loading="lazy"
          style={{
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.12))",
          }}
        />
      </div>

      {/* Bottom content: title + arrow */}
      <div className="relative z-10 flex flex-col justify-end h-full mt-auto pt-12">
        {/* Collection title */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "#2A1A14",
            whiteSpace: "pre-line",
            marginBottom: "10px",
          }}
        >
          {card.title}
        </h3>

        {/* Arrow CTA */}
        {card.hasArrowButton ? (
          /* Circular arrow button (right-side cards) */
          <div
            className="self-end flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: card.arrowBg,
              border: `1.5px solid ${card.arrowColor}30`,
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M3 7h8M8 4l3 3-3 3"
                stroke={card.arrowColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          /* Text arrow CTA (left-side cards) */
          <div
            className="flex items-center gap-1"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: card.accentColor,
            }}
          >
            Shop Now
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2 5h6M6 2.5L8.5 5 6 7.5"
                stroke={card.arrowColor}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
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
      className="block md:hidden w-full"
      style={{ padding: "14px 16px 24px", background: "#FDF6F0" }}
    >
      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {promoCards.map((card) => (
          <PromoCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
