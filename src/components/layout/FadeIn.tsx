"use client";

import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";

interface AnimationValues {
  opacity?: number;
  y?: number;
  x?: number;
  scale?: number;
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Starting animation values — accepts object or string (variants key, treated as simple fade) */
  initial?: AnimationValues | string;
  /** Animate on viewport entry (matches framer-motion whileInView) */
  whileInView?: AnimationValues;
  /** Animate immediately on mount — accepts object or string (variants key, treated as simple fade) */
  animate?: AnimationValues | string;
  /** Viewport options (matches framer-motion viewport) */
  viewport?: { once?: boolean; amount?: number };
  /** Transition options (matches framer-motion transition) */
  transition?: { duration?: number; delay?: number; ease?: readonly number[] | number[] };
  /** Variants — accepted for compatibility but not fully implemented (falls back to simple fade) */
  variants?: Record<string, unknown>;
  /** Allow any extra props from existing usage */
  [key: string]: unknown;
}

/**
 * Lightweight replacement for framer-motion's <motion.div> with whileInView/animate.
 * Uses IntersectionObserver instead of shipping the entire framer-motion library
 * on the critical path (~60 KiB saved).
 *
 * Supports two modes:
 * 1. `whileInView` — animates when element enters viewport (IntersectionObserver)
 * 2. `animate` — animates immediately on mount
 */
export default function FadeIn({
  children,
  className,
  style,
  initial: initialProp,
  whileInView,
  animate: animateProp,
  viewport,
  transition,
  variants: _variants,
  ...rest
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Normalize string-based props (from variants pattern) to objects
  const initial: AnimationValues | undefined =
    typeof initialProp === "string" ? { opacity: 0, y: 20 } :
    initialProp ?? undefined;
  const animateOnMount: AnimationValues | undefined =
    typeof animateProp === "string" ? { opacity: 1, y: 0 } :
    animateProp ?? undefined;

  // Determine which end-state to use
  const endState = whileInView ?? animateOnMount;
  const useViewport = !!whileInView;

  const startOpacity = initial?.opacity ?? 0;
  const startY = initial?.y ?? (endState?.y !== undefined ? initial?.y ?? 0 : 36);
  const startX = initial?.x ?? 0;
  const startScale = initial?.scale ?? 1;

  const endOpacity = endState?.opacity ?? 1;
  const endY = endState?.y ?? 0;
  const endX = endState?.x ?? 0;
  const endScale = endState?.scale ?? 1;

  const duration = transition?.duration ?? 0.75;
  const delay = transition?.delay ?? 0;
  const once = viewport?.once ?? true;
  const amount = viewport?.amount ?? 0.2;

  useEffect(() => {
    // If animate prop (not whileInView), trigger immediately after mount
    if (!useViewport) {
      // Use a small delay to ensure CSS transition fires
      const id = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: amount }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [useViewport, once, amount]);

  // Filter out framer-motion-specific props that shouldn't go to the DOM
  const {
    initial: _i,
    whileInView: _w,
    viewport: _v,
    transition: _t,
    animate: _a,
    ...safeRest
  } = rest as Record<string, unknown>;
  void _i; void _w; void _v; void _t; void _a;

  const transforms: string[] = [];
  if (startY !== 0 || endY !== 0) {
    transforms.push(`translateY(${isVisible ? endY : startY}px)`);
  }
  if (startX !== 0 || endX !== 0) {
    transforms.push(`translateX(${isVisible ? endX : startX}px)`);
  }
  if (startScale !== 1 || endScale !== 1) {
    transforms.push(`scale(${isVisible ? endScale : startScale})`);
  }

  const animatedStyle: CSSProperties = {
    ...style,
    opacity: isVisible ? endOpacity : startOpacity,
    transform: transforms.length > 0 ? transforms.join(" ") : undefined,
    transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={animatedStyle} {...safeRest}>
      {children}
    </div>
  );
}
