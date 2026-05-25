import Link from "next/link";
import RitualCard from "./RitualCard";
import FadeIn from "@/components/layout/FadeIn";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const rituals = [
  {
    id: "face-cream",
    name: "Face Cream",
    ritual: "Morning Radiance",
    story: "A slow-pour of botanical actives that restore luminosity while you sleep and protect through the day.",
    image: "/images/cat-face-cream.webp",
    href: "/products?category=face-cream",
    accent: "#B06080",
    accentLight: "rgba(176,96,128,0.15)",
    tag: "Bestseller",
    icon: "spa",
  },
  {
    id: "face-wash",
    name: "Face Wash",
    ritual: "Cleansing Ceremony",
    story: "Ancient botanicals meet fresh-water clarity — a ritual that resets the skin's natural balance.",
    image: "/images/cat-face-wash.webp",
    href: "/products?category=face-wash",
    accent: "#7E6B9A",
    accentLight: "rgba(126,107,154,0.15)",
    tag: "Daily Essential",
    icon: "water_drop",
  },
  {
    id: "soap",
    name: "Botanical Soap",
    ritual: "Purifying Ritual",
    story: "Cold-pressed, handcrafted bars that lather with intention and leave skin irresistibly soft.",
    image: "/images/cat-soap.webp",
    href: "/products?category=soap",
    accent: "#4A7C59",
    accentLight: "rgba(74,124,89,0.15)",
    tag: "Handcrafted",
    icon: "local_florist",
  },
  {
    id: "nalangu-maavu",
    name: "Nalangu Maavu",
    ritual: "Heritage Ceremony",
    story: "A 2,000-year-old Tamil Nadu bridal tradition — turmeric, sandalwood, and pulse flour in harmony.",
    image: "/images/cat-nalangu-maavu.webp",
    href: "/products?category=nalangu-maavu",
    accent: "#C9A74D",
    accentLight: "rgba(201,167,77,0.18)",
    tag: "Heritage Formula",
    icon: "auto_awesome",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────── */
export default function CuratedRituals() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FDF6F0 0%, #F7EAE2 40%, #F2E0D5 100%)",
        padding: "80px 0 96px",
      }}
    >
      {/* ── Ambient background orbs ── */}
      <div
        className="absolute top-[-80px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, #F2D5E0 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-60px] right-[-80px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-25"
        style={{ background: "radial-gradient(circle, #C9A74D 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #7E6B9A 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-[72px]">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 gap-6">
          <FadeIn
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#C9A74D]" />
              <span className="label-caps text-[#C9A74D]">Shop By Category</span>
            </div>

            {/* Headline */}
            <h2
              className="font-display text-[#2A1A14]"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
              }}
            >
              Curated{" "}
              <em style={{ fontStyle: "italic", color: "#B06080" }}>Rituals</em>
            </h2>
          </FadeIn>

          <FadeIn
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="flex flex-col gap-3"
          >
            <p
              className="font-body text-[#5A3A2C]/65 text-[14px] leading-relaxed md:text-right"
              style={{ maxWidth: "320px" }}
            >
              Discover formulations crafted for every stage of your skincare ritual.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 label-caps text-[#B06080] hover:gap-3 transition-all duration-300 group self-start md:self-end"
            >
              View All Products
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </Link>
          </FadeIn>
        </div>

        {/* ── Desktop Grid: asymmetric 2-2 layout ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {rituals.map((ritual, i) => (
            <RitualCard key={ritual.id} ritual={ritual} index={i} />
          ))}
        </div>

        {/* ── Mobile: horizontal scroll snap ── */}
        <div className="md:hidden -mx-5 px-5 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 pb-2">
          {rituals.map((ritual, i) => (
            <div
              key={ritual.id}
              className="snap-center shrink-0"
              style={{ width: "72vw", maxWidth: "280px" }}
            >
              <RitualCard ritual={ritual} index={i} />
            </div>
          ))}
        </div>

        {/* ── Bottom editorial strip ── */}
        <FadeIn
          className="mt-14 md:mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, delay: 0.3, ease }}
        >
          {[
            { icon: "spa", label: "100% Natural" },
            { icon: "pets", label: "Cruelty Free" },
            { icon: "handyman", label: "Handmade" },
            { icon: "eco", label: "Ethically Sourced" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(176,96,128,0.1)",
                  border: "1px solid rgba(176,96,128,0.2)",
                }}
              >
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ color: "#B06080" }}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className="font-body text-[12px] tracking-[0.1em] uppercase"
                style={{ color: "#5A3A2C", opacity: 0.7 }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
