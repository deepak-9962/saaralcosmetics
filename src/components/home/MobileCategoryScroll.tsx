import Link from "next/link";
import Image from "next/image";
import type { HomepageCategory } from "@/lib/types";

interface MobileCategoryScrollProps {
  categories?: HomepageCategory[];
}

function CategoryCard({
  cat,
  index,
}: {
  cat: HomepageCategory;
  index: number;
}) {
  return (
    <Link
      href={cat.link_url || "/products"}
      className="shrink-0 snap-center flex flex-col items-center active:scale-98 transition-transform duration-150 motion-reduce:transform-none"
      style={{ width: "90px" }}
    >
      {/* Outer wrapper — steady, calm presentation */}
      <div
        className="relative flex items-end justify-center"
        style={{
          width: "82px",
          height: "88px",
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
            background: `radial-gradient(circle at 42% 52%, ${cat.blob_color || "#F2D5C0"} 0%, ${cat.blob_color2 || "#EEC4A8"} 60%, rgba(255,255,255,0.45) 100%)`,
            boxShadow: "0 4px 14px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
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

        {/* Product image — calm, clean */}
        <Image
          src={cat.image_url}
          alt={cat.title}
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
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.10))",
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
          {cat.title}
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

export default function MobileCategoryScroll({ categories = [] }: MobileCategoryScrollProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div
      className="block md:hidden w-full"
      style={{ background: "#FDF6F0", paddingTop: "2px", paddingBottom: "0px" }}
    >
      <div
        className="overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3 px-5"
        style={{ scrollPaddingLeft: "20px", paddingTop: "2px", paddingBottom: "10px" }}
      >
        {categories.map((cat, index) => (
          <CategoryCard key={cat.id} cat={cat} index={index} />
        ))}
      </div>
    </div>
  );
}
