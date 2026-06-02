import Link from "next/link";

/* ─────────────────────────────────────────────
   Promo cards — reference layout (Image 1)
   2-col grid, 4 cards, product image bleeds
   upward/left out of card, text bottom-right
───────────────────────────────────────────── */
const promoCards = [
  {
    id: "new-arrivals",
    title: "New\nLaunches",
    href: "/products",
    bg: "#F0E8CC",
    productImage: "/images/explore-new-launches.avif",
    accentColor: "#8B6A3A",
    BotanicalAccent: LeafAccent,
    hasArrowButton: false,
  },
  {
    id: "best-sellers",
    title: "BestSellers\nUnder 499",
    href: "/products",
    bg: "#F5E0E8",
    productImage: "/images/explore-best-sellers.avif",
    accentColor: "#8B3A5E",
    BotanicalAccent: FlowerAccent,
    hasArrowButton: true,
  },
  {
    id: "combos",
    title: "Combos\nUnder 999",
    href: "/products",
    bg: "#D8EDE0",
    productImage: "/images/explore-limited-edition.avif",
    accentColor: "#2E6640",
    BotanicalAccent: HerbAccent,
    hasArrowButton: false,
  },
  {
    id: "genz",
    title: "Gen Z\nFavourites",
    href: "/products",
    bg: "#E4DAEF",
    productImage: "/images/explore-summer-skin.avif",
    accentColor: "#5A3A8A",
    BotanicalAccent: LavenderAccent,
    hasArrowButton: true,
  },
];

/* ─────────────────────────────────────────────
   Botanical SVG accents — bottom-right corner
───────────────────────────────────────────── */
function LeafAccent() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "-6px",
        right: "-6px",
        width: "70px",
        height: "70px",
        opacity: 0.22,
        pointerEvents: "none",
      }}
    >
      <path d="M20 70 C 30 55, 40 30, 45 10" stroke="#8B6A3A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 45 C 55 38, 68 42, 72 52 C 58 60, 40 55, 38 45 Z" fill="#8B6A3A" />
      <path d="M34 28 C 20 22, 8 28, 5 38 C 18 44, 30 36, 34 28 Z" fill="#8B6A3A" />
    </svg>
  );
}

function FlowerAccent() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "-6px",
        right: "-6px",
        width: "68px",
        height: "68px",
        opacity: 0.22,
        pointerEvents: "none",
      }}
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
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "-6px",
        right: "-6px",
        width: "70px",
        height: "70px",
        opacity: 0.22,
        pointerEvents: "none",
      }}
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
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "-6px",
        right: "-6px",
        width: "70px",
        height: "70px",
        opacity: 0.22,
        pointerEvents: "none",
      }}
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

function PromoCard({ card }: { card: (typeof promoCards)[number] }) {
  const BotanicalAccent = card.BotanicalAccent;
  return (
    <Link
      href={card.href}
      className="group active:scale-[0.97] transition-transform duration-200"
      style={{
        display: "block",
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        minHeight: "80px",
        background: card.bg,
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "0 3px 14px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.85) inset",
      }}
    >
      {/* Clip decorative SVG background to the card boundary */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: "20px",
          pointerEvents: "none",
        }}
      >
        <BotanicalAccent />
      </div>

      {/* Text area — left-aligned, vertically centered */}
      <div
        style={{
          position: "absolute",
          left: "18px",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "#2A1A14",
            whiteSpace: "pre-line",
          }}
        >
          {card.title}
        </h3>
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
      style={{ padding: "10px 16px 28px", background: "#FDF6F0" }}
    >
      {/* 2-column grid — gap matches reference */}
      <div
        className="grid grid-cols-2"
        style={{ gap: "12px" }}
      >
        {promoCards.map((card) => (
          <PromoCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
