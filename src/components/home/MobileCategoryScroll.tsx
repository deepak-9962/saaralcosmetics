import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Categories — circular blob cards + pill labels
   Matching reference: Serums | SPF | Face Wash | Shampoo…
───────────────────────────────────────────── */
const categories = [
  {
    name: "Face Wash",
    href: "/products?category=face-wash",
    image: "/images/cat-face-wash.avif",
    blobColor: "#EDD5CC",
    blobColor2: "#E5C4B8",
  },
  {
    name: "Soap",
    href: "/products?category=soap",
    image: "/images/cat-soap.avif",
    blobColor: "#DDD0EA",
    blobColor2: "#C8B8DC",
  },
  {
    name: "Creams",
    href: "/products?category=face-cream",
    image: "/images/cat-face-cream.avif",
    blobColor: "#F2D5C0",
    blobColor2: "#EEC4A8",
  },
  {
    name: "Nalangu Maavu",
    href: "/products?category=nalangu-maavu",
    image: "/images/cat-nalangu-maavu.avif",
    blobColor: "#F0E0A8",
    blobColor2: "#E8D090",
  },
  {
    name: "Face Packs",
    href: "/products?category=face-pack",
    image: "/images/cat-face-cream.avif",
    blobColor: "#C8DFC8",
    blobColor2: "#B2CEB2",
  },
  {
    name: "Serums",
    href: "/products?category=serum",
    image: "/images/cat-face-wash.avif",
    blobColor: "#D0DCEF",
    blobColor2: "#BAC8E4",
  },
  {
    name: "Oils",
    href: "/products?category=oil",
    image: "/images/cat-nalangu-maavu.avif",
    blobColor: "#F8E8C8",
    blobColor2: "#F0D8A8",
  },
  {
    name: "Body Care",
    href: "/products?category=body-care",
    image: "/images/cat-soap.avif",
    blobColor: "#E8D5E8",
    blobColor2: "#D8C0D8",
  },
];

/* ─────────────────────────────────────────────
   Individual Category Card
   Layout matches reference: circle blob → product image → pill button
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
      className="shrink-0 snap-center flex flex-col items-center gap-2 active:scale-95 transition-transform duration-200"
      style={{ width: "96px" }}
    >
      {/* Large circular blob container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: `radial-gradient(circle at 42% 52%, ${cat.blobColor} 0%, ${cat.blobColor2} 55%, rgba(255,255,255,0.5) 100%)`,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
          border: "1.5px solid rgba(255,255,255,0.75)",
        }}
      >
        {/* Soft inner glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 38% 38%, rgba(255,255,255,0.55) 0%, transparent 65%)`,
          }}
          aria-hidden="true"
        />
        {/* Product image — centered, floating */}
        <div
          className="absolute flex items-end justify-center w-full h-full"
          style={{ bottom: "-4px", paddingBottom: "4px" }}
        >
          <Image
            src={cat.image}
            alt={cat.name}
            width={66}
            height={72}
            {...(index === 0
              ? { priority: true, fetchPriority: "high" as const }
              : { loading: "lazy" as const })}
            className="object-contain object-bottom"
            style={{
              maxHeight: "72px",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.10))",
            }}
          />
        </div>
      </div>

      {/* Pill label button — white bg, dusty rose border, right arrow */}
      <div
        className="flex items-center gap-1 px-3 py-[5px]"
        style={{
          background: "#FFFFFF",
          border: "1px solid #D4A0B0",
          borderRadius: "100px",
          boxShadow: "0 1px 4px rgba(180, 100, 130, 0.08)",
          minWidth: "72px",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
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
          width="9"
          height="9"
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
   Main export — mobile only, no header label
   Matches reference: pure scroll strip below nav
───────────────────────────────────────────── */
export default function MobileCategoryScroll() {
  return (
    <div
      className="block md:hidden w-full"
      style={{ background: "#FDF6F0", paddingTop: "4px", paddingBottom: "4px" }}
    >
      {/* Horizontal scroll container — no header */}
      <div
        className="overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3 px-5 py-4"
        style={{ scrollPaddingLeft: "20px" }}
      >
        {categories.map((cat, index) => (
          <CategoryCard key={cat.name} cat={cat} index={index} />
        ))}
      </div>
    </div>
  );
}
