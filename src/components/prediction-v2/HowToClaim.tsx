import { FadeUp, Reveal } from "../v2/cinematic";
import ClaimPanel from "./ClaimPanel";

const steps = [
  {
    n: "01",
    t: "Finish in the top 5",
    d: "Each trading day the 5 closest predictions win 5 USDT. Your winnings build up in your balance.",
  },
  {
    n: "02",
    t: "Set your withdrawal wallet",
    d: "Add a BSC (BNB Smart Chain) wallet address in your profile. That's the only requirement — no minimum, no social handles.",
  },
  {
    n: "03",
    t: "Press Claim",
    d: "Hit Claim and we queue a payout. Nothing is sent automatically — you're always in control.",
  },
  {
    n: "04",
    t: "Receive USDT on BSC",
    d: "We transfer BEP-20 USDT to your wallet and you'll see the transaction hash in your claim history.",
  },
];

export default function HowToClaim() {
  return (
    <section className="relative">
      <h3 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold leading-[1.05]">
        <Reveal>How to claim</Reveal>
      </h3>

      <ClaimPanel embedded />

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
        {steps.map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.06}>
            <div className="h-full bg-background-secondary/60 p-7">
              <div className="font-mono text-sm text-brand-sky">{s.n}</div>
              <h4 className="mt-4 text-lg font-semibold text-white">{s.t}</h4>
              <p className="mt-2 text-sm leading-relaxed text-silver-400">
                {s.d}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
