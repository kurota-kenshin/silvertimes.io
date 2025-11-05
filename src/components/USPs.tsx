export default function USPs() {
  const usps = [
    {
      title: "Backed by Reputable HK Listed Company",
      description: "Your investment is secured by real silver assets held by a trusted Hong Kong publicly listed company.",
      icon: "🏢"
    },
    {
      title: "Tokenized Traditional Safe Haven",
      description: "Silver has long been a safe haven asset. Now it's tokenized for modern investors seeking portfolio diversification as fiat currency loses value.",
      icon: "🛡️"
    },
    {
      title: "Yield-Bearing Silver Token",
      description: "Unlike other silver tokens, earn staking returns on your tokenized silver while maintaining the security of a redeemable asset.",
      icon: "📈"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-silver-800">
            Why Choose SilverTimes?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The only yield-bearing silver token backed by real assets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {usps.map((usp, index) => (
            <div
              key={index}
              className="bg-silver-50 p-8 rounded-xl hover:shadow-xl transition-shadow border border-silver-200"
            >
              <div className="text-5xl mb-4">{usp.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-silver-800">{usp.title}</h3>
              <p className="text-gray-700 leading-relaxed">{usp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
