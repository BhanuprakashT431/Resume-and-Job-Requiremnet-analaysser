/**
 * components/SplitText.tsx
 *
 * Splits a string into individual words. Each word is wrapped in an
 * overflow:hidden mask so the word can slide up from below, creating
 * the classic "text curtain reveal" effect.
 *
 * Usage:
 *   <SplitText delay={0.1} stagger={0.07} className="text-6xl font-extrabold">
 *     Bridge the gap between you
 *   </SplitText>
 */
"use client";

import React, { useRef, useEffect, useState, ReactNode } from "react";

interface SplitTextProps {
  children: string;
  className?: string;
  /** Seconds before the first word starts animating (default 0) */
  delay?: number;
  /** Additional stagger seconds between each word (default 0.06) */
  stagger?: number;
  /** Whether to trigger only when scrolled into view (default true) */
  scrollTrigger?: boolean;
  /** Threshold for scroll trigger (default 0.1) */
  threshold?: number;
}

export default function SplitText({
  children,
  className = "",
  delay = 0,
  stagger = 0.06,
  scrollTrigger = true,
  threshold = 0.1,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(!scrollTrigger);

  useEffect(() => {
    if (!scrollTrigger) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollTrigger, threshold]);

  const words = children.split(" ");

  return (
    <span ref={ref} className={`inline ${className}`} aria-label={children}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden leading-[1.15]"
          aria-hidden
        >
          <span
            className="inline-block"
            style={{
              transform: triggered ? "translateY(0)" : "translateY(110%)",
              opacity: triggered ? 1 : 0,
              transition: `transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease`,
              transitionDelay: `${delay + i * stagger}s`,
            }}
          >
            {word}
            {/* Add a non-breaking space after each word except the last */}
            {i < words.length - 1 && "\u00A0"}
          </span>
        </span>
      ))}
    </span>
  );
}
