import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Categories — circular blob backdrop + floating product image
   Reference: product stands tall, overflows circle, no clip
   head1 = Face Wash | head2 = Soap | head3 = Creams | head4 = Nalangu Maavu
───────────────────────────────────────────── */
const categories = [
  {
    name: "Face Wash",
    href: "/products?category=face-wash",
    image: "/images/head1.avif",
    blobColor: "#EDD5CC",
    blobColor2: "#E5C4B8",
  },
  {
    name: "Soap",
    href: "/products?category=soap",
    image: "/images/head2.avif",
    blobColor: "#DDD0EA",
    blobColor2: "#C8B8DC",
  },
  {
    name: "Creams",
    href: "/products?category=face-cream",
    image: "/images/head3.avif",
    blobColor: "#F2D5C0",
    blobColor2: "#EEC4A8",
  },
  {
    name: "Nalangu Maavu",
    href: "/products?category=nalangu-maavu",
    image: "/images/head4_v2.avif",
    blobColor: "#F0E0A8",
    blobColor2: "#E8D090",
  },
];

/* ─────────────────────────────────────────────
   Individual Category Card
   Layout: circle blob backdrop → product image floats freely above centre
           → pill label below
   The outer wrapper has overflow:visible so the tall product PNG
   naturally overflows the circle top/sides, matching the reference.
───────────────────────────────────────────── */
function CategoryCard({
  cat,
  index,
}: {
  cat: (typeof categories)[number];
  index: number;
}) {
  return (
    <Link
      href={cat.href}
      className="shrink-0 snap-center flex flex-col items-center active:scale-95 transition-transform duration-200"
      style={{ width: "90px" }}
    >
      {/* Outer wrapper — overflow visible so product can float above circle */}
      <div
        className="relative flex items-end justify-center"
        style={{
          width: "82px",
          height: "88px", /* tall enough for the overflowing product */
          marginBottom: "4px",
        }}
      >
        {/* Circle backdrop — sits at bottom of wrapper */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 42% 52%, ${cat.blobColor} 0%, ${cat.blobColor2} 60%, rgba(255,255,255,0.45) 100%)`,
            boxShadow: "0 6px 20px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
            border: "1.5px solid rgba(255,255,255,0.80)",
          }}
        >
          {/* Inner highlight */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.50) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* Product image — no-background PNG, floats freely */}
        <Image
          src={cat.image}
          alt={cat.name}
          width={68}
          height={84}
          {...(index === 0
            ? { priority: true, fetchPriority: "high" as const }
            : { loading: "lazy" as const })}
          style={{
            position: "relative",
            zIndex: 2,
            objectFit: "contain",
            objectPosition: "bottom",
            maxHeight: "84px",
            width: "auto",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.12))",
          }}
        />
      </div>

      {/* Pill label — white bg, dusty rose border, arrow */}
      <div
        className="flex items-center gap-0.5 px-2 py-[3.5px]"
        style={{
          background: "#FFFFFF",
          border: "1px solid #D4A0B0",
          borderRadius: "100px",
          boxShadow: "0 1px 4px rgba(180, 100, 130, 0.08)",
          minWidth: "68px",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "9px",
            fontWeight: 500,
            color: "#3A2418",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {cat.name}
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
  );
}

/* ─────────────────────────────────────────────
   Main export — mobile only, horizontal scroll
───────────────────────────────────────────── */
export default function MobileCategoryScroll() {
  return (
    <div
      className="block md:hidden w-full"
      style={{ background: "#FDF6F0", paddingTop: "2px", paddingBottom: "0px" }}
    >
      {/* Horizontal scroll — extra vertical padding for overflow */}
      <div
        className="overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3 px-5"
        style={{ scrollPaddingLeft: "20px", paddingTop: "2px", paddingBottom: "10px" }}
      >
        {categories.map((cat, index) => (
          <CategoryCard key={cat.name} cat={cat} index={index} />
        ))}
      </div>
    </div>
  );
}
