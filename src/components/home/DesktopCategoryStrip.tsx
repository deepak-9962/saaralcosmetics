import Image from "next/image";
import Link from "next/link";
import type { HomepageCategory } from "@/lib/types";

interface DesktopCategoryStripProps {
  categories?: HomepageCategory[];
}

export default function DesktopCategoryStrip({ categories = [] }: DesktopCategoryStripProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

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
        className="max-w-[1440px] mx-auto"
        style={{ padding: "12px 32px 36px" }}
      >
        {/* ── Eyebrow label ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-6 shrink-0" style={{ background: "#C9A74D" }} />
          <span
            className="font-body text-[10px] tracking-[0.22em] uppercase font-semibold"
            style={{ color: "#C9A74D" }}
          >
            Shop By Category
          </span>
        </div>

        {/* ── Category grid: calm, static, lightweight ── */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-x-2 gap-y-6 lg:gap-y-0 justify-items-center">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={cat.link_url || "/products"}
              aria-label={`Browse ${cat.title}`}
              className="group flex flex-col items-center gap-2.5 cursor-pointer w-full"
            >
              {/*
                Outer wrapper: calm, steady presentation.
                Subtle 2px hover elevation without bounce, oscillation, or excessive scaling.
              */}
              <div
                className="relative flex items-end justify-center transition-transform duration-200 ease-out group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                style={{
                  width: "126px",
                  height: "148px",
                }}
              >
                {/* Pastel blob circle — sits at bottom of wrapper */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-shadow duration-200 motion-reduce:transition-none group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  style={{
                    width: "112px",
                    height: "112px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 42% 52%, ${cat.blob_color || "#F2D5C0"} 0%, ${cat.blob_color2 || "#EEC4A8"} 60%, rgba(255,255,255,0.45) 100%)`,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.9) inset",
                    border: "1.5px solid rgba(255,255,255,0.80)",
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

                {/* Product image — static, calm, no bounce or aggressive zoom */}
                <Image
                  src={cat.image_url}
                  alt={cat.title}
                  width={104}
                  height={130}
                  {...(index === 0
                    ? { priority: true, fetchPriority: "high" as const }
                    : { loading: "lazy" as const })}
                  className="relative z-10"
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom",
                    maxHeight: "130px",
                    width: "auto",
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.09))",
                  }}
                />
              </div>

              {/* Pill label — white bg, dusty-rose border, arrow with gentle color transition */}
              <div
                className="flex items-center gap-1 px-3 py-[5px] transition-all duration-200 group-hover:border-[#B06080] group-hover:bg-[#FFF9F7] motion-reduce:transition-none"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D4A0B0",
                  borderRadius: "100px",
                  boxShadow: "0 1px 4px rgba(180,100,130,0.08)",
                  minWidth: "86px",
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
                  {cat.title}
                </span>
                <svg
                  width="7"
                  height="7"
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
