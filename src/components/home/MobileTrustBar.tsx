/* MobileTrustBar — olive green marquee trust bar, mobile-only, pure server component */

const trustItems = [
  "Made For Indian Skin",
  "100% Natural Ingredients",
  "Dermatologically Tested",
  "Trusted By Thousands",
  "Free Shipping Above ₹999",
  "Cruelty Free",
  "Ethically Sourced",
  "Handcrafted in Tamil Nadu",
];

/* Duplicate for seamless CSS marquee loop */
const marqueeItems = [...trustItems, ...trustItems];

export default function MobileTrustBar() {
  return (
    <div
      className="block md:hidden w-full overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #3D4F2E 0%, #4A5E3A 50%, #3D4F2E 100%)",
        height: "36px",
      }}
      aria-label="Trust signals"
    >
      <div
        className="flex items-center h-full whitespace-nowrap"
        style={{ animation: "mobile-trust-marquee 30s linear infinite" }}
      >
        {marqueeItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 shrink-0"
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#F0EAD6",
              }}
            >
              {item}
            </span>
            <span
              aria-hidden="true"
              style={{
                color: "#A8C080",
                fontSize: "8px",
                margin: "0 20px 0 0",
                opacity: 0.7,
              }}
            >
              ✦
            </span>
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
