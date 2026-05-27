import { motion } from "framer-motion";
import { Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";

export default function TokenBackingV2() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
      <Grain />

      {/* Centered heading — breaks the left-aligned rhythm of neighbouring sections */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <FadeUp className="mb-7 flex justify-center">
          <Eyebrow>Reserve Structure</Eyebrow>
        </FadeUp>

        <h2 className="text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
          <Reveal>Asset-Backed</Reveal>
          <Reveal delay={0.08} className="gradient-text">
            Tokenization
          </Reveal>
        </h2>
      </div>

      {/* Giant silver bar, floating on the black canvas */}
      <FadeUp y={50} className="relative z-10 mt-20">
        {/* Radial glow lifting the bar off the background */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60%] w-[80%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-sky/[0.08] blur-[120px]" />

        <motion.img
          src="/silver_bar_side.webp"
          alt="SilverTimes 999.9 fine silver bar"
          className="relative mx-auto block w-full max-w-3xl drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        />
      </FadeUp>

      {/* Single proof point: 100% — 999.9 Silver */}
      <FadeUp delay={0.15} className="relative z-10 mt-6 text-center">
        <div className="gradient-text text-[clamp(4rem,15vw,11rem)] font-bold leading-none tracking-[-0.04em]">
          100%
        </div>
        <div className="mt-4 text-xs font-medium uppercase tracking-[0.35em] text-silver-300 sm:text-sm">
          999.9 Silver
        </div>
      </FadeUp>
    </section>
  );
}
