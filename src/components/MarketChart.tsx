import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useState } from 'react'

const growthData = [
  { year: '2020', value: 100 },
  { year: '2021', value: 105.3 },
  { year: '2022', value: 112.1 },
  { year: '2023', value: 119.5 },
  { year: '2024', value: 127.8 },
  { year: '2025', value: 138.2 },
]

const marketData = [
  { year: '2020', deficit: -185 },
  { year: '2021', deficit: -145 },
  { year: '2022', deficit: -237 },
  { year: '2023', deficit: -184 },
  { year: '2024', deficit: -215 },
  { year: '2025', deficit: -265 },
]

export default function MarketChart() {
  const [investAmount, setInvestAmount] = useState(100)
  const currentValue = (investAmount * 1.382).toFixed(2)
  const gain = (investAmount * 0.382).toFixed(2)
  const gainPercentage = "38.2%"

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
          {/* Left: Interactive Calculator */}
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Growth Projection</h3>
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

              {/* Mini Chart - cleaner */}
              <div className="h-56 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                      domain={[95, 145]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                      formatter={(value: number) => [`$${(investAmount * value / 100).toFixed(2)}`, 'Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#60a5fa"
                      strokeWidth={2.5}
                      fill="url(#colorValue)"
                      dot={{ fill: '#60a5fa', r: 3, strokeWidth: 2, stroke: '#0a0a0a' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="text-xs text-silver-600 text-center">
                Historical performance based on 2020-2025 silver appreciation + staking yield
              </p>
            </div>
          </div>

          {/* Right: Market Deficit Chart */}
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white">Market Dynamics</h3>
              <div className="w-1 h-8 bg-gradient-to-b from-red-500/50 to-red-600/60 rounded-full"></div>
            </div>

            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <defs>
                    <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    label={{ value: 'Moz', angle: -90, position: 'insideLeft', fill: '#6b7280', style: { fontSize: '11px' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    formatter={(value: number) => [`${value} Moz`, 'Deficit']}
                  />
                  <Area
                    type="monotone"
                    dataKey="deficit"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fill="url(#colorDeficit)"
                    dot={{ fill: '#ef4444', r: 3, strokeWidth: 2, stroke: '#0a0a0a' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-background-primary/20 rounded-xl border border-white/5">
                <div className="w-1 h-1 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-silver-500 leading-relaxed">
                  Industrial demand from solar, EVs, and 5G infrastructure continues to outpace mining supply
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
            <div className="text-4xl font-bold text-white">50%+</div>
            <div className="text-xs text-silver-500 mt-1">Physical Silver</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">Yield</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">5.1%</div>
            <div className="text-xs text-silver-500 mt-1">Current APY</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">TVL</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">$10.87B</div>
            <div className="text-xs text-silver-500 mt-1">Total Value Locked</div>
          </div>
        </div>
      </div>
    </section>
  )
}
