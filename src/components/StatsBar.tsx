import CountUp from 'react-countup'

export default function StatsBar() {
  const stats = [
    { value: 5.1, suffix: '%', label: '$STT APY', prefix: '' },
    { value: 19, suffix: '%', label: '2024 AVG $STT APY', prefix: '' },
    { value: 9.04, suffix: 'B', label: '$STT SUPPLY', prefix: '$' },
    { value: 1.83, suffix: 'B', label: '$STTB SUPPLY', prefix: '$' },
    { value: 850, suffix: 'K', label: 'USERS', prefix: '' },
    { value: 24, suffix: '', label: 'CHAINS', prefix: '' },
  ]

  return (
    <section className="bg-background-primary border-y border-white/5 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.prefix}
                <CountUp end={stat.value} decimals={stat.value % 1 !== 0 ? 2 : 0} duration={2} />
                {stat.suffix}
              </div>
              <div className="text-xs md:text-sm text-silver-400 uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
