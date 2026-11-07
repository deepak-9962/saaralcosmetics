"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductSpecification } from "@/lib/types";

interface ProductOtherInfoAccordionProps {
  items?: ProductSpecification[] | null;
  defaultOpen?: boolean;
}

export default function ProductOtherInfoAccordion({
  items,
  defaultOpen = true,
}: ProductOtherInfoAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  // Filter out any entries without both label and value
  const validItems = items.filter(
    (item) => item && item.label && item.label.trim() && item.value && item.value.trim()
  );

  if (validItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full mt-8 md:mt-12" aria-labelledby="other-info-heading">
      {/* Top divider border with subtle aesthetic styling */}
      <div className="border-t border-[#8B9E78]/35 pt-4">
        {/* Accordion header button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-2 text-left group cursor-pointer select-none"
          aria-expanded={isOpen}
          aria-controls="other-info-content"
        >
          <h3
            id="other-info-heading"
            className="font-display text-[22px] md:text-[26px] font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors"
          >
            Other Information
          </h3>

          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 bg-[#E8EAE3] text-[#55634D] ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              keyboard_arrow_down
            </span>
          </div>
        </button>

        {/* Bottom divider line under title */}
        <div className="border-b border-[#8B9E78]/35 pb-2" />

        {/* Collapsible content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id="other-info-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="py-5 sm:py-6 space-y-2.5 font-body text-[14.5px] md:text-[15.5px] leading-[1.65] text-[#2C2623]">
                {validItems.map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-semibold text-on-surface shrink-0">
                      {spec.label.trim()}:
                    </span>
                    <span className="text-on-surface-variant/90">
                      {spec.value.trim()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

