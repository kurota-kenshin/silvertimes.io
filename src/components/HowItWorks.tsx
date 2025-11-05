export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "KYC and Mint",
      description: "Verify identity at designated facilities, deposit fiat or eligible collateral, and mint STT at the live silver spot reference with LBMA Good Delivery standards for accepted bars",
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      number: "02",
      title: "Utilize Reserves",
      description: "A hybrid reserve holds majority physical silver and programmatic allocations to silver futures, cash, and U.S. T-bills to hedge volatility and generate yield",
      gradient: "from-blue-400/20 to-blue-500/30"
    },
    {
      number: "03",
      title: "Price Tracking",
      description: "HashKey oracles feed real-time spot and futures data to keep STT tightly aligned to silver via automated rebalancing thresholds",
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      number: "04",
      title: "Earn and Distribute",
      description: "Basis trades and T-bill interest target about 2-8% revenue on TVL; a share funds operations and the remainder goes to staking rewards and future governance airdrops",
      gradient: "from-blue-400/20 to-blue-500/30"
    },
    {
      number: "05",
      title: "Use or Redeem",
      description: "Trade STT 24/7 on exchanges or redeem for LBMA bars from designated vaults with clear minimums and typical 3-5 business-day processing",
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      number: "06",
      title: "Transparent and Secure",
      description: "1:1 value backing with Proof-of-Reserves, regular independent audits, on-chain dashboards, and audited smart contracts ensure verifiable, accountable operations",
      gradient: "from-blue-400/20 to-blue-500/30"
    }
  ]

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            From Mint To Yield
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            A transparent, auditable process from onboarding to earnings<br className="hidden md:block" /> with institutional-grade security at every step
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 group-hover:border-white/10 transition-all duration-300 h-full">
                {/* Number badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-5xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                    {step.number}
                  </div>
                  <div className={`w-1 h-12 bg-gradient-to-b ${step.gradient.replace('/20', '/60').replace('/30', '/70')} rounded-full`}></div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-silver-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
