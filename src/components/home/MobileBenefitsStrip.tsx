/* MobileBenefitsStrip — 3-column benefits strip
   🌿 Herbal Ingredients | ✔ Beginner Friendly | 🧪 Clinically Tested
   Matching reference: thin vertical separators, minimal monochrome style */

const benefits = [
  {
    emoji: "🌿",
    label: "Herbal",
    sublabel: "Ingredients",
  },
  {
    emoji: "✔",
    label: "Beginner",
    sublabel: "Friendly",
  },
  {
    emoji: "🧪",
    label: "Clinically",
    sublabel: "Tested",
  },
];

export default function MobileBenefitsStrip() {
  return (
    <div
      className="block md:hidden w-full"
      style={{ padding: "12px 16px 0" }}
      aria-label="Product benefits"
    >
      <div
        style={{
          background: "rgba(255,255,255,0.55)",
          borderRadius: "14px",
          border: "1px solid rgba(201,167,77,0.14)",
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        {benefits.map((b, i) => (
          <div
            key={b.label}
            className="flex flex-col items-center justify-center"
            style={{
              flex: 1,
              padding: "12px 6px",
              borderLeft: i > 0 ? "1px solid rgba(42,26,20,0.10)" : "none",
              gap: "4px",
            }}
          >
            {/* Icon / emoji */}
            <span
              style={{
                fontSize: "18px",
                lineHeight: 1,
                display: "block",
                marginBottom: "2px",
              }}
              aria-hidden="true"
            >
              {b.emoji}
            </span>

            {/* Label — two lines */}
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9.5px",
                fontWeight: 600,
                color: "#3A2418",
                letterSpacing: "0.02em",
                textAlign: "center",
                lineHeight: 1.3,
                display: "block",
              }}
            >
              {b.label}
              <br />
              <span style={{ fontWeight: 400, color: "rgba(42,26,20,0.60)" }}>
                {b.sublabel}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
