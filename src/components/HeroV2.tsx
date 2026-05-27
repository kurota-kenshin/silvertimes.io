import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  useSilverPriceStore,
  getFormattedAPY,
} from "../store/silverPriceStore";

const WAITLIST_URL = "https://forms.gle/2E73WEAJfgEFUngU6";

// Subtle film grain — gives the video a cinematic, graded texture.
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const footnotes = [
  {
    n: 1,
    sources: [
      { label: "CPM Group", href: "https://cpmgroup.com/how-much-silver-is-above-ground/" },
      { label: "LBMA", href: "https://www.lbma.org.uk/prices-and-data/precious-metal-prices#/" },
    ],
  },
  { n: 2, sources: [{ label: "RWA.xyz", href: "https://app.rwa.io/category/commodities/precious-metals" }] },
  {
    n: 3,
    sources: [
      {
        label: "Silver Institute",
        href: "https://silverinstitute.org/global-silver-investment-to-remain-strong-in-2026-against-the-backdrop-of-a-sixth-consecutive-annual-market-deficit/",
      },
    ],
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// A single line of headline that wipes up from behind a mask.
function RevealLine({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function HeroV2() {
  const { currentPrice, isLoading, fetchData } = useSilverPriceStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const priceDisplay = isLoading
    ? "—"
    : currentPrice
    ? `$${currentPrice.toFixed(2)}/oz`
    : "$86.75/oz";

  const stats = [
    { value: "$3.9 T", label: "Global Silver Market", note: 1 },
    { value: priceDisplay, label: "Current Price", note: 1 },
    { value: "99.9%", label: "Yet To Be Tokenized", note: 2 },
    { value: "6th", label: "Year of Market Deficit", note: 3 },
    { value: getFormattedAPY(currentPrice), label: "Silver 4-Yrs Avg. Return", note: 1 },
  ];

  return (
    <section className="relative flex h-[100svh] min-h-[680px] flex-col overflow-hidden bg-black">
      {/* Cinematic background video with a slow horizontal pan */}
      <video
        className="hero-pan absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/silver_v2.webp"
      >
        <source src="/hero_video.mp4" type="video/mp4" />
      </video>

      {/* Colour grade: directional darken (heavier bottom-left for type legibility) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(0,0,0,0.65)_100%)]" />
      {/* Soft brand glow */}
      <div className="pointer-events-none absolute bottom-[18%] left-[8%] h-[45vh] w-[55vw] rounded-full bg-brand-blue/10 blur-[150px]" />
      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN}")` }}
      />

      {/* ── Editorial copy, anchored bottom-left ─────────────── */}
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-10 sm:px-10 lg:px-16">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="mb-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-teal" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-silver-200">
            $STT Waitlist Now Open
          </span>
        </motion.div>

        {/* Oversized headline */}
        <h1 className="text-[clamp(3rem,11vw,9rem)] font-bold leading-[0.92] tracking-[-0.03em] text-white" style={{ textShadow: "0 4px 60px rgba(0,0,0,0.5)" }}>
          <RevealLine delay={0.25}>It's</RevealLine>
          <RevealLine delay={0.38} className="gradient-text">Silver Times</RevealLine>
        </h1>

        {/* Subheading + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
          className="mt-8 flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10"
        >
          <p className="text-[clamp(1.05rem,2.4vw,1.6rem)] font-light text-silver-200">
            Silver On-chain, fully backed
          </p>
          <a
            href={WAITLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-white px-9 py-4 text-base font-semibold text-black shadow-[0_10px_50px_-12px_rgba(255,255,255,0.55)] transition-transform duration-300 hover:scale-[1.04]"
          >
            Join Waitlist
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* ── Market-data rail ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.15, ease: EASE }}
        className="relative z-20 border-t border-white/[0.08] bg-gradient-to-t from-black/85 to-transparent pt-5 backdrop-blur-[2px]"
      >
        <div className="scrollbar-hide flex justify-start gap-0 overflow-x-auto px-6 sm:px-10 lg:px-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex shrink-0 flex-col px-6 first:pl-0 sm:px-8 ${index !== 0 ? "border-l border-white/10" : ""}`}
            >
              <span className="text-2xl font-bold tracking-tight text-white lg:text-3xl">{stat.value}</span>
              <span className="mt-1.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-silver-400">
                {stat.label}
                <sup className="ml-0.5 text-[8px] text-silver-500">[{stat.note}]</sup>
              </span>
            </div>
          ))}
        </div>

        {/* Footnote sources */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/[0.06] px-6 py-3 text-[10px] text-silver-500 sm:px-10 lg:px-16">
          {footnotes.map((fn) => (
            <span key={fn.n} className="inline-flex items-center gap-1.5">
              <span className="text-silver-400">[{fn.n}]</span>
              {fn.sources.map((s, i) => (
                <span key={s.href} className="inline-flex items-center">
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 transition-colors hover:text-brand-blue hover:underline">
                    {s.label}
                  </a>
                  {i < fn.sources.length - 1 && <span className="px-1 text-silver-700">·</span>}
                </span>
              ))}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Cinematic fade-from-black intro */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    </section>
  );
}
