"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiTrigger() {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#B06080", "#7E6B9A", "#ffffff"],
    });
  }, []);

  return null;
}
