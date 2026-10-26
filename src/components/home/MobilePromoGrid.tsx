import Link from "next/link";
import type { HomepagePromoCard, BotanicalAccentType } from "@/lib/types";
import { DEFAULT_HOMEPAGE_PROMO_CARDS } from "@/lib/supabase/data";

/* ─────────────────────────────────────────────
   Botanical SVG accents — bottom-right corner
───────────────────────────────────────────── */
function LeafAccent({ color = "#8B6A3A" }: { color?: string }) {
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
      <path d="M20 70 C 30 55, 40 30, 45 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 45 C 55 38, 68 42, 72 52 C 58 60, 40 55, 38 45 Z" fill={color} />
      <path d="M34 28 C 20 22, 8 28, 5 38 C 18 44, 30 36, 34 28 Z" fill={color} />
    </svg>
  );
}

function FlowerAccent({ color = "#8B3A5E" }: { color?: string }) {
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
          fill={color}
        />
      ))}
      <circle cx="40" cy="40" r="6" fill={color} />
    </svg>
  );
}

function HerbAccent({ color = "#2E6640" }: { color?: string }) {
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
      <path d="M40 72 L 40 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 50 C 25 44, 14 48, 10 55 C 22 60, 34 55, 38 50 Z" fill={color} />
      <path d="M42 35 C 55 28, 66 32, 70 40 C 58 44, 46 40, 42 35 Z" fill={color} />
      <path d="M38 22 C 30 15, 20 18, 16 24 C 26 28, 34 24, 38 22 Z" fill={color} />
    </svg>
  );
}

function LavenderAccent({ color = "#5A3A8A" }: { color?: string }) {
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
      <path d="M40 72 L 40 25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={38 - i * 2} cy={25 + i * 10} rx="5" ry="3.5" fill={color} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={42 + i * 2} cy={28 + i * 10} rx="5" ry="3.5" fill={color} />
      ))}
    </svg>
  );
}

function renderBotanicalAccent(accent: BotanicalAccentType | string, color?: string) {
  switch (accent) {
    case "flower":
      return <FlowerAccent color={color} />;
    case "herb":
      return <HerbAccent color={color} />;
    case "lavender":
      return <LavenderAccent color={color} />;
    case "none":
      return null;
    case "leaf":
    default:
      return <LeafAccent color={color} />;
  }
}

interface PromoCardProps {
  card: HomepagePromoCard;
}

function PromoCard({ card }: PromoCardProps) {
  return (
    <Link
      href={card.link_url || "/products"}
      className="group active:scale-[0.97] transition-all duration-200 block relative overflow-hidden"
      style={{
        borderRadius: "20px",
        minHeight: "84px",
        background: card.bg_color || "#F0E8CC",
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
        {renderBotanicalAccent(card.botanical_accent, card.accent_color)}
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
            lineHeight: 1.22,
            letterSpacing: "-0.01em",
            color: "#2A1A14",
            whiteSpace: "pre-line",
          }}
        >
          {card.title}
        </h3>
        {card.badge_text && (
          <span
            className="inline-block mt-1 font-body text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{
              background: "rgba(255,255,255,0.65)",
              color: card.accent_color || "#2A1A14",
            }}
          >
            {card.badge_text}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Main export — mobile only (customizable by Admin)
 ───────────────────────────────────────────── */
interface MobilePromoGridProps {
  cards?: HomepagePromoCard[];
}

export default function MobilePromoGrid({ cards }: MobilePromoGridProps) {
  const displayCards =
    cards && cards.length > 0
      ? cards.filter((c) => c.is_active)
      : DEFAULT_HOMEPAGE_PROMO_CARDS.filter((c) => c.is_active);

  return (
    <div
      className="block md:hidden w-full"
      style={{ padding: "10px 16px 28px", background: "#FDF6F0" }}
    >
      {/* 2-column grid — gap matches reference */}
      <div className="grid grid-cols-2" style={{ gap: "12px" }}>
        {displayCards.map((card) => (
          <PromoCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
