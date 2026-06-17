import { FadeUp, Reveal } from "../v2/cinematic";

const steps = [
  {
    n: "01",
    t: "Predict by midnight",
    d: "Each trading day, guess tomorrow's noon silver price. Edit until 00:00 London.",
  },
  {
    n: "02",
    t: "Closest five win",
    d: "When the price settles at noon, the 5 closest predictions each win 5 USDT.",
  },
  {
    n: "03",
    t: "Earn points daily",
    d: "Everyone earns closeness points. A daily streak multiplies them up to 2×.",
  },
  {
    n: "04",
    t: "Claim on BSC",
    d: "Withdraw your USDT winnings to your wallet on BSC — no minimum.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-[1.0]">
          <Reveal>How it works</Reveal>
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
          {steps.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.06}>
              <div className="h-full bg-background-primary p-8">
                <div className="font-mono text-sm text-brand-sky">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-silver-400">
                  {s.d}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
