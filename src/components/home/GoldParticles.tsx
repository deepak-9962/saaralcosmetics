"use client";

import { motion } from "framer-motion";

const particles = [
  { size: 6, top: "22%", right: "35%", delay: 0 },
  { size: 10, top: "58%", right: "24%", delay: 1.2 },
  { size: 8, top: "42%", right: "14%", delay: 2.8 },
  { size: 12, top: "18%", right: "20%", delay: 0.6 },
  { size: 5, top: "72%", right: "40%", delay: 2.0 },
];

export default function GoldParticles() {
  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            right: p.right,
            background: "radial-gradient(circle, rgba(255,238,190,0.85) 0%, rgba(201,167,77,0.12) 80%)",
            boxShadow: "0 0 8px rgba(255,225,160,0.35)",
            zIndex: 15,
          }}
          animate={{
            y: [-14, 14, -14],
            x: [-7, 7, -7],
            opacity: [0.3, 0.75, 0.3],
            scale: [0.92, 1.08, 0.92],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}
