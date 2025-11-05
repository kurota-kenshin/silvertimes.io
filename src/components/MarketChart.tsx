import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { year: '2020', supply: 1020, demand: 980 },
  { year: '2021', supply: 1015, demand: 1005 },
  { year: '2022', supply: 1010, demand: 1030 },
  { year: '2023', supply: 1005, demand: 1055 },
  { year: '2024', supply: 1000, demand: 1080 },
  { year: '2025', supply: 995, demand: 1105 },
]

export default function MarketChart() {
  return (
    <section className="py-24 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Global Silver Supply vs. Demand
            </h2>
            <p className="text-xl text-silver-300">
              Rising prices amid tightening market and persistent deficits
            </p>
          </div>

          <div className="bg-background-primary border border-white/10 rounded-2xl p-8">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="year"
                  stroke="#6c757d"
                  style={{ fontSize: '14px' }}
                />
                <YAxis
                  stroke="#6c757d"
                  style={{ fontSize: '14px' }}
                  label={{ value: 'Million oz', angle: -90, position: 'insideLeft', fill: '#6c757d' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="supply"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Supply"
                />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Demand"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-8 p-6 bg-background-secondary border border-accent-blue/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
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
