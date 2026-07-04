import Image from "next/image";
import Link from "next/link";

/* ─────────────────────────────────────────────
   8-category data — desktop strip
   Uses transparent-bg product head images for the
   "floating product over pastel blob" aesthetic
   matching MobileCategoryScroll.
───────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "butterfly-pea",
    label: "Butterfly Pea",
    img: "/images/head1.avif",
    imgAlt: "Butterfly Pea Collection — Saaral Cosmetics",
    blobColor: "#DDD5F0",
    blobColor2: "#C8BEE8",
    href: "/products?collection=butterfly-pea",
  },
  {
    id: "red-wine",
    label: "Red Wine",
    img: "/images/head2.avif",          // Deep-toned product
    imgAlt: "Red Wine Anti-Aging Collection — Saaral Cosmetics",
    blobColor: "#E8CACF",
    blobColor2: "#D8B0B8",
    href: "/products?collection=red-wine",
  },
  {
    id: "face-wash",
    label: "Face Wash",
    img: "/images/head1.avif",
    imgAlt: "Face Wash — Saaral Cosmetics",
    blobColor: "#C8DFF0",
    blobColor2: "#B0CEEA",
    href: "/products?category=face-wash",
  },
  {
    id: "creams",
    label: "Creams",
    img: "/images/head3.avif",
    imgAlt: "Premium Face Cream — Saaral Cosmetics",
    blobColor: "#F2D5C0",
    blobColor2: "#EEC4A8",
    href: "/products?category=face-cream",
  },
  {
    id: "herbal-care",
    label: "Herbal Care",
    img: "/images/head4_v2.avif",
    imgAlt: "Nalangu Maavu — Traditional Herbal Care, Saaral Cosmetics",
    blobColor: "#F0E0A8",
    blobColor2: "#E8D090",
    href: "/products?category=nalangu-maavu",
  },
  {
    id: "soaps",
    label: "Soaps",
    img: "/images/head2.avif",
    imgAlt: "Botanical Soap — Saaral Cosmetics",
    blobColor: "#D0E8C8",
    blobColor2: "#BCDCB0",
    href: "/products?category=soap",
  },
  {
    id: "vetpalai",
    label: "Vetpalai",
    img: "/images/head4.avif",
    imgAlt: "Vetpalai Soap Collection — Saaral Cosmetics",
    blobColor: "#E8E0C0",
    blobColor2: "#DDD0A8",
    href: "/products?collection=vetpalai",
  },
  {
    id: "bestsellers",
    label: "Best Sellers",
    img: "/images/head3.avif",
    imgAlt: "Best Selling Products — Saaral Cosmetics",
    blobColor: "#F5E0C0",
    blobColor2: "#EDD0A8",
    href: "/products",
  },
] as const;

/* ─────────────────────────────────────────────
   Server Component — pure CSS hover via Tailwind
   "Floating product over pastel blob" pattern —
   same architecture as MobileCategoryScroll but
   scaled up for desktop (120px blob, 140px wrapper).
───────────────────────────────────────────── */
export default function DesktopCategoryStrip() {
  return (
    <section
      aria-label="Shop by Category"
      className="hidden md:block w-full"
      style={{
        background: "#FDFAF8",
        borderBottom: "1px solid rgba(42,26,20,0.06)",
      }}
    >
      <div
        className="max-w-[1400px] mx-auto"
        style={{ padding: "12px 48px 40px" }}
      >
        {/* ── Eyebrow label ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-6 shrink-0" style={{ background: "#C9A74D" }} />
          <span
            className="font-body text-[10px] tracking-[0.22em] uppercase font-semibold"
            style={{ color: "#C9A74D" }}
          >
            Shop By Category
          </span>
        </div>

        {/* ── 8-column category grid ── */}
        <div className="grid grid-cols-8 gap-2 xl:gap-4">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.id}
              href={cat.href}
              aria-label={`Browse ${cat.label}`}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              {/*
                Outer wrapper — overflow: visible so the tall product image
                naturally floats above the blob circle, matching mobile style.
                Wrapper is taller than the blob to accommodate the overflow.
              */}
              <div
                className="relative flex items-end justify-center group-hover:-translate-y-[6px] transition-transform duration-[380ms]"
                style={{
                  width: "140px",
                  height: "158px",
                  transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                {/* Pastel blob circle — sits at bottom of wrapper */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
                  style={{
                    width: "124px",
                    height: "124px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 42% 52%, ${cat.blobColor} 0%, ${cat.blobColor2} 60%, rgba(255,255,255,0.45) 100%)`,
                    boxShadow:
                      "0 7px 22px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
                    border: "1.5px solid rgba(255,255,255,0.80)",
                    transition: "box-shadow 0.38s ease",
                  }}
                >
                  {/* Inner highlight */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.50) 0%, transparent 65%)",
                    }}
                  />
                </div>

                {/* Product image — transparent-bg PNG/AVIF, floats above blob */}
                <Image
                  src={cat.img}
                  alt={cat.imgAlt}
                  width={110}
                  height={136}
                  {...(index === 0
                    ? { priority: true, fetchPriority: "high" as const }
                    : { loading: "lazy" as const })}
                  className="relative z-10 group-hover:scale-[1.06] transition-transform duration-[380ms]"
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom",
                    maxHeight: "136px",
                    width: "auto",
                    filter: "drop-shadow(0 7px 16px rgba(0,0,0,0.13))",
                    transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
              </div>

              {/* Pill label — white bg, dusty-rose border, arrow — matches mobile */}
              <div
                className="flex items-center gap-1 px-4 py-[6px] transition-all duration-300 group-hover:border-[#D4A0B0]"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D4A0B0",
                  borderRadius: "100px",
                  boxShadow: "0 1px 4px rgba(180,100,130,0.08)",
                  minWidth: "96px",
                  justifyContent: "center",
                }}
              >
                <span
                  className="font-body whitespace-nowrap"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#3A2418",
                    letterSpacing: "0.03em",
                    lineHeight: 1,
                  }}
                >
                  {cat.label}
                </span>
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M2 5h6M6 2.5L8.5 5 6 7.5"
                    stroke="#B06080"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
