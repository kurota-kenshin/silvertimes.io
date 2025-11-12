export default function SilverBarPurchase() {
  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
              Physical Silver
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Purchase 1kg Silver Bar
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            Own physical silver delivered to your doorstep.
            <br className="hidden md:block" /> Premium quality 999.9 fine silver
            bars
          </p>
        </div>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Product Image */}
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-3xl blur-3xl"></div>
              <img
                src="/silver.jpeg"
                alt="1kg Silver Bar"
                className="relative z-10 w-full max-w-md rounded-2xl"
              />
            </div>
          </div>

          {/* Right: Product Details & Purchase */}
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                1kg Fine Silver Bar
              </h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-bold text-white">$32.50</span>
                  <span className="text-silver-400">/oz</span>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-silver-400 text-sm">Weight</span>
                  <span className="text-white font-semibold">1000g</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-silver-400 text-sm">Purity</span>
                  <span className="text-white font-semibold">
                    999.9 Fine Silver
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-silver-400 text-sm">Mint</span>
                  <span className="text-white font-semibold">SilverTimes</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-silver-400 text-sm">Serial Number</span>
                  <span className="text-white font-semibold">Unique ID</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm text-silver-400 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button className="w-12 h-12 bg-background-primary border border-white/5 rounded-lg hover:border-blue-500/30 transition-all">
                    <span className="text-white text-xl">-</span>
                  </button>
                  <input
                    type="number"
                    defaultValue="1"
                    min="1"
                    className="flex-1 h-12 bg-background-primary border border-white/5 rounded-lg text-white text-center font-semibold focus:outline-none focus:border-blue-500/30"
                  />
                  <button className="w-12 h-12 bg-background-primary border border-white/5 rounded-lg hover:border-blue-500/30 transition-all">
                    <span className="text-white text-xl">+</span>
                  </button>
                </div>
              </div>

              {/* Purchase Button */}
              <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-silver-200 transition-all mb-4">
                Purchase Now
              </button>

              <p className="text-xs text-silver-500 text-center">
                Secure payment powered by blockchain technology
              </p>
            </div>
          </div>
        </div>

        {/* Product Description & Delivery */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Description */}
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">
                Product Description
              </h3>
            </div>

            <div className="space-y-4 text-sm text-silver-400">
              <p>
                Our 1kg silver bars are manufactured by SilverTimes to the
                highest standards. Each bar meets the strict LBMA (London
                Bullion Market Association) Good Delivery standards.
              </p>
              <p>
                Made from 999.9 fine silver (99.99% pure), these bars feature
                elegant stamping including the refiner's hallmark, serial
                number, weight, and purity markings. The bars are individually
                sealed in protective packaging to maintain their pristine
                condition.
              </p>
              <p>
                Each bar comes with a certificate of authenticity and can be
                verified through our blockchain-based tracking system, ensuring
                complete transparency and provenance.
              </p>

              <div className="pt-4 border-t border-white/5 mt-6">
                <h4 className="text-white font-semibold mb-3">
                  Specifications:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Weight: 1000 grams (32.15 troy ounces)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Purity: 999.9 (99.99% pure silver)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Dimensions: Approximately 117mm x 53mm x 17mm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Manufacturer: SilverTimes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Standard: LBMA Good Delivery</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Delivery Terms & Conditions */}
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-gradient-to-b from-violet-500/60 to-violet-600/70 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">
                Delivery Terms & Conditions
              </h3>
            </div>

            <div className="space-y-4 text-sm text-silver-400">
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Shipping Options:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Standard Delivery:</strong>{" "}
                      5-7 business days via secure courier (Free)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Express Delivery:</strong>{" "}
                      2-3 business days via secure courier (+$50)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Vault Storage:</strong>{" "}
                      Store securely in our partnered vaults (Brinks London or
                      Horsemart HK)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-white font-semibold mb-2">
                  Insurance & Security:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      All shipments are fully insured for the market value
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>Discreet, tamper-evident packaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>Signature required upon delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>Real-time tracking available</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-white font-semibold mb-2">
                  Payment & Returns:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      Payment accepted in USDT, USDC, or major cryptocurrencies
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      Orders processed within 24 hours of payment confirmation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      14-day return policy for unopened, sealed bars in original
                      condition
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                    <span>Redemption fee of 0.35% applies for returns</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-silver-500 italic">
                  * Delivery times may vary based on location and customs
                  processing. International orders may be subject to additional
                  duties and taxes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-16 bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Why Choose SilverTimes
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">
                Authenticated Quality
              </h4>
              <p className="text-sm text-silver-400">
                LBMA certified bars from reputable refiners with blockchain
                verification
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">
                Competitive Pricing
              </h4>
              <p className="text-sm text-silver-400">
                Direct pricing with no hidden fees, backed by real-time market
                rates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">
                Flexible Storage
              </h4>
              <p className="text-sm text-silver-400">
                Choose home delivery or secure vault storage with zero storage
                fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
