import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";

type FaqItem = {
  q: string;
  a: ReactNode;
  bullets?: { label: string; value: string }[];
};

const faqs: FaqItem[] = [
  {
    q: "What is $STT and how is it valued?",
    a: "$STT is a digital token where 1 $STT is pegged to the exact value of 1 oz of silver (quoted in USDT). It is 1:1 backed by real silver assets and institutional-grade infrastructure.",
  },
  {
    q: "Where is the physical silver stored?",
    a: "The physical silver backing $STT is securely stored at Brinks in London. Monthly storage slips are provided to ensure complete transparency.",
  },
  {
    q: "Can I redeem $STT for physical silver?",
    a: "Yes. You can trade $STT 24/7 on exchanges or redeem it for physical LBMA Good Delivery bars from designated vaults.",
    bullets: [
      { label: "Redemption Fee", value: "0.35% (for SilverTimes certified bars)" },
      { label: "Processing Time", value: "Typically 3-5 business days" },
    ],
  },
  {
    q: "How does $STT track the real-time price of silver?",
    a: "We utilize HashKey oracles to feed real-time spot and futures data into our system. This ensures $STT remains tightly aligned to the actual price of silver via automated rebalancing thresholds.",
  },
  {
    q: "How do I mint $STT and what are the fees?",
    a: "To mint $STT, users must undergo KYC (Identity verification) at designated facilities and deposit fiat or eligible collateral.",
    bullets: [
      { label: "Minting Fee", value: "1%" },
      { label: "Minimum Requirement", value: "1 ton of silver for minting" },
    ],
  },
  {
    q: "Is the platform secure and audited?",
    a: (
      <>
        Yes. $STT operates on the <span className="font-medium text-white">Ethereum</span> network
        using open-source smart contracts. We maintain 1:1 backing that is verifiable through
        Proof-of-Reserves and on-chain dashboards. Security audits are conducted by Bosein, with an
        annual report and monthly Proof-of-Reserves reporting.
      </>
    ),
  },
];

export default function FAQV2() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[40vh] w-[55vw] -translate-x-1/2 rounded-full bg-brand-teal/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Centered heading */}
        <FadeUp className="mb-7 flex justify-center">
          <Eyebrow>FAQ</Eyebrow>
        </FadeUp>

        <h2 className="text-center text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
          <Reveal>Questions,</Reveal>
          <Reveal delay={0.08} className="gradient-text">
            answered
          </Reveal>
        </h2>

        {/* Accordion */}
        <FadeUp delay={0.15} y={28} className="mt-16 border-t border-white/10">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="border-b border-white/10">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-lg font-medium transition-colors ${
                      isOpen ? "text-white" : "text-silver-200"
                    } group-hover:text-white`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 border-brand-teal/40 bg-brand-blue/10 text-brand-sky"
                        : "border-white/15 text-silver-400"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="pb-7 pr-12 text-[15px] leading-relaxed text-silver-400">
                        <p>{item.a}</p>
                        {item.bullets && (
                          <ul className="mt-4 space-y-2">
                            {item.bullets.map((b) => (
                              <li key={b.label} className="flex gap-2.5">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-teal/70" />
                                <span>
                                  <span className="font-medium text-silver-200">{b.label}:</span>{" "}
                                  {b.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </FadeUp>
      </div>
    </section>
  );
}
