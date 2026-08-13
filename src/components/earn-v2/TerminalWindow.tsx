import type { ReactNode } from "react";

/**
 * Dark terminal-window chrome — SilverTimes' skin on RYSK's ~/folder card.
 * A monospace tab notch sits on top-left; the body carries a faint grid so it
 * reads like a console pane without going light like the RYSK original.
 */
export function TerminalWindow({
  path,
  right,
  children,
  className = "",
}: {
  path: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Tab */}
      <div className="relative z-10 ml-4 inline-flex items-center gap-2.5 rounded-t-xl border border-b-0 border-white/10 bg-[#141414] px-4 py-2 font-mono text-xs text-silver-300">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-teal/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="tracking-tight text-silver-200">{path}</span>
      </div>
      {/* Body */}
      <div className="relative overflow-hidden rounded-xl rounded-tl-none border border-white/10 bg-[#0c0c0c]">
        {/* faint console grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(120% 100% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent" />
        {right && (
          <div className="relative flex items-center justify-end border-b border-white/[0.06] px-5 py-3 sm:px-7">
            {right}
          </div>
        )}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

/** Small circular STT mark — a silver-bar glyph, no emoji. */
export function SttMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal/30 to-brand-blue/20 ring-1 ring-brand-teal/40"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.52}
        height={size * 0.52}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 9.5 8 7h9l3 2.5-4 2.5H7L4 9.5Z"
          fill="url(#stt-bar)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <path
          d="M7 12h9l3 2.5L15 17H6l-3-2.5L7 12Z"
          fill="url(#stt-bar)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="stt-bar" x1="4" y1="7" x2="20" y2="17">
            <stop stopColor="#e9ecef" />
            <stop offset="1" stopColor="#a8adb3" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
