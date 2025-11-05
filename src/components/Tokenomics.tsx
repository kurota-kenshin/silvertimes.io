export default function Tokenomics() {
  const specs = [
    {
      icon: "🪙",
      label: "Token",
      value: "$STT = 1 oz silver",
      detail: "Quoted in USDT"
    },
    {
      icon: "🏦",
      label: "Storage",
      value: "Brinks (London) & Horsemart (HK)",
      detail: "Monthly storage slips provided"
    },
    {
      icon: "💳",
      label: "Minting Fee",
      value: "0%",
      detail: "Minimum 1 ton for minting"
    },
    {
      icon: "🔄",
      label: "Redemption Fee",
      value: "0.35%",
      detail: "LBMA Good Delivery bars"
    },
    {
      icon: "⚡",
      label: "Networks",
      value: "Ethereum & HashKey Chain",
      detail: "Open-source smart contracts"
    },
    {
      icon: "🔒",
      label: "Audit",
      value: "Certik (TBC)",
      detail: "Monthly broker confirmations, yearly reports"
    }
  ]

  return (
    <section className="py-32 bg-background-secondary relative">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tokenomics
            </h2>
            <p className="text-xl text-silver-300 max-w-3xl mx-auto">
              Transparent, efficient, and fully backed by real silver assets
            </p>
          </div>

          {/* Main Tokenomics Card */}
          <div className="bg-gradient-to-br from-background-primary to-background-tertiary border border-white/10 rounded-3xl p-8 md:p-12 mb-8">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Token Peg */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-silver rounded-2xl mb-4">
                  <span className="text-3xl">💎</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">$STT</div>
                <div className="text-silver-300">= 1 oz Silver</div>
                <div className="text-sm text-silver-400 mt-2">Quoted in USDT</div>
              </div>

              {/* Backing */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl mb-4">
                  <span className="text-3xl">🏛️</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">1:1</div>
                <div className="text-silver-300">Value Backing</div>
                <div className="text-sm text-silver-400 mt-2">Proof-of-Reserves</div>
              </div>

              {/* Yield */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">2-8%</div>
                <div className="text-silver-300">Target APY</div>
                <div className="text-sm text-silver-400 mt-2">From basis trades & T-bills</div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12"></div>

            {/* Detailed Specs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specs.map((spec, index) => (
                <div
                  key={index}
                  className="bg-background-secondary/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{spec.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm text-silver-400 mb-1">{spec.label}</div>
                      <div className="text-lg font-semibold text-white mb-1">{spec.value}</div>
                      <div className="text-sm text-silver-400">{spec.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background-primary border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                Transparency & Audits
              </h3>
              <ul className="space-y-3 text-silver-300">
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">•</span>
                  <span>Monthly broker confirmations for all holdings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">•</span>
                  <span>Yearly public audit reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">•</span>
                  <span>Real-time on-chain dashboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">•</span>
                  <span>Open-source smart contracts on GitHub</span>
                </li>
              </ul>
            </div>

            <div className="bg-background-primary border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                Technical Specifications
              </h3>
              <ul className="space-y-3 text-silver-300">
                <li className="flex items-start gap-2">
                  <span className="text-accent-purple mt-1">•</span>
                  <span>Ethereum & HashKey Chain deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-purple mt-1">•</span>
                  <span>Audited by Certik (TBC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-purple mt-1">•</span>
                  <span>Explorer via ETH/HashKey tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-purple mt-1">•</span>
                  <span>LBMA Good Delivery standards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
