export default function TokenBacking() {
  const backing = [
    {
      percentage: "50%",
      title: "Physical Silver",
      description: "Minimum 999 fineness stored in secure vaults",
      color: "from-silver-400 to-silver-600"
    },
    {
      percentage: "5-10%",
      title: "Cash Collateral",
      description: "Liquid reserves for operational flexibility",
      color: "from-green-400 to-green-600"
    },
    {
      percentage: "40-45%",
      title: "Silver Futures",
      description: "Strategic positions for yield generation",
      color: "from-accent-blue to-accent-purple"
    }
  ]

  return (
    <section className="py-32 bg-background-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-silver-500 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Token Backing Overview
            </h2>
            <p className="text-xl text-silver-300 max-w-3xl mx-auto">
              A hybrid reserve design combining physical silver, cash collateral, and futures strategies for optimal security and yield
            </p>
          </div>

          {/* Backing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {backing.map((item, index) => (
              <div
                key={index}
                className="bg-background-secondary border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group"
              >
                <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.percentage}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-silver-100 transition-colors">
                  {item.title}
                </h3>
                <p className="text-silver-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Visual Breakdown */}
          <div className="bg-background-secondary border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Reserve Allocation</h3>
            <div className="flex h-16 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-silver-400 to-silver-600 flex items-center justify-center text-white font-semibold" style={{ width: '50%' }}>
                50% Silver
              </div>
              <div className="bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm" style={{ width: '7.5%' }}>
                Cash
              </div>
              <div className="bg-gradient-to-r from-accent-blue to-accent-purple flex items-center justify-center text-white font-semibold" style={{ width: '42.5%' }}>
                42.5% Futures
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
