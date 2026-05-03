"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * useGsapReveal — Apple-style staggered scroll reveal.
 * Attach the returned ref to any container element.
 * All direct children will animate in with a 0.05s stagger — cinematic, physical feel.
 *
 * Usage:
 *   const ref = useGsapReveal();
 *   <section ref={ref}>...</section>
 */
export function useGsapReveal<T extends HTMLElement = HTMLElement>(
  options: { stagger?: number; duration?: number; yOffset?: number; selector?: string } = {}
) {
  const ref = useRef<T>(null);

  const { stagger = 0.05, duration = 0.7, yOffset = 32, selector = ":scope > *" } = options;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const elements = container.querySelectorAll(selector);
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: yOffset },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [stagger, duration, yOffset, selector]);

  return ref;
}
