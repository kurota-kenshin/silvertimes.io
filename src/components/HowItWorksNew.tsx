export default function HowItWorksNew() {
  const steps = [
    {
      number: "01",
      title: "KYC and Mint",
      description: "Verify identity at designated facilities, deposit fiat or eligible collateral, and mint STT at the live silver spot reference with LBMA Good Delivery standards for accepted bars.",
      icon: "🔐",
      color: "from-accent-blue to-accent-cyan"
    },
    {
      number: "02",
      title: "Utilize Reserves",
      description: "A hybrid reserve holds majority physical silver and programmatic allocations to silver futures, cash, and U.S. T-bills to hedge volatility and generate yield.",
      icon: "🏦",
      color: "from-accent-cyan to-green-400"
    },
    {
      number: "03",
      title: "Price Tracking",
      description: "HashKey oracles feed real-time spot and futures data to keep STT tightly aligned to silver via automated rebalancing thresholds.",
      icon: "📡",
      color: "from-green-400 to-accent-purple"
    },
    {
      number: "04",
      title: "Earn and Distribute",
      description: "Basis trades and T-bill interest target about 2–8% revenue on TVL; a share funds operations and the remainder goes to staking rewards and future governance airdrops.",
      icon: "💰",
      color: "from-accent-purple to-pink-500"
    },
    {
      number: "05",
      title: "Use or Redeem",
      description: "Trade STT 24/7 on exchanges or redeem for LBMA bars from designated vaults with clear minimums and typical 3–5 business-day processing.",
      icon: "🔄",
      color: "from-pink-500 to-red-500"
    },
    {
      number: "06",
      title: "Transparent and Secure",
      description: "1:1 value backing with Proof-of-Reserves, regular independent audits, on-chain dashboards, and audited smart contracts ensure verifiable, accountable operations.",
      icon: "✅",
      color: "from-red-500 to-accent-blue"
    }
  ]

  return (
    <section className="py-32 bg-background-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">How </span>
              <span className="gradient-text">SilverTimes</span>
              <span className="text-white"> Works</span>
            </h2>
            <p className="text-xl text-silver-300 max-w-3xl mx-auto">
              Six simple steps from minting to earning yield on tokenized silver
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-blue via-accent-purple to-accent-blue opacity-20"></div>

            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className="flex-1">
                    <div className={`bg-background-secondary border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group ${
                      index % 2 === 0 ? 'lg:mr-12' : 'lg:ml-12'
                    }`}>
                      {/* Step Number Badge */}
                      <div className={`inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r ${step.color} mb-4`}>
                        <span className="text-white font-bold text-sm">{step.number}</span>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-silver-100 transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-silver-400 leading-relaxed group-hover:text-silver-300 transition-colors">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden lg:flex items-center justify-center flex-shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      <div className="w-6 h-6 rounded-full bg-background-primary"></div>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="inline-block bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-2xl p-8 md:p-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Tokenize Your Silver?
              </h3>
              <p className="text-silver-300 mb-6 max-w-2xl">
                Join the future of silver investment with transparent, yield-bearing tokens backed by real assets
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-silver-200 transition-all transform hover:scale-105">
                  Start Minting
                </button>
                <button className="px-8 py-4 border-2 border-white/20 text-white rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all">
                  Read Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
