import { Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";

export default function YouTubeSectionV2() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
      <Grain />

      {/* Soft brand glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[42vh] w-[60vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.07] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Heading */}
        <FadeUp className="mb-7">
          <Eyebrow>Watch</Eyebrow>
        </FadeUp>

        <h2 className="max-w-3xl text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
          <Reveal>See SilverTimes</Reveal>
          <Reveal delay={0.08} className="gradient-text">
            in motion
          </Reveal>
        </h2>

        <FadeUp delay={0.15} className="mt-6 max-w-xl">
          <p className="text-[clamp(0.95rem,1.8vw,1.15rem)] font-light text-silver-400">
            Physical silver, tokenized on-chain — see how it comes together.
          </p>
        </FadeUp>

        {/* Framed video player */}
        <FadeUp delay={0.2} y={40} className="group relative mt-14">
          {/* Outer glow */}
          <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/20 via-brand-teal/10 to-transparent opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90" />

          {/* Gradient hairline frame */}
          <div className="relative rounded-[1.75rem] bg-gradient-to-br from-white/15 via-white/5 to-transparent p-px shadow-[0_40px_140px_-40px_rgba(0,0,0,0.95)]">
            <div className="relative overflow-hidden rounded-[1.7rem] bg-black">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/--uK4CnyrHc?autoplay=1&mute=1&loop=1&playlist=--uK4CnyrHc&controls=1&showinfo=0&rel=0"
                  title="SilverTimes Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
