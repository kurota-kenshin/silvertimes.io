export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Democratizing silver investment
              </h1>
              <div className="space-y-6 text-lg text-silver-300">
                <p>
                  SilverTimes recognizes silver's pivotal role in the future economy,
                  poised to outperform amid green energy transitions and industrial booms.
                </p>
                <p>
                  By tokenizing silver synthetically, we democratize access, enabling users
                  to gain exposure without the burdens of physical handling, while
                  integrating DeFi utilities for enhanced yields and functionality.
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
                <img
                  src="/silver.jpeg"
                  alt="Silver bars"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-16 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-silver-300 text-lg leading-relaxed">
                To democratize access to silver investment through innovative
                blockchain technology, enabling anyone, anywhere to participate
                in the silver economy without the traditional barriers of
                physical ownership and storage.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-16 bg-gradient-to-b from-violet-500/60 to-violet-600/70 rounded-full"></div>
                <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-silver-300 text-lg leading-relaxed">
                We envision a future where silver plays a central role in the
                green energy transition and industrial revolution, and where
                synthetic tokenization unlocks unprecedented liquidity and
                utility in precious metals markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-16 bg-gradient-to-b from-emerald-500/60 to-emerald-600/70 rounded-full"></div>
              <h2 className="text-4xl font-bold text-white">Our Background</h2>
            </div>

            <div className="space-y-8 text-silver-300 text-lg">
              <p>
                This initiative is fortified by the backing of{" "}
                <span className="text-white font-semibold">
                  Alexis Investment Limited
                </span>
                , a major subsidiary company of ex-TSX Venture listed mining
                company,{" "}
                <span className="text-white font-semibold">GobiMin Inc.</span>{" "}
                renowned for its extensive expertise in metal mining and trading.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-background-primary/50 border border-white/5 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-2">
                    Mining Expertise
                  </h3>
                  <p className="text-silver-400 text-sm">
                    Operations spanning exploration, development, and
                    exploitation of nickel, copper, and gold mines
                  </p>
                </div>

                <div className="bg-background-primary/50 border border-white/5 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-2">
                    Global Network
                  </h3>
                  <p className="text-silver-400 text-sm">
                    Robust trading networks established across Hong Kong and
                    China with deep market connections
                  </p>
                </div>

                <div className="bg-background-primary/50 border border-white/5 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-violet-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-2">
                    Supply Chain Integrity
                  </h3>
                  <p className="text-silver-400 text-sm">
                    Unparalleled operational acumen ensuring reliability and
                    scalability for the project
                  </p>
                </div>
              </div>

              <p className="mt-8">
                With this foundation of expertise and infrastructure, GobiMin
                Inc. provides unparalleled operational acumen and supply chain
                integrity to ensure SilverTimes' reliability and scalability as
                we revolutionize precious metals investment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Silver Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Silver, Why Now
            </h2>
            <p className="text-xl text-silver-300 max-w-3xl mx-auto">
              Silver is uniquely positioned at the intersection of precious
              metals investment and industrial necessity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-3">50%</div>
              <div className="text-white font-semibold mb-2">
                Industrial Demand
              </div>
              <p className="text-sm text-silver-400">
                Used in solar panels, EVs, and electronics
              </p>
            </div>

            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-3">
                21.5%
              </div>
              <div className="text-white font-semibold mb-2">Silver APY</div>
              <p className="text-sm text-silver-400">
                Historical annual yield in 2024
              </p>
            </div>

            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-violet-400 mb-3">
                -210M
              </div>
              <div className="text-white font-semibold mb-2">
                Market Deficit
              </div>
              <p className="text-sm text-silver-400">
                Ounces short in 2024 supply
              </p>
            </div>

            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-orange-400 mb-3">
                100%
              </div>
              <div className="text-white font-semibold mb-2">Backed</div>
              <p className="text-sm text-silver-400">
                Every token backed by real silver
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values Section */}
      <section className="py-24 px-4 mb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Core Values
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl p-10">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Transparency
              </h3>
              <p className="text-silver-300">
                Full blockchain verification of all silver backing, with
                real-time auditable reserves and complete supply chain
                traceability.
              </p>
            </div>

            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl p-10">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Accessibility
              </h3>
              <p className="text-silver-300">
                Breaking down barriers to silver investment, making precious
                metals accessible to everyone regardless of location or wealth.
              </p>
            </div>

            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl p-10">
              <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Innovation</h3>
              <p className="text-silver-300">
                Combining traditional precious metals with cutting-edge DeFi
                technology to create new opportunities for yield and utility.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
