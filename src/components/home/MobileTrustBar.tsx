/* MobileTrustBar — Static social proof card matching reference layout
   Left: ★★★★★ | Center: 1,000+ Happy Customers | Right: Made For Indian Skin
   Mobile only, server component */

export default function MobileTrustBar() {
  return (
    <div
      className="block md:hidden w-full"
      style={{ padding: "6px 16px", background: "#FDF6F0" }}
      aria-label="Customer trust signals"
    >
      <div
        style={{
          background: "#FCEEF2",
          borderRadius: "16px",
          border: "1px solid rgba(139,58,94,0.18)",
          boxShadow: "0 2px 12px rgba(139,58,94,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
          padding: "14px 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* LEFT — Stars */}
        <div
          className="flex-1 flex flex-col items-center gap-1"
          style={{ borderRight: "1px solid rgba(139,58,94,0.2)" }}
        >
          {/* Star row */}
          <div className="flex items-center gap-[2px]" aria-label="5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="#D4804C"
                aria-hidden="true"
              >
                <path d="M8 1.3l1.75 3.54 3.91.57-2.83 2.76.67 3.9L8 10.1l-3.5 1.97.67-3.9L2.34 5.41l3.91-.57L8 1.3z" />
              </svg>
            ))}
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              fontWeight: 700,
              color: "#000000",
              letterSpacing: "0.03em",
            }}
          >
            4.9 / 5 Rating
          </span>
        </div>

        {/* CENTER — Happy Customers */}
        <div
          className="flex-[1.4] flex flex-col items-center gap-0.5"
          style={{ borderRight: "1px solid rgba(139,58,94,0.2)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              fontWeight: 850,
              color: "#000000",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            1,000+
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9.5px",
              fontWeight: 700,
              color: "#000000",
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            Happy Customers
          </span>
        </div>

        {/* RIGHT — Made For India */}
        <div className="flex-1 flex items-center justify-center px-1">
          <div
            style={{
              background: "#2A1A14",
              borderRadius: "5px",
              padding: "4px 8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                fontWeight: 800,
                color: "#FDF6F0",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              MADE FOR INDIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
