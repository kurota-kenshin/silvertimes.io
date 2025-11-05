export default function AboutSilver() {
  return (
    <section className="py-20 bg-gradient-to-b from-silver-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center text-silver-800">
            About Silver Tokens
          </h2>

          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-silver-200">
            <div className="space-y-6 text-lg text-gray-700">
              <p>
                As fiat currencies face increasing inflation pressures, silver stands out as a time-tested store of value. While several silver tokens exist in the market, <span className="font-semibold text-silver-800">SilverTimes is unique</span> - we're the only silver token that is:
              </p>

              <ul className="space-y-4 ml-6">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <span><strong className="text-silver-800">Backed by real physical silver</strong> held by a reputable Hong Kong publicly listed company</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <span><strong className="text-silver-800">Fully redeemable</strong> for physical silver, ensuring genuine asset backing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <span><strong className="text-silver-800">Yield-bearing</strong> through staking mechanisms, providing passive income</span>
                </li>
              </ul>

              <div className="bg-silver-50 p-6 rounded-lg mt-8 border-l-4 border-silver-600">
                <p className="text-gray-800">
                  <strong>Save on holding costs:</strong> Traditional silver storage is expensive. With SilverTimes, you eliminate physical storage costs while earning staking returns on a safe, tokenized asset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
