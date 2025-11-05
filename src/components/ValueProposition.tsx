export default function ValueProposition() {
  const benefits = [
    {
      title: "Earn While Holding Silver",
      description: "Turn traditionally non-yielding silver into an income-bearing allocation with an integrated yield stream atop spot exposure",
      gradient: "from-blue-500/15 to-blue-600/25"
    },
    {
      title: "Programmatic, On-Chain Distribution",
      description: "Yield credited via smart contracts and full on-chain visibility",
      gradient: "from-blue-400/15 to-blue-500/25"
    },
    {
      title: "Risk-Managed Yield Engine",
      description: "Hybrid design combining physical reserves, treasury bonds, and futures strategies to target prudent, durable yield",
      gradient: "from-blue-500/15 to-blue-600/25"
    },
    {
      title: "Keep More of the Yield",
      description: "0% storage fees and efficient rails reduce drag so more gross yield accrues to holders",
      gradient: "from-blue-400/15 to-blue-500/25"
    },
    {
      title: "Liquidity Without Lockups",
      description: "24/7 transferability and exchange access so capital remains mobile while earning",
      gradient: "from-blue-500/15 to-blue-600/25"
    }
  ]

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Value Proposition</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Tokenised Silver With<br className="hidden md:block" /> Treasury-Powered Yield
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            Transforming precious metals into productive digital assets<br className="hidden md:block" /> with institutional-grade infrastructure
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>

              <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 group-hover:border-white/10 transition-all duration-300 h-full">
                {/* Minimal accent bar */}
                <div className={`w-1 h-16 bg-gradient-to-b ${benefit.gradient.replace('/15', '/60').replace('/25', '/70')} rounded-full mb-6`}></div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-3">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-silver-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
