export default function MarketGraph() {
  return (
    <section className="py-32 bg-background-secondary relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Global Silver Supply vs. Demand
            </h2>
            <p className="text-xl text-silver-300">
              Rising prices amid tightening market and persistent deficits
            </p>
          </div>

          {/* Graph Container */}
          <div className="bg-background-primary border border-white/10 rounded-2xl p-8 md:p-12">
            {/* Graph visualization placeholder */}
            <div className="relative h-96">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-sm text-silver-400">
                <span>1,200M oz</span>
                <span>1,100M oz</span>
                <span>1,000M oz</span>
                <span>900M oz</span>
                <span>800M oz</span>
              </div>

              {/* Graph area */}
              <div className="ml-20 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-px bg-white/5"></div>
                  ))}
                </div>

                {/* Supply line (decreasing) */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <polyline
                    points="0,120 20,125 40,135 60,145 80,160 100,175"
                    fill="none"
                    stroke="url(#supplyGradient)"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <defs>
                    <linearGradient id="supplyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Demand line (increasing) */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <polyline
                    points="0,180 20,175 40,165 60,155 80,140 100,120"
                    fill="none"
                    stroke="url(#demandGradient)"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <defs>
                    <linearGradient id="demandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X-axis labels */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-sm text-silver-400">
                  <span>2020</span>
                  <span>2021</span>
                  <span>2022</span>
                  <span>2023</span>
                  <span>2024</span>
                  <span>2025</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-8 mt-16">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600"></div>
                <span className="text-silver-200">Supply</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"></div>
                <span className="text-silver-200">Demand</span>
              </div>
            </div>

            {/* Key Insight */}
            <div className="mt-12 bg-background-secondary border border-accent-blue/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Market Deficit Trend</h4>
                  <p className="text-silver-300 leading-relaxed">
                    The silver market has experienced persistent deficits for consecutive years, with industrial demand (especially from solar panels and EVs) outpacing mine supply, driving structural tightness and price appreciation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
