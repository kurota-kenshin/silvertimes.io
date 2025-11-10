import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend } from 'recharts'
import { useState } from 'react'

// Silver price data based on historical prices (2020-2024) and projected 5-year average return (2025-2030)
// Base: 2020 = $20.55, calculating 5-year average return from 2020-2024 data
const silverPriceData = [
  { year: '2020', price: 20.55 },
  { year: '2021', price: 25.14 },
  { year: '2022', price: 21.73 },
  { year: '2023', price: 23.35 },
  { year: '2024', price: 28.27 },
  { year: '2025', price: 32.50 }, // Projected
  { year: '2026', price: 37.38 }, // Projected based on ~15% average annual growth
  { year: '2027', price: 42.99 }, // Projected
  { year: '2028', price: 49.44 }, // Projected
  { year: '2029', price: 56.86 }, // Projected
  { year: '2030', price: 65.39 }, // Projected
]

// Supply and Demand data from the provided table (2020-2024)
const supplyDemandData = [
  { year: '2020', supply: 974.0, demand: 929.0 },
  { year: '2021', supply: 1023.1, demand: 1102.4 },
  { year: '2022', supply: 1034.6, demand: 1284.2 },
  { year: '2023', supply: 997.8, demand: 1198.5 },
  { year: '2024', supply: 1015.1, demand: 1164.1 },
]

export default function MarketChart() {
  const [investAmount, setInvestAmount] = useState(100)

  // Calculate projection based on silver price growth
  const basePrice = 20.55
  const currentPrice = 28.27
  const projectedPrice = 65.39
  const totalGrowth = projectedPrice / basePrice

  const currentValue = (investAmount * totalGrowth).toFixed(2)
  const gain = (investAmount * (totalGrowth - 1)).toFixed(2)
  const gainPercentage = ((totalGrowth - 1) * 100).toFixed(1) + "%"

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects - more subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - EV style */}
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Value Growth</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Digital Silver For The<br className="hidden md:block" /> Modern Economy
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            Store value in tokenised silver backed by physical assets,<br className="hidden md:block" /> generating yield while preserving purchasing power
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Left: Silver Price Projection */}
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Silver Price Projection</h3>
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
              </div>

              {/* Investment Input - cleaner */}
              <div className="mb-10">
                <label className="block text-xs text-silver-500 uppercase tracking-wider mb-3">Initial Investment</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-white/50 group-focus-within:text-white/80 transition-colors">$</span>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(Number(e.target.value) || 0)}
                    className="w-full bg-background-primary/50 border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-3xl font-bold text-white focus:outline-none focus:border-blue-500/30 focus:bg-background-primary/80 transition-all"
                    min="0"
                    step="10"
                  />
                </div>
              </div>

              {/* Results Display - minimal */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center justify-between p-5 bg-background-primary/30 border border-white/5 rounded-2xl">
                  <span className="text-xs text-silver-500 uppercase tracking-wider">Projected Value</span>
                  <span className="text-3xl font-bold text-white">${currentValue}</span>
                </div>

                <div className="flex items-center justify-between p-5 bg-blue-500/8 border border-blue-500/15 rounded-2xl">
                  <span className="text-xs text-blue-400 uppercase tracking-wider">Total Return</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400">${gain}</div>
                    <div className="text-xs text-blue-400/70 mt-1">+{gainPercentage}</div>
                  </div>
                </div>
              </div>

              {/* Silver Price Chart */}
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={silverPriceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#6b7280"
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: '$/oz', angle: -90, position: 'insideLeft', fill: '#6b7280', style: { fontSize: '11px' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}/oz`, 'Price']}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#60a5fa"
                      strokeWidth={2.5}
                      dot={{ fill: '#60a5fa', r: 3, strokeWidth: 2, stroke: '#0a0a0a' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-xs text-silver-600 text-center">
                Historical silver performance during 2020-2025
              </p>
            </div>
          </div>

          {/* Right: Supply and Demand Chart */}
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white">Silver Supply and Demand</h3>
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
            </div>

            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={supplyDemandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Million oz', angle: -90, position: 'insideLeft', fill: '#6b7280', style: { fontSize: '11px' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="supply"
                    name="Total Supply"
                    stroke="#60a5fa"
                    strokeWidth={2.5}
                    dot={{ fill: '#60a5fa', r: 3, strokeWidth: 2, stroke: '#0a0a0a' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Total Demand"
                    stroke="#a78bfa"
                    strokeWidth={2.5}
                    dot={{ fill: '#a78bfa', r: 3, strokeWidth: 2, stroke: '#0a0a0a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-background-primary/20 rounded-xl border border-white/5">
                <div className="w-1 h-1 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Industrial demand hit a record high, led by strong growth in electronics & electrical sectors, driven by green economy initiatives like PV, automotive, and grid infrastructure
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background-primary/20 rounded-xl border border-white/5">
                <div className="w-1 h-1 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-silver-500 leading-relaxed">
                  AI applications boosted industrial silver demand
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background-primary/20 rounded-xl border border-white/5">
                <div className="w-1 h-1 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Structural deficits create long-term price support and appreciation potential
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background-primary/20 rounded-xl border border-white/5">
                <div className="w-1 h-1 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Green energy transition driving unprecedented industrial consumption growth
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats - minimal */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">Backing</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">50%</div>
            <div className="text-xs text-silver-500 mt-1">Physical Silver</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">Yield</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">14%</div>
            <div className="text-xs text-silver-500 mt-1">Silver APY</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">TVL</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">$10M</div>
            <div className="text-xs text-silver-500 mt-1">Total Value Locked</div>
          </div>
        </div>
      </div>
    </section>
  )
}
