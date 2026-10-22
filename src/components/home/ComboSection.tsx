import Link from "next/link";
import FadeIn from "@/components/layout/FadeIn";
import ComboCard from "./ComboCard";
import BestsellersCarousel from "./BestsellersCarousel";
import type { ComboWithProducts } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, delay, ease },
});

/* Sweeping organic arch SVG — responsive asymmetrical curve matching page design */
function ScallopArch() {
  const mobileD = "M0,55 C130,55 270,10 400,45";
  const mobileFill = "M0,55 C130,55 270,10 400,45 L400,60 L0,60 Z";

  return (
    <div
      className="block md:hidden w-full overflow-hidden pointer-events-none"
      style={{ marginTop: "-45px", height: "45px" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "45px" }}
      >
        <path d={mobileFill} fill="#FAF0EE" />
        <path d={mobileD} fill="none" stroke="#C9A74D" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" />
        <path d={mobileD} fill="none" stroke="#FFFFFF" strokeWidth="1.0" opacity="0.95" strokeLinecap="round" />
      </svg>
    </div>
  );
}

interface ComboSectionProps {
  combos?: ComboWithProducts[];
}

export default function ComboSection({ combos = [] }: ComboSectionProps) {
  if (!combos || combos.length === 0) {
    return null;
  }

  return (
    <section
      id="combos"
      className="relative w-full scroll-mt-20"
      style={{ background: "#FAF0EE" }}
      aria-label="Curated Combos"
    >
      <ScallopArch />
      <div className="max-w-[1280px] mx-auto px-5 md:px-[72px] pt-12 pb-4 md:pt-16 md:pb-6">
        <FadeIn
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4"
          {...fadeUp(0)}
        >
          <div>
            <span className="label-caps text-[#C9A74D] block mb-3">Special Pairings</span>
            <h2
              className="font-display text-[#2A1A14]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              Curated<br />Combo Sets
            </h2>
          </div>
          <Link
            href="/products"
            className="label-caps text-[#B06080] inline-flex items-center gap-2 hover:gap-3 transition-all duration-300 group"
          >
            View All Products{" "}
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </FadeIn>

        <BestsellersCarousel>
          {combos.map((combo, index) => (
            <div
              key={combo.id}
              className="snap-center shrink-0 w-[260px] md:snap-align-none md:shrink md:w-auto h-full"
            >
              <ComboCard combo={combo} index={index} />
            </div>
          ))}
        </BestsellersCarousel>
      </div>
    </section>
  );
}
