/* MobileBenefitsStrip — 3-column benefits strip
   Herbal Ingredients | Beginner Friendly | Clinically Tested
   Uses clean inline SVG icons instead of emojis/images */

function HerbalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Leaf shape */}
      <path
        d="M12 2C12 2 4 7 4 14a8 8 0 0 0 16 0C20 7 12 2 12 2Z"
        stroke="#4A7C59"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="rgba(74,124,89,0.10)"
      />
      {/* Leaf vein */}
      <path
        d="M12 6v10"
        stroke="#4A7C59"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 10 L9 8M12 13 L15 11"
        stroke="#4A7C59"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BeginnerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Star / sparkle badge */}
      <circle cx="12" cy="12" r="9" stroke="#C9A74D" strokeWidth="1.4" fill="rgba(201,167,77,0.08)" />
      {/* Checkmark */}
      <path
        d="M8 12.5l2.5 2.5L16 9"
        stroke="#C9A74D"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClinicallyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Flask / beaker body */}
      <path
        d="M9 3h6M10 3v5.5L6.5 15A3.5 3.5 0 0 0 10 20h4a3.5 3.5 0 0 0 3.5-5L14 8.5V3"
        stroke="#8B3A5E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(139,58,94,0.08)"
      />
      {/* Bubbles inside flask */}
      <circle cx="11" cy="16" r="1" fill="#8B3A5E" opacity="0.5" />
      <circle cx="13.5" cy="14" r="0.7" fill="#8B3A5E" opacity="0.4" />
    </svg>
  );
}

const benefits = [
  {
    Icon: HerbalIcon,
    label: "Herbal",
    sublabel: "Ingredients",
  },
  {
    Icon: BeginnerIcon,
    label: "Beginner",
    sublabel: "Friendly",
  },
  {
    Icon: ClinicallyIcon,
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
            {/* SVG Icon */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2px" }}>
              <b.Icon />
            </div>

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
