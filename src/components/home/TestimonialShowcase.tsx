"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

const getProductLink = (name: string) => {
  const cleanName = name.trim().toLowerCase();
  
  if (cleanName.includes("pigmentation cream")) {
    return "/products/saaral-anti-aging-pigmentation-cream-15g";
  }
  if (cleanName.includes("sangupoo face wash")) {
    return "/products/butterfly-pea-facewash-sangoo-poo";
  }
  if (cleanName.includes("skin whitening cream")) {
    return "/products/saaral-skin-whitening-cream-15g";
  }
  if (cleanName.includes("redwine face wash")) {
    return "/products/redwine-facewash";
  }
  if (cleanName.includes("sangupoo soap")) {
    return "/products?category=soap";
  }
  
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `/products/${slug}`;
};

/* ─────────────────────────────────────────────
   7 PASTEL PALETTES
───────────────────────────────────────────── */
const PALETTES = [
  { bg: "#C8DEFF", tagBg: "#A8C6F5", tagText: "#1A3A6B", text: "#1A3055", sub: "#3A5A8A", divider: "rgba(90,130,200,0.28)", ctaColor: "#1A3055" },
  { bg: "#FFD9B8", tagBg: "#F5C49A", tagText: "#6B2D0A", text: "#5A2000", sub: "#8A4A20", divider: "rgba(180,90,30,0.22)", ctaColor: "#5A2000" },
  { bg: "#D4CAFE", tagBg: "#BAA8F5", tagText: "#2D1A6B", text: "#221050", sub: "#4A3480", divider: "rgba(100,70,200,0.22)", ctaColor: "#221050" },
  { bg: "#B8EDD8", tagBg: "#8ED8B8", tagText: "#0A4A2A", text: "#053820", sub: "#256845", divider: "rgba(20,120,70,0.22)", ctaColor: "#053820" },
  { bg: "#FFECC8", tagBg: "#F5D890", tagText: "#5A3A00", text: "#402800", sub: "#7A5000", divider: "rgba(160,100,0,0.2)",  ctaColor: "#402800" },
  { bg: "#FCCFDA", tagBg: "#F5A8BE", tagText: "#6B0A2A", text: "#500020", sub: "#8A2048", divider: "rgba(180,30,80,0.2)",  ctaColor: "#500020" },
  { bg: "#C8E8D0", tagBg: "#9DD4AC", tagText: "#0A3A18", text: "#052A10", sub: "#1E5430", divider: "rgba(20,100,50,0.2)",  ctaColor: "#052A10" },
];

