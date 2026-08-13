import { motion } from "framer-motion";
import { EASE, FadeUp, Reveal } from "../v2/cinematic";

// Single-observer stagger — one trigger for the whole row so no card is left
// stranded at opacity 0 on a fast scroll (per-item whileInView + delay can be).
const cardsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const STEPS = [
  {
    n: "01",
    title: "Hold STT",
    body: "Your tokenized silver is the collateral. It stays yours the whole time — nothing is sold today.",
    tag: "STT",
  },
  {
    n: "02",
    title: "Pick your sell price",
    body: "Choose a silver price you'd happily sell at. The further above spot, the safer your silver — the closer, the fatter the premium.",
    tag: "STT",
  },
  {
    n: "03",
    title: "Collect USDT upfront",
    body: "The premium lands in USDT the moment you enter. Silver stays below your price? Keep the STT and the cash both.",
    tag: "USDT",
  },
];

export default function HowItWorks({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Silver in.</Reveal>
          <Reveal delay={0.06} className="text-brand-teal">
            Dollars upfront.
          </Reveal>
        </h2>

        <motion.div
          className="mt-12 grid gap-4 md:grid-cols-3"
          variants={cardsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              variants={cardItem}
              className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-silver-600">{s.n}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                    s.tag === "USDT"
                      ? "bg-brand-teal/10 text-brand-teal"
                      : "bg-white/[0.06] text-silver-300"
                  }`}
                >
                  {s.tag}
                </span>
              </div>
              <h3 className="mt-8 text-xl font-medium text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-silver-400">
                {s.body}
              </p>
              {i < STEPS.length - 1 && (
                <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-silver-700 md:block">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        <FadeUp delay={0.2}>
          <div className="mt-6 rounded-2xl border border-brand-teal/20 bg-gradient-to-br from-brand-blue/[0.06] to-brand-teal/[0.04] p-7 text-center">
            <p className="text-lg text-silver-200">
              It's the oldest trade in the silver market — sell high, get paid
              now — wrapped around your <span className="text-white">STT</span>.
            </p>
            <button
              onClick={onStart}
              className="mt-5 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              Start earning USDT
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
