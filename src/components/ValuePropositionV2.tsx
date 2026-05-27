import type { ReactNode } from "react";
import { Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";

// Clean line-style icons matching the referenced Flaticon concepts.
const icons: Record<string, ReactNode> = {
  pie: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12V3" />
      <path d="M12 12l8.2 2.6" />
    </svg>
  ),
  lock: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M8 10.5V7.2a4 4 0 0 1 8 0v3.3" />
      <circle cx="12" cy="15.3" r="1.15" />
      <path d="M12 16.4v1.6" />
    </svg>
  ),
  money: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M12 5.7v4.6M10.7 6.4a1.4 1.4 0 0 1 2.6.2M13.3 9.6a1.4 1.4 0 0 1-2.6-.2" />
      <path d="M3 15.5c1.8 0 2.8 1.4 4.6 1.4H13a1.5 1.5 0 0 0 0-3H9.6" />
      <path d="M3 15v4.5" />
    </svg>
  ),
  eth: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 6 12l6 3.5L18 12 12 2.5Z" />
      <path d="M6 13.4 12 16.9l6-3.5L12 21.5 6 13.4Z" />
    </svg>
  ),
};

const benefits = [
  {
    icon: "pie",
    title: "Fractional Ownership",
    description:
      "Get silver exposure with a lower entry barrier through blockchain technology, letting you start small, diversify easily, and scale your position over time.",
  },
  {
    icon: "lock",
    title: "Transparent and Secure",
    description:
      "Verifiable on-chain and fully transparent. Each token is backed 1:1 by real silver and can be audited through immutable blockchain records. Silver is securely stored with Brink's, with clear custody and auditability.",
  },
  {
    icon: "money",
    title: "Liquidity Without Lockups",
    description:
      "Enjoy 24/7 token transfers, enabling instant exits or rebalancing, so you keep liquidity while maintaining exposure to silver, always securely.",
  },
  {
    icon: "eth",
    title: "Issued on Ethereum",
    description:
      "We chose the ERC-20 token standard to ensure broad wallet and exchange support, making access and integrations straightforward for most users.",
  },
];

export default function ValuePropositionV2() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
      <Grain />

      {/* Soft brand glow */}
      <div className="pointer-events-none absolute right-0 top-1/3 h-[42vh] w-[50vw] translate-x-1/4 rounded-full bg-brand-teal/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Heading */}
        <FadeUp className="mb-7">
          <Eyebrow>Why SilverTimes</Eyebrow>
        </FadeUp>

        <h2 className="max-w-4xl text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
          <Reveal>Tokenized silver,</Reveal>
          <Reveal delay={0.08} className="gradient-text">
            backed by physical assets
          </Reveal>
        </h2>

        <FadeUp delay={0.15} className="mt-6 max-w-xl">
          <p className="text-[clamp(0.95rem,1.8vw,1.15rem)] font-light text-silver-400">
            Transforming precious metals into productive digital assets with
            institutional-grade infrastructure.
          </p>
        </FadeUp>

        {/* Benefit cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <FadeUp key={b.title} delay={i * 0.08} y={28} className="h-full">
              <div className="group relative h-full">
                {/* Outer glow on hover */}
                <div className="pointer-events-none absolute -inset-2 rounded-[1.7rem] bg-gradient-to-br from-brand-blue/15 via-brand-teal/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                {/* Gradient hairline frame */}
                <div className="relative h-full rounded-[1.35rem] bg-gradient-to-br from-white/[0.14] via-white/[0.04] to-transparent p-px">
                  <div className="relative flex h-full flex-col rounded-[1.3rem] bg-background-secondary/70 p-8 backdrop-blur-sm transition-colors duration-300">
                    {/* Icon */}
                    <div className="mb-7 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-blue/20 to-brand-teal/5 text-brand-sky">
                      {icons[b.icon]}
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-white">
                      {b.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-silver-400">
                      {b.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