/* ─────────────────────────────────────────────
   REAL CUSTOMER DATA — 10 verified reviews
───────────────────────────────────────────── */
const BASE = [
  {
    id: 1,
    name: "Agalya Saravanan",
    location: "Kerala",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=agalya2024&backgroundColor=c8deff",
    quote:
      "Hii mam, unga product nalla work aguthu. Face la irukka pigmentation nallave reduce agi iruku mam. Thank you mam. Enakku romba naala pimples problem irundhuchu, but ipo nallave reduce agi irukku mam. Enna try pannalum pola, unga cream try panna appo nalla different irundhuchu mam.",
    products: ["Pigmentation Cream", "Sangupoo Face Wash"],
  },
  {
    id: 2,
    name: "Kavitha",
    location: "Thiruchendur",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=kavitha2024&backgroundColor=ffd9b8",
    quote:
      "Romba romba thanks mam. Enga amma ku mangu problem 10 years ah irukku. Na neraya products vangi use panna edhuvum result tharala. Kitta thatta 10k selavu panniyum result illa. Oru naal unga video Instagram la paatha. Nambikkai illama than unga Pigmentation Cream and Sangupoo Face Wash vangunen. Price kammiya irundhuchu, result varuma varadhanu yosichen. Once try pannalam nu vangunen. Enga amma use panna sonnen. 7 days use pannadhum result light ah theriyaramichuchu. One month regular ah use panna sonnen. Inniku one month aaguthu mam, semma result. Thank you so much mam.",
    products: ["Pigmentation Cream", "Sangupoo Face Wash"],
  },
  {
    id: 3,
    name: "Rehana",
    location: "Cuddalore",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=rehana2024&backgroundColor=d4cafe",
    quote: "Enaku 2 days la skin glow ah erukku mam. Best product mam.",
    products: ["Skin Whitening Cream", "Redwine Face Wash"],
  },
  {
    id: 4,
    name: "Priya Murugan",
    location: "Mumbai",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=priyamuruga2024&backgroundColor=b8edd8",
    quote: "Unga product super ah work aguthu. TQ.",
    products: ["Pigmentation Cream", "Skin Whitening Cream", "Redwine Face Wash"],
  },
  {
    id: 5,
    name: "Jayasudha",
    location: "Thanjavur",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=jayasudha2024&backgroundColor=ffecc8",
    quote: "Sangupoo Face Wash super mam.",
    products: ["Sangupoo Face Wash"],
  },
  {
    id: 6,
    name: "Sowmiya Prakash",
    location: "Villupuram",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=sowmiya2024&backgroundColor=fccfda",
    quote: "2 days ah tha use pandra. Nalla changes theriyudhu. Face wash super.",
    products: ["Redwine Face Wash"],
  },
  {
    id: 7,
    name: "Latha",
    location: "Paramakudi",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=latha2024&backgroundColor=c8e8d0",
    quote: "First time one bottle use panni irukken. Result super mam.",
    products: ["Sangupoo Face Wash"],
  },
  {
    id: 8,
    name: "Vaidhehi",
    location: "Thuraiyur",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=vaidhehi2024&backgroundColor=c8deff",
    quote:
      "Semma result face wash + cream. Thank you so much. So happy mam. Nalla result irku. Ennoda daughter ku nallave face la result therinjurku mam.",
    products: ["Skin Whitening Cream", "Redwine Face Wash"],
  },
  {
    id: 9,
    name: "Shruthika",
    location: "Chennai",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=shruthika2024&backgroundColor=ffd9b8",
    quote:
      "Unga Saaral Face Whitening Cream romba nallaa irukku sister. Naa morning and night use panren. Face la difference nallaa theriyudhu. Cream apply pannadhuku apram glowing ah irukku. One time use pannaale nalla result irukku. Skin Whitening Cream and Sangupoo Face Wash order pottu 2 days la receive aachi. Romba thanks sister. Naa continue ah upcoming la unga Saaral Cosmetics than use panna poren. Romba super ah irukku.",
    products: ["Skin Whitening Cream", "Sangupoo Face Wash"],
  },
  {
    id: 10,
    name: "Suresh Sudha",
    location: "Kanchipuram",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=sureshsudha2024&backgroundColor=d4cafe",
    quote:
      "Hii mam, very nice product. Love you mam. All super. Yellow products use panniruken, no use. Unga products pola nice ah illa. Happy.",
    products: ["Skin Whitening Cream", "Pigmentation Cream", "Redwine Face Wash", "Sangupoo Soap"],
  },
  {
    id: 11,
    name: "Amaravathi",
    location: "Ramapuram",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=amaravathi2024&backgroundColor=b8edd8",
    quote: "Mam really thank you. Skin la nalla change irukku. Enaku skin romba dry ah irukkum, but ipo romba smooth agiruchi. Pimples also kammi agi irukku. 😊✨",
    products: ["Skin Whitening Cream"],
  },
  {
    id: 12,
    name: "Malar Sarathi",
    location: "Chengalpattu",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=malarsarathi2024&backgroundColor=ffecc8",
    quote: "3 days tha use panen. Unga cream super ah work aguthu mam. 7 days result ku wait panren mam. Thank you 😊",
    products: ["Skin Whitening Cream", "Pigmentation Cream"],
  },
  {
    id: 13,
    name: "Saranya",
    location: "Tiruppur",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=saranya2024&backgroundColor=fccfda",
    quote: "Sis, your product gives amazing results. Super! I could see changes within just 4 days. Thank you!\n\nEven my daughter says, ‘Mom, you look brighter now.’",
    products: ["Skin Whitening Cream"],
  },
  {
    id: 14,
    name: "I. Lidiya Isaacraja",
    location: "Thanjavur",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=lidiya2024&backgroundColor=c8e8d0",
    quote: "Na use panni 7 days la best result eruku mam. Super cream. Regular ah night time use panna best result irukku. Face la iruka pimples koranchiruku. Super best cream mam. Unga product enaku romba romba pidichiruku. Pigmentation Cream, Whitening Cream, Sangupoo Face Wash ellame best result kuduthuchu. Super. Thank you so much mam.",
    products: ["Skin Whitening Cream", "Pigmentation Cream", "Sangupoo Face Wash"],
  },
  {
    id: 15,
    name: "Manju Sugumar",
    location: "Dharmapuri",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=manju2024&backgroundColor=c8deff",
    quote: "Unga cream very super mam. Delivery ku apram skin romba surukkam vilura mathiri irunthuchi. Baby irukarathunala continue ah use panna mudila. Weekly 3 or 4 times tha use pannen. Aana good results mam. Thank you 🤝",
    products: ["Skin Whitening Cream", "Pigmentation Cream", "Redwine Face Wash"],
  },
  {
    id: 16,
    name: "Anjali Vishnu",
    location: "Haryana",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=anjali2024&backgroundColor=ffd9b8",
    quote: "Mam, unga cream 3 months use panra mam. Ennoda face and neck use panna vera level changes mam. I am so happy 🥰. Ennoda skin romba smooth and classy erukku mam. Romba thanks mam. Ippo ennoda sister ku venum mam. Ennoda address ku Whitening Cream, Pigmentation Cream and Redwine Face Wash send pannidunga mam.",
    products: ["Skin Whitening Cream", "Redwine Face Wash"],
  },
  {
    id: 17,
    name: "Vinoda",
    location: "Karnataka",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=vinoda2024&backgroundColor=d4cafe",
    quote: "Akka romba romba thank you akka. Ennoda face parunga akka, evlo clear ayruku nu. Kannu ku keela romba block ayrunchi akka, ippo kammi ayruku. Romba thank you akka. All good Saaral products akka.",
    products: ["Pigmentation Cream", "Skin Whitening Cream", "Redwine Face Wash"],
  },
  {
    id: 18,
    name: "Kavitha",
    location: "Mumbai",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=kavitha22024&backgroundColor=b8edd8",
    quote: "I was actually scared to buy the Pigmentation Cream and Whitening Cream at first, mam. I kept thinking whether to buy it or not. But my friend had already purchased from you earlier and referred me, so I decided to try it. After seeing your customer reviews, I got some confidence and placed the order.\n\nHonestly mam, I never even expected I would get such amazing results 😍. Now after seeing my results, even my husband has started using the cream.\n\nThank you so much mam ❤️. Your products are truly worth the money. The quality and results are really excellent. I now have complete trust in your products 🙏.\n\nI’m sending my before & after photos mam, please have a look 😍.",
    products: ["Skin Whitening Cream", "Pigmentation Cream"],
  },
  {
    id: 19,
    name: "Rooba",
    location: "Mysore",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=rooba2024&backgroundColor=ffecc8",
    quote: "Mam, the creams I bought are very nice. Around 10 days before, I got pimples on my face and also had itching. Within a week, it got cleared.\n\nThank you so much ❤️.",
    products: ["Skin Whitening Cream", "Pigmentation Cream", "Redwine Face Wash"],
  },
];

