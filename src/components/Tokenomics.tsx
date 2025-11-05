export default function Tokenomics() {
  const specs = [
    {
      label: "Token Peg",
      value: "$STT = 1 oz silver",
      detail: "Quoted in USDT",
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      label: "Storage",
      value: "Brinks (London) & Horsemart (HK)",
      detail: "Monthly storage slips provided",
      gradient: "from-blue-400/20 to-blue-500/30"
    },
    {
      label: "Minting Fee",
      value: "0%",
      detail: "Minimum 1 ton for minting",
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      label: "Redemption Fee",
      value: "0.35%",
      detail: "LBMA Good Delivery bars",
      gradient: "from-blue-400/20 to-blue-500/30"
    },
    {
      label: "Networks",
      value: "Ethereum & HashKey Chain",
      detail: "Open-source smart contracts",
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      label: "Security Audit",
      value: "Certik (TBC)",
      detail: "Monthly confirmations, yearly reports",
      gradient: "from-blue-400/20 to-blue-500/30"
    }
  ]

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Tokenomics</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Specifications
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            Transparent, efficient, and fully backed by real silver assets<br className="hidden md:block" /> with institutional-grade infrastructure
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 group-hover:border-white/10 transition-all duration-300 h-full">
                {/* Accent bar */}
                <div className={`w-1 h-16 bg-gradient-to-b ${spec.gradient.replace('/20', '/60').replace('/30', '/70')} rounded-full mb-6`}></div>

                {/* Label */}
                <div className="text-xs text-silver-600 uppercase tracking-wider mb-2">{spec.label}</div>

                {/* Value */}
                <div className="text-2xl font-bold text-white mb-2">{spec.value}</div>

                {/* Detail */}
                <div className="text-xs text-silver-500">{spec.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
