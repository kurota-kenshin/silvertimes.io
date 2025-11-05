export default function TargetAudience() {
  const personas = [
    {
      title: "Commodity Traders",
      age: "25-50 years old",
      description: "Tech-savvy professionals who value fast wallet-to-wallet settlement and are adopting crypto trends in commodity trading.",
      benefits: ["Instant settlement", "No intermediaries", "24/7 trading"]
    },
    {
      title: "Safe Haven Seekers",
      age: "35-60 years old",
      description: "Investors looking to diversify portfolios with traditional safe haven assets, now available in tokenized form.",
      benefits: ["Portfolio diversification", "Inflation hedge", "Digital convenience"]
    },
    {
      title: "Institutional Investors",
      age: "Organizations",
      description: "Financial institutions looking to mint silver tokens or diversify their digital asset portfolios with real-world assets.",
      benefits: ["Large-scale minting", "Regulatory compliance", "Asset tokenization"]
    },
    {
      title: "Silver Holders",
      age: "All ages",
      description: "Existing silver owners looking to reduce holding costs while earning passive income through staking.",
      benefits: ["Lower storage costs", "Staking yields", "Easy liquidity"]
    },
    {
      title: "DeFi Investors",
      age: "25-45 years old",
      description: "Crypto enthusiasts seeking safe assets with staking returns, backed by redeemable physical silver.",
      benefits: ["DeFi integration", "Staking rewards", "Collateral use cases"]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-silver-800">
            Who Benefits from SilverTimes?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Designed for modern investors across different backgrounds
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-silver-50 to-white p-6 rounded-xl border border-silver-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-2xl font-bold mb-2 text-silver-800">{persona.title}</h3>
              <p className="text-sm text-silver-600 font-semibold mb-4">{persona.age}</p>
              <p className="text-gray-700 mb-4 leading-relaxed">{persona.description}</p>

              <div className="border-t border-silver-200 pt-4">
                <p className="text-sm font-semibold text-silver-700 mb-2">Key Benefits:</p>
                <ul className="space-y-1">
                  {persona.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center">
                      <span className="text-silver-600 mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
