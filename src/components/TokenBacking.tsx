export default function TokenBacking() {
  const backing = [
    {
      percentage: "50%",
      title: "Physical Silver Collateral",
      description: "Minimum 999 fineness stored in secure vaults",
      color: "blue",
      gradient: "from-blue-500/60 to-blue-600/70",
    },
    {
      percentage: "50%",
      title: "Money Market Investments",
      description: "Liquid reserves for operational flexibility",
      color: "emerald",
      gradient: "from-blue-500/60 to-blue-600/70",
    },
    {
      percentage: "50%",
      title: "Silver Futures",
      description: "Strategic positions",
      color: "violet",
      gradient: "from-violet-500/60 to-violet-600/70",
    },
  ];

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects - more subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - cleaner, more EV-like */}
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
              Reserve Structure
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Asset-Backed
            <br className="hidden md:block" /> Tokenization
          </h2>
          <p className="text-base text-silver-400 max-w-2xl mx-auto">
            A sophisticated multi-asset reserve system combining physical
            precious metals,
            <br className="hidden md:block" /> liquid collateral, and strategic
            market positions
          </p>
        </div>

        {/* Main composition visualization */}
        <div className="mb-16">
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            {/* Interactive bar with better spacing */}
            <div className="mb-10">
              <div className="flex h-2.5 rounded-full overflow-hidden bg-background-primary/50 border border-white/5">
                <div
                  className="bg-gradient-to-r from-blue-500/50 to-blue-600/60 transition-all duration-500 hover:opacity-80"
                  style={{ width: "33.33%" }}
                ></div>
                <div
                  className="bg-gradient-to-r from-blue-600/60 to-blue-600/40 transition-all duration-500 hover:opacity-80"
                  style={{ width: "33.33%" }}
                ></div>
                <div
                  className="bg-gradient-to-r from-violet-500/40 to-violet-600/50 transition-all duration-500 hover:opacity-80"
                  style={{ width: "33.33%" }}
                ></div>
              </div>
            </div>

            {/* Stats Grid - EV dashboard style */}
            <div className="grid md:grid-cols-3 gap-8">
              {backing.map((item, index) => (
                <div key={index} className="group relative">
                  {/* Glow effect on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                  ></div>

                  <div className="relative bg-background-primary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 group-hover:border-white/10 transition-all duration-300">
                    {/* Percentage with colored indicator */}
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-1 h-16 bg-gradient-to-b ${item.gradient} rounded-full`}
                      ></div>
                      <div className="text-6xl font-bold text-white tracking-tight">
                        {item.percentage}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-silver-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom metadata - minimal */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-silver-600">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
                  <span>Physical Assets & Strategic Positions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
                  <span>Liquid Reserves</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-violet-500/50"></div>
                  <span>Strategic Positions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional details - minimal info cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Secure Storage
                </h4>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Physical silver held in tier-1 vaults with regular third-party
                  audits and full insurance coverage
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-violet-400"
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
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Dynamic Rebalancing
                </h4>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Automated reserve management ensures optimal composition while
                  maintaining minimum backing ratios
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Zero Storage Fee
                </h4>
                <p className="text-xs text-silver-500 leading-relaxed">
                  0% storage fees and streamlined infrastructure, allowing
                  greater gross yield to flow directly to holders.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  24/7 Trading
                </h4>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Trade silver anytime, anywhere. We enable 24/7 transferability
                  and exchange access ensure capital remains fully liquid while
                  generating returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
