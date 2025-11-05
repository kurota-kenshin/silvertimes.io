export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Purchase SilverTimes Tokens",
      description: "Buy tokens through our platform using crypto or fiat currency. Each token represents ownership of physical silver."
    },
    {
      number: "2",
      title: "Stake Your Tokens",
      description: "Lock your tokens in our staking protocol to earn yield. Your silver remains fully backed and redeemable."
    },
    {
      number: "3",
      title: "Earn Passive Income",
      description: "Receive regular staking rewards while your underlying silver asset appreciates or serves as a safe haven."
    },
    {
      number: "4",
      title: "Trade or Redeem Anytime",
      description: "Trade tokens on exchanges for liquidity, or redeem them for physical silver from our HK listed company."
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-silver-50 to-silver-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-silver-800">
            How SilverTimes Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, secure, and transparent silver tokenization
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-silver-600"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-silver-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-silver-800">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-8 rounded-xl shadow-md border border-silver-300">
            <h3 className="text-2xl font-bold mb-4 text-silver-800 text-center">
              Backed by Real Assets
            </h3>
            <p className="text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
              Every SilverTimes token is backed 1:1 by physical silver stored securely by our Hong Kong listed partner company.
              Regular audits ensure full transparency and asset backing. You can verify reserves anytime and redeem tokens for physical silver.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
