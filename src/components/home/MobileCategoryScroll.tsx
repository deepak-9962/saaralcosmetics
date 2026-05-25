import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Categories with blob color tuning
───────────────────────────────────────────── */
const categories = [
  {
    name: "Face Cream",
    label: "Nourish",
    href: "/products?category=face-cream",
    image: "/images/cat-face-cream.webp",
    blobColor: "#F2D5C0",
    blobColor2: "#EEC4A8",
  },
  {
    name: "Face Wash",
    label: "Cleanse",
    href: "/products?category=face-wash",
    image: "/images/cat-face-wash.webp",
    blobColor: "#C8DFC8",
    blobColor2: "#B2CEB2",
  },
  {
    name: "Soap",
    label: "Purify",
    href: "/products?category=soap",
    image: "/images/cat-soap.webp",
    blobColor: "#DDD0EA",
    blobColor2: "#C8B8DC",
  },
  {
    name: "Nalangu Maavu",
    label: "Heritage",
    href: "/products?category=nalangu-maavu",
    image: "/images/cat-nalangu-maavu.webp",
    blobColor: "#F0E0A8",
    blobColor2: "#E8D090",
  },
];

/* ─────────────────────────────────────────────
   Individual Category Card
───────────────────────────────────────────── */
function CategoryCard({
  cat,
}: {
  cat: (typeof categories)[number];
}) {
  return (
    <Link
      href={cat.href}
      className="shrink-0 snap-center flex flex-col items-center gap-2.5 group active:scale-95 transition-transform duration-200"
      style={{ width: "108px" }}
    >
      {/* Card with blob + product image */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          height: "120px",
          borderRadius: "20px",
          background: `radial-gradient(circle at 40% 55%, ${cat.blobColor} 0%, ${cat.blobColor2} 55%, rgba(255,255,255,0.6) 100%)`,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Organic blob shape overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 50% 60%, ${cat.blobColor} 0%, transparent 70%)`,
            opacity: 0.6,
          }}
          aria-hidden="true"
        />
        {/* Product image — centered, cropped to fill lower 80% */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <Image
            src={cat.image}
            alt={cat.name}
            width={90}
            height={100}
            className="object-contain object-bottom transition-transform duration-500 group-active:scale-105"
            style={{ maxHeight: "100px" }}
          />
        </div>
      </div>

      {/* Pill label */}
      <span
        className="text-center"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 500,
          color: "#3A2418",
          letterSpacing: "0.02em",
        }}
      >
        {cat.name}
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Main export — mobile only
───────────────────────────────────────────── */
export default function MobileCategoryScroll() {
  return (
    <div className="block md:hidden w-full" style={{ background: "#FDF6F0" }}>
      {/* Section label */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
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
          Shop By Category
        </span>
        <Link
          href="/products"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#8B3A5E",
            textDecoration: "none",
          }}
        >
          See All
        </Link>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3 px-5 pb-5"
        style={{ scrollPaddingLeft: "20px" }}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} />
        ))}
      </div>
    </div>
  );
}