/*
  Triple the array (30 cards total) for a seamless looping fan.
  Use a hand-shuffled palette sequence so every group of ~5
  visible cards always has different colours.
*/
const PALETTE_SEQ: number[] = [
  0, 1, 2, 3, 4, 5, 6, 0, 1, 2,
  3, 5, 6, 4, 1, 0, 2, 4, 6, 3,
  5, 2, 0, 6, 3, 1, 4, 5, 6, 2,
];

const LOOP = [...BASE, ...BASE, ...BASE].map((t, i) => ({
  ...t,
  uid: `${t.id}-${i}`,
  paletteIdx: PALETTE_SEQ[i % PALETTE_SEQ.length],
}));

type LoopItem = (typeof LOOP)[0];

/* ─────────────────────────────────────────────
   LAYOUT CONSTANTS
───────────────────────────────────────────── */
const CARD_H      = 390;
const PAD_TOP     = 28;
const MAX_Y       = 46;
const SPEED       = 50;    // px / second
const MAX_ROT     = 16;    // degrees
const MAX_SCALE_L = 0.30;
const MAX_OPQ_L   = 0.68;

/* ─────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────── */
function StarRating({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex items-center gap-[2px]" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 16 16"
          fill={i < count ? color : "none"}
          stroke={i < count ? color : `${color}44`}
          strokeWidth="1.4" aria-hidden="true"
        >
          <path d="M8 1.3l1.75 3.54 3.91.57-2.83 2.76.67 3.9L8 10.1l-3.5 1.97.67-3.9L2.34 5.41l3.91-.57L8 1.3z" />
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ARROW ICON
───────────────────────────────────────────── */
function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10h12M11 4l6 6-6 6" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   CLOSE ICON
───────────────────────────────────────────── */
function CloseIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M1 1l12 12M13 1L1 13" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIAL MODAL
   Opens when "Read Story" is clicked.
   Full review + product tags + verified badge.
   Closes on Escape, backdrop click, or X button.
───────────────────────────────────────────── */
function TestimonialModal({
  item,
  onClose,
}: {
  item: LoopItem;
  onClose: () => void;
}) {
  const p = PALETTES[item.paletteIdx];

  /* Escape key + body scroll lock */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    /* ── BACKDROP ── */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30, 16, 10, 0.70)",
        backdropFilter: "blur(14px) saturate(0.65)",
        WebkitBackdropFilter: "blur(14px) saturate(0.65)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`Review by ${item.name}`}
    >
      {/* ── MODAL CARD ── */}
      <motion.div
        initial={{ scale: 0.86, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.86, opacity: 0, y: 18 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: p.bg,
          borderRadius: "26px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "88dvh",
          overflowY: "auto",
          position: "relative",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.25), 0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.65)",
          scrollbarWidth: "none",
        }}
      >
        {/* ── CLOSE BUTTON ── */}
        <button
          onClick={onClose}
          aria-label="Close review"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "34px",
            height: "34px",
            background: "rgba(0,0,0,0.09)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.18)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.09)";
          }}
        >
          <CloseIcon color={p.text} />
        </button>

        {/* ── MODAL BODY ── */}
        <div style={{ padding: "30px 28px 26px" }}>

          {/* Avatar + Name + Location + Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
            <img
              src={item.avatar}
              alt={item.name}
              width={54}
              height={54}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                boxShadow: "0 0 0 3px rgba(255,255,255,0.85), 0 4px 12px rgba(0,0,0,0.12)",
              }}
              loading="lazy"
            />
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "21px",
                  lineHeight: 1.2,
                  color: p.text,
                  margin: "0 0 2px",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.name}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: p.sub,
                  margin: "0 0 7px",
                  opacity: 0.82,
                }}
              >
                {item.location}
              </p>
              <StarRating count={item.rating} color={p.ctaColor} />
            </div>
          </div>

          {/* Full quote — no clamp, fully readable */}
          <blockquote
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: 1.88,
              color: p.sub,
              margin: "0 0 20px",
              padding: "18px 20px",
              background: "rgba(255,255,255,0.48)",
              borderRadius: "14px",
              borderLeft: `3px solid ${p.ctaColor}55`,
              backdropFilter: "blur(4px)",
            }}
          >
            {item.quote}
          </blockquote>

          {/* Products used */}
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: p.sub,
                opacity: 0.65,
                marginBottom: "8px",
              }}
            >
              Products Used
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {item.products.map((prod) => (
                <Link
                  key={prod}
                  href={getProductLink(prod)}
                  onClick={() => {
                    sessionStorage.setItem("saaral_scroll_pos", window.scrollY.toString());
                  }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: p.tagText,
                    background: p.tagBg,
                    borderRadius: "999px",
                    padding: "5px 14px",
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    transition: "transform 0.2s ease, filter 0.2s ease",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
                    (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(0.96)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                    (e.currentTarget as HTMLAnchorElement).style.filter = "none";
                  }}
                >
                  {prod}
                </Link>
              ))}
            </div>
          </div>

          {/* Verified footer */}
          <div
            style={{
              paddingTop: "16px",
              borderTop: `1.5px solid ${p.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {/* Checkmark */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke={p.ctaColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13 4L6 12 3 9" />
            </svg>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11.5px",
                color: p.ctaColor,
                opacity: 0.7,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              Verified Saaral Cosmetics Customer
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   AUTO-SCROLLING FAN TRACK
   RAF loop — pauses on hover, resumes on leave.
   Click "Read Story" → calls onOpenModal(item).
───────────────────────────────────────────── */
function FanTrack({ onOpenModal }: { onOpenModal: (item: LoopItem) => void }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const rafRef        = useRef<number | null>(null);
  const lastTimeRef   = useRef<number | null>(null);
  const offsetRef     = useRef(0);
  const isPausedRef   = useRef(false);
  const N = LOOP.length; // 19 * 3 = 57

  // Dragging and Touch Swipe References
  const isDraggingRef = useRef(false);
  const startXRef     = useRef(0);
  const startOffsetRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const lastDragXRef  = useRef(0);
  const lastDragTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const inertiaVelocityRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tick = (time: number) => {
      const dt = lastTimeRef.current != null
        ? Math.min(time - lastTimeRef.current, 100)
        : 0;
      lastTimeRef.current = time;

      const W  = container.offsetWidth;
      const cx = W / 2;
      const cardW    = W < 480 ? Math.min(240, W * 0.78) : W < 768 ? 262 : W < 1024 ? 282 : 302;
      const cardStep = cardW + Math.round(W * 0.055 + 24);
      const TOTAL    = N * cardStep;
      const maxDist  = cardStep * 2.35;

      /* Apply auto-scroll or inertia or keep frozen if dragging */
      if (isDraggingRef.current) {
        // Updated in real-time by move handlers
      } else if (Math.abs(inertiaVelocityRef.current) > 0.5) {
        offsetRef.current = (offsetRef.current + (inertiaVelocityRef.current * dt) / 1000) % TOTAL;
        inertiaVelocityRef.current *= 0.94; // Decay
      } else if (!isPausedRef.current) {
        offsetRef.current = (offsetRef.current + (SPEED * dt) / 1000) % TOTAL;
      }

      // Safe bounds
      offsetRef.current = (offsetRef.current + TOTAL) % TOTAL;

      const kids = container.children;

      for (let i = 0; i < N; i++) {
        const el = kids[i] as HTMLElement | undefined;
        if (!el) continue;

        const rawX  = ((i * cardStep - offsetRef.current) % TOTAL + TOTAL) % TOTAL;
        const offset = rawX - TOTAL / 2;
        const xPos  = offset + cx - cardW / 2;

        if (xPos > W + cardW * 0.6 || xPos < -cardW * 1.4) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          continue;
        }

        const absT  = Math.min(Math.abs(offset) / maxDist, 1);
        const sign  = offset >= 0 ? 1 : -1;

        const rotate  = -sign * absT * MAX_ROT;
        const scale   = 1 - absT * MAX_SCALE_L;
        const ty      = absT * MAX_Y;
        const opacity = Math.max(0.18, 1 - absT * MAX_OPQ_L);
        const zIndex  = Math.round((1 - absT) * 10);

        el.style.width         = `${cardW}px`;
        el.style.transform     = `translateX(${xPos}px) translateY(${ty}px) rotate(${rotate}deg) scale(${scale})`;
        el.style.opacity       = String(opacity);
        el.style.zIndex        = String(zIndex);
        el.style.pointerEvents = "auto";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, []);

  const handleStart = (clientX: number) => {
    isDraggingRef.current = true;
    startXRef.current = clientX;
    startOffsetRef.current = offsetRef.current;
    lastDragXRef.current = clientX;
    lastDragTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    inertiaVelocityRef.current = 0;
    dragDistanceRef.current = 0;
    isPausedRef.current = true;
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - startXRef.current;
    dragDistanceRef.current += Math.abs(clientX - lastDragXRef.current);

    const container = containerRef.current;
    if (!container) return;
    const W = container.offsetWidth;
    const cardW = W < 480 ? Math.min(240, W * 0.78) : W < 768 ? 262 : W < 1024 ? 282 : 302;
    const cardStep = cardW + Math.round(W * 0.055 + 24);
    const TOTAL = N * cardStep;

    offsetRef.current = ((startOffsetRef.current - deltaX) % TOTAL + TOTAL) % TOTAL;

    const now = performance.now();
    const dt = now - lastDragTimeRef.current;
    if (dt > 10) {
      const dx = clientX - lastDragXRef.current;
      dragVelocityRef.current = (dx / dt) * 1000;
      lastDragXRef.current = clientX;
      lastDragTimeRef.current = now;
    }
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    isPausedRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";

    if (Math.abs(dragVelocityRef.current) > 100) {
      inertiaVelocityRef.current = -dragVelocityRef.current;
    }

    setTimeout(() => {
      dragDistanceRef.current = 0;
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Customer testimonials carousel"
      onMouseEnter={() => { if (!isDraggingRef.current) isPausedRef.current = true; }}
      onMouseLeave={() => {
        if (!isDraggingRef.current) isPausedRef.current = false;
        handleEnd();
      }}
      onMouseDown={(e) => {
        // Only left click triggers drag
        if (e.button === 0) handleStart(e.pageX);
      }}
      onMouseMove={(e) => handleMove(e.pageX)}
      onMouseUp={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].pageX)}
      onTouchMove={(e) => handleMove(e.touches[0].pageX)}
      onTouchEnd={handleEnd}
      style={{
        position: "relative",
        width: "100%",
        height: `${PAD_TOP + CARD_H + MAX_Y + 28}px`,
        overflow: "hidden",
        userSelect: "none",
        cursor: "grab",
        touchAction: "pan-y",
      }}
    >
      {LOOP.map((t, i) => {
        const p = PALETTES[t.paletteIdx];
        return (
          <div
            key={t.uid}
            /* pointer-events managed per-frame by RAF */
            style={{
              position: "absolute",
              top: `${PAD_TOP}px`,
              left: 0,
              width: "302px",        /* default — RAF overrides */
              height: `${CARD_H}px`,
              opacity: 0,            /* RAF sets correct value before first paint */
              willChange: "transform, opacity",
              transformOrigin: "center center",
            }}
          >
            {/* ── CARD SHELL ── */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: p.bg,
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow:
                  "0 16px 48px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.55)",
              }}
            >
              {/* ── BODY (no pointer events to prevent text drag) ── */}
              <div
                style={{
                  padding: "22px 22px 16px",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "11px",
                  minHeight: 0,
                  pointerEvents: "none",
                }}
              >
                {/* Avatar + Stars */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={42}
                    height={42}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                      boxShadow: "0 0 0 2.5px rgba(255,255,255,0.75), 0 3px 10px rgba(0,0,0,0.1)",
                    }}
                    loading="lazy"
                  />
                  <StarRating count={t.rating} color={p.ctaColor} />
                </div>

                {/* Name & Location */}
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "20px",
                      lineHeight: 1.2,
                      color: p.text,
                      margin: 0,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {t.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: p.sub,
                      marginTop: "2px",
                      opacity: 0.82,
                    }}
                  >
                    {t.location}
                  </p>
                </div>

                {/*
                  Quote — clamped to 3 lines.
                  CSS ellipsis shows "..." when text overflows.
                  Full text is revealed in the modal.
                */}
                <blockquote
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "13px",
                    lineHeight: 1.78,
                    color: p.sub,
                    margin: 0,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {t.quote}
                </blockquote>

                {/* Product tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto", paddingTop: "4px", pointerEvents: "auto" }}>
                  {t.products.map((prod) => (
                    <Link
                      key={prod}
                      href={getProductLink(prod)}
                      onClick={(e) => {
                        if (dragDistanceRef.current > 15) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        sessionStorage.setItem("saaral_scroll_pos", window.scrollY.toString());
                      }}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: p.tagText,
                        background: p.tagBg,
                        borderRadius: "999px",
                        padding: "4px 11px",
                        whiteSpace: "nowrap",
                        textDecoration: "none",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        transition: "transform 0.2s ease, filter 0.2s ease",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
                        (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(0.96)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                        (e.currentTarget as HTMLAnchorElement).style.filter = "none";
                      }}
                    >
                      {prod}
                    </Link>
                  ))}
                </div>
              </div>

              {/*
                ── FOOTER — "Read Story" button ──
                pointer-events: auto so clicks are captured.
                Opens the full review modal.
              */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Read full review by ${t.name}`}
                onClick={(e) => {
                  if (dragDistanceRef.current > 15) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  onOpenModal(t);
                }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpenModal(t); }}
                style={{
                  borderTop: `1.5px solid ${p.divider}`,
                  padding: "13px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  cursor: "pointer",
                  pointerEvents: "auto",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: p.ctaColor,
                  }}
                >
                  Read Story
                </span>
                <ArrowIcon color={p.ctaColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function SectionHeader() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div ref={ref} className="text-center px-5 md:px-[72px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ width: "clamp(24px,4vw,48px)", height: "1px", background: "linear-gradient(to right, transparent, #C7A465)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, letterSpacing: "5px", textTransform: "uppercase", color: "#C7A465" }}>
          Ritual Experiences
        </span>
        <div style={{ width: "clamp(24px,4vw,48px)", height: "1px", background: "linear-gradient(to left, transparent, #C7A465)" }} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(36px, 5vw, 64px)",
          fontWeight: 500,
          color: "#2B1E1B",
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          marginBottom: "14px",
        }}
      >
        Stories From Our{" "}
        <em style={{ fontStyle: "italic", fontWeight: 400 }}>Customers</em>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(14px, 1.1vw, 15px)",
          fontWeight: 400,
          color: "#8E7A74",
          letterSpacing: "0.02em",
        }}
      >
        Real journeys. Real rituals. Real results.
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATIC TESTIMONIAL SKELETON (Lightweight DOM)
   Renders 3 featured static cards matching the footprint.
