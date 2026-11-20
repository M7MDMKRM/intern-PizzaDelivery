"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Lenis with optimal settings from Nick Ho website
    const lenis = new Lenis({
      lerp: 0.08, // Ultra-smooth inertia easing
      wheelMultiplier: 0.85,
      gestureOrientation: "vertical",
      syncTouch: false, // native momentum on mobile
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
