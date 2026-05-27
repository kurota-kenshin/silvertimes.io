import type { ReactNode } from "react";
import { motion } from "framer-motion";

// Shared cinematic primitives for the redesigned (v2) homepage.
// Keeps the hero's visual language consistent across every section.

export const EASE = [0.16, 1, 0.3, 1] as const;

// Subtle film grain — graded, filmic texture over dark sections.
export const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Grain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
      style={{ backgroundImage: `url("${GRAIN}")` }}
    />
  );
}

// Pill chip with a live pulsing dot — matches the hero eyebrow.
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-teal" />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-silver-200">
        {children}
      </span>
    </span>
  );
}

// A line of type that wipes up from behind a mask.
// `scroll` triggers it when scrolled into view; otherwise it plays on mount.
// The scroll observer is attached to the (stable) mask wrapper rather than the
// transformed inner span, so the reveal fires reliably and never leaves the
// text stuck below the mask.
export function Reveal({
  children,
  delay = 0,
  className = "",
  scroll = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  scroll?: boolean;
}) {
  const trigger = scroll
    ? { initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, amount: 0.3 } }
    : { initial: "hidden" as const, animate: "show" as const };

  return (
    <motion.span className="block overflow-hidden pb-[0.06em]" {...trigger}>
      <motion.span
        className={`block ${className}`}
        variants={{
          hidden: { y: "115%" },
          show: { y: 0, transition: { duration: 1.1, ease: EASE, delay } },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

// Fade + rise wrapper for non-text blocks (chips, media, paragraphs).
export function FadeUp({
  children,
  delay = 0,
  y = 18,
  className = "",
  scroll = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  scroll?: boolean;
}) {
  const motionProps = scroll
    ? { initial: { opacity: 0, y }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 } }
    : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div className={className} {...motionProps} transition={{ duration: 0.9, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}
