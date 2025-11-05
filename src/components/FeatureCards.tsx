export default function FeatureCards() {
  const features = [
    {
      icon: "💰",
      title: "Earn While Holding Silver",
      description: "Turn traditionally non-yielding silver into an income-bearing allocation with an integrated yield stream atop spot exposure"
    },
    {
      icon: "⛓️",
      title: "Programmatic, On-Chain Distribution",
      description: "Yield credited via smart contracts and full on-chain visibility"
    },
    {
      icon: "🛡️",
      title: "Risk-Managed Yield Engine",
      description: "Hybrid design combining physical reserves, treasury bonds, and futures strategies to target prudent, durable yield"
    },
    {
      icon: "📈",
      title: "Keep More of the Yield",
      description: "0% storage fees and efficient rails reduce drag so more gross yield accrues to holders"
    },
    {
      icon: "🔄",
      title: "Liquidity Without Lockups",
      description: "24/7 transferability and exchange access so capital remains mobile while earning"
    }
  ]

  return (
    <section className="py-32 bg-background-primary relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="gradient-text">SilverTimes</span>
            </h2>
            <p className="text-xl text-silver-300 max-w-3xl mx-auto">
              The modern way to hold and earn with silver
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-background-secondary border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:bg-background-tertiary transition-all duration-300"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-silver-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-silver-400 leading-relaxed group-hover:text-silver-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}

            {/* CTA Card */}
            <div className="group bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-2xl p-8 hover:border-accent-blue/50 transition-all duration-300 flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ready to Start Earning?
              </h3>
              <p className="text-silver-300 mb-6">
                Join thousands earning yield on tokenized silver
              </p>
              <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-silver-200 transition-all transform hover:scale-105">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
