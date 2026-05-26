/* MobileTrustBar — deep wine/mauve luxury marquee trust strip, mobile-only, server component */

const trustItems = [
  "Premium Natural Ingredients",
  "Dermatologically Tested",
  "Cruelty Free",
  "Trusted By Thousands",
  "Free Shipping Above ₹999",
  "Made For Indian Skin",
  "Ethically Sourced",
];

/* Duplicate for seamless CSS marquee loop */
const marqueeItems = [...trustItems, ...trustItems];

export default function MobileTrustBar() {
  return (
    <div
      className="block md:hidden w-full overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #5F3347 0%, #6D3C52 40%, #76485E 100%)",
        height: "34px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      aria-label="Trust signals"
    >
      <div
        className="flex items-center h-full whitespace-nowrap"
        style={{ animation: "mobile-trust-marquee 40s linear infinite" }}
      >
        {marqueeItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center shrink-0"
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#FFF7F4",
              }}
            >
              {item}
            </span>
            {/* Gold dot separator */}
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "#D4AA6D",
                margin: "0 24px",
                opacity: 0.8,
                boxShadow: "0 0 4px rgba(212, 170, 109, 0.4)",
              }}
            />
          </span>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes mobile-trust-marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `
      }} />
    </div>
  );
}
