"use client";

import { useEffect, useRef } from "react";
import { mountHeroBackground } from "@/lib/hero-background";

export function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => mountHeroBackground(ref.current), []);
  return <canvas ref={ref} className="hero-background" aria-hidden="true" />;
}