───────────────────────────────────────────── */
function TestimonialSkeleton() {
  const featured = BASE.slice(0, 3);
  const cardW = 302;
  const height = CARD_H;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "28px",
        flexWrap: "wrap",
        width: "100%",
        minHeight: `${PAD_TOP + CARD_H + MAX_Y + 28}px`,
        padding: "0 20px",
        position: "relative",
      }}
    >
      {featured.map((t, idx) => {
        const p = PALETTES[idx % PALETTES.length];
        return (
          <div
            key={`skeleton-${t.id}`}
            className={idx > 0 ? "hidden md:flex" : "flex"}
            style={{
              width: `${cardW}px`,
              height: `${height}px`,
              background: p.bg,
              borderRadius: "20px",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow:
                "0 16px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.55)",
              padding: "22px 22px 16px",
              justifyContent: "space-between",
              opacity: idx === 0 ? 1 : idx === 1 ? 0.8 : 0.6,
              transform: idx === 1 ? "scale(0.97)" : idx === 2 ? "scale(0.94)" : "none",
            }}
          >
            {/* Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "11px", flexGrow: 1, minHeight: 0 }}>
              {/* Avatar + Stars */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  width={42}
                  height={42}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0 0 0 2.5px rgba(255,255,255,0.75), 0 3px 10px rgba(0,0,0,0.1)",
                  }}
                  loading="eager"
                />
                <StarRating count={t.rating} color={p.ctaColor} />
              </div>

              {/* Name & Location */}
              <div>
                <h3 style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "#2B1E1B", margin: 0 }}>
                  {t.name}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, color: p.sub, margin: "2px 0 0" }}>
                  {t.location}
                </p>
              </div>

              {/* Quote */}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "#3E2A25",
                  opacity: 0.85,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 7,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                "{t.quote}"
              </p>
            </div>

            {/* Footer Tag */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
              {t.products.slice(0, 2).map((prod) => (
                <span
                  key={prod}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: p.tagText,
                    background: p.tagBg,
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {prod}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT SECTION EXPORT
   Manages modal state and deferred carousel mounting.
───────────────────────────────────────────── */
export default function TestimonialShowcase() {
  const [modalItem, setModalItem] = useState<LoopItem | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore scroll position when user navigates back to homepage
  useEffect(() => {
    const savedPos = sessionStorage.getItem("saaral_scroll_pos");
    if (savedPos) {
      sessionStorage.removeItem("saaral_scroll_pos");
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPos, 10),
          behavior: "instant",
        });
      }, 150);
    }
  }, []);

  // IntersectionObserver to dynamically load carousel when user scrolls close
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasInteracted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" } // trigger 300px before reaching viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Customer testimonials"
      style={{
        position: "relative",
        background:
          "radial-gradient(circle at 15% 40%, rgba(183,131,143,0.06) 0%, transparent 40%), " +
          "radial-gradient(circle at 85% 65%, rgba(199,164,101,0.05) 0%, transparent 40%), " +
          "linear-gradient(to bottom, #FAF0EE 0%, #FAF3EE 12%, #FAF6F4 40%, #F7F1EF 100%)",
        marginTop: "-1px",
        paddingTop: "clamp(40px, 5vw, 80px)",
        paddingBottom: "clamp(80px, 10vw, 140px)",
        overflow: "hidden",
      }}
    >
      {/* Curved top divider matching the editorial section background above */}
      <div className="absolute left-0 w-full pointer-events-none" style={{ top: "-1px", height: "clamp(42px, 6vw, 60px)", zIndex: 10 }} aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full h-full"
          style={{ transform: "scaleY(1.03)" }}
        >
          <path
            d="M0,0 L0,60 C360,0 1080,0 1440,60 L1440,0 Z"
            fill="#F1DFDA"
            stroke="#F1DFDA"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Ambient blobs */}
      <div aria-hidden="true" style={{ position: "absolute", top: "-80px", left: "-60px", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(183,131,143,0.06) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: "-100px", right: "-60px", width: "560px", height: "560px", borderRadius: "50%", background: "radial-gradient(circle, rgba(199,164,101,0.05) 0%, transparent 70%)", filter: "blur(70px)", pointerEvents: "none" }} />

      {/* Grain */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.016, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }} />

      <SectionHeader />

      <div style={{ height: "clamp(36px, 4.5vw, 60px)" }} />

      {hasInteracted ? (
        <FanTrack onOpenModal={setModalItem} />
      ) : (
        <TestimonialSkeleton />
      )}

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{ textAlign: "center", marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}
      >
        <div style={{ width: "28px", height: "1px", background: "rgba(183,131,143,0.3)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(142,122,116,0.5)" }}>
          Hover to pause · Click to read
        </span>
        <div style={{ width: "28px", height: "1px", background: "rgba(183,131,143,0.3)" }} />
      </motion.div>

      {/* ── MODAL — mounted/unmounted with smooth spring animation ── */}
      <AnimatePresence>
        {modalItem && (
          <TestimonialModal
            item={modalItem}
            onClose={() => setModalItem(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
