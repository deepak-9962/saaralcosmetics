/* MobileTrustBar — Static social proof card matching reference layout
   Left: ★★★★★ | Center: 20,000+ Happy Customers | Right: Made For Indian Skin
   Mobile only, server component */

export default function MobileTrustBar() {
  return (
    <div
      className="block md:hidden w-full"
      style={{ padding: "0 16px 0" }}
      aria-label="Customer trust signals"
    >
      <div
        style={{
          background: "linear-gradient(135deg, #FFFDF8 0%, #FFF8F2 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(201,167,77,0.18)",
          boxShadow: "0 2px 12px rgba(139,58,94,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
          padding: "14px 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* LEFT — Stars */}
        <div
          className="flex-1 flex flex-col items-center gap-1"
          style={{ borderRight: "1px solid rgba(201,167,77,0.22)" }}
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
              fontWeight: 500,
              color: "rgba(42,26,20,0.55)",
              letterSpacing: "0.03em",
            }}
          >
            4.9 / 5 Rating
          </span>
        </div>

        {/* CENTER — Happy Customers */}
        <div
          className="flex-[1.4] flex flex-col items-center gap-0.5"
          style={{ borderRight: "1px solid rgba(201,167,77,0.22)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              fontWeight: 800,
              color: "#2A1A14",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            20,000+
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9.5px",
              fontWeight: 600,
              color: "rgba(42,26,20,0.65)",
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            Happy Customers
          </span>
        </div>

        {/* RIGHT — Made For India */}
        <div className="flex-1 flex flex-col items-center gap-0.5 px-1">
          <div
            style={{
              background: "#2A1A14",
              borderRadius: "5px",
              padding: "2px 6px",
              marginBottom: "3px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                fontWeight: 800,
                color: "#FDF6F0",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              INDIA
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              fontWeight: 500,
              color: "rgba(42,26,20,0.55)",
              letterSpacing: "0.02em",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            Made For
            <br />
            Indian Skin
          </span>
        </div>
      </div>
    </div>
  );
}
