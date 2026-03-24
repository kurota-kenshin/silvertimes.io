export default function ComparisonTable() {
  return (
    <section className="relative bg-background-primary py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-brand-teal/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brand-blue/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-brand-teal/8 border border-brand-teal/15 rounded-full mb-6">
            <span className="text-xs font-medium text-brand-teal uppercase tracking-wider">
              Compare
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Why SilverTimes?
          </h2>
          <p className="text-base text-silver-400 max-w-2xl mx-auto">
            See how tokenized silver compares to traditional alternatives
          </p>
        </div>

        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 700 }}>
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-5 text-silver-400 font-medium uppercase tracking-wider text-xs w-[22%]">Aspect</th>
                  <th className="text-left px-6 py-5 w-[26%]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-blue font-bold text-base">SilverTimes</span>
                  </th>
                  <th className="text-left px-6 py-5 text-silver-300 font-medium w-[26%]">Silver ETF</th>
                  <th className="text-left px-6 py-5 text-silver-300 font-medium w-[26%]">Physical Silver</th>
                </tr>
              </thead>
              <tbody>
                {/* THE ASSET */}
                <tr><td colSpan={4} className="px-6 pt-6 pb-2"><span className="text-xs font-bold text-brand-teal uppercase tracking-widest">The Asset</span></td></tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Format</td>
                  <td className="px-6 py-4 text-white">Ethereum tokens</td>
                  <td className="px-6 py-4 text-silver-300">Brokerage shares</td>
                  <td className="px-6 py-4 text-silver-300">Tangible coins/bars</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Redemption</td>
                  <td className="px-6 py-4 text-white">1:1 physically redeemable</td>
                  <td className="px-6 py-4 text-silver-300">Cash only (No physical)</td>
                  <td className="px-6 py-4 text-silver-300">Direct possession</td>
                </tr>

                {/* TRADING */}
                <tr><td colSpan={4} className="px-6 pt-6 pb-2"><span className="text-xs font-bold text-brand-teal uppercase tracking-widest">Trading</span></td></tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Availability</td>
                  <td className="px-6 py-4 text-white">24/7 continuous, borderless</td>
                  <td className="px-6 py-4 text-silver-300">Market hours, instant</td>
                  <td className="px-6 py-4 text-silver-300">Dealer hours, slow to sell</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Min. Entry</td>
                  <td className="px-6 py-4 text-white">{"Fractional (< $1)"}</td>
                  <td className="px-6 py-4 text-silver-300">~$25–$30 (1 share)</td>
                  <td className="px-6 py-4 text-silver-300">~$30+ (1+ oz)</td>
                </tr>

                {/* FINANCIALS */}
                <tr><td colSpan={4} className="px-6 pt-6 pb-2"><span className="text-xs font-bold text-brand-teal uppercase tracking-widest">Financials</span></td></tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Total Costs</td>
                  <td className="px-6 py-4 text-white">Lowest (Tx gas fees, free storage)</td>
                  <td className="px-6 py-4 text-silver-300">Low (~0.5% expense ratio)</td>
                  <td className="px-6 py-4 text-silver-300">High (5–10% premium + storage + insurance + assaying fee)</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Yield</td>
                  <td className="px-6 py-4 text-white">DeFi staking <span className="text-brand-teal text-xs">(Coming soon)</span></td>
                  <td className="px-6 py-4 text-silver-300">None</td>
                  <td className="px-6 py-4 text-silver-300">None</td>
                </tr>

                {/* RISK & REGS */}
                <tr><td colSpan={4} className="px-6 pt-6 pb-2"><span className="text-xs font-bold text-brand-teal uppercase tracking-widest">Risk & Regs</span></td></tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Primary Risk</td>
                  <td className="px-6 py-4 text-white">Smart contract vulnerabilities (mitigated by audit)</td>
                  <td className="px-6 py-4 text-silver-300">Custodian/Issuer default</td>
                  <td className="px-6 py-4 text-silver-300">Theft, physical loss</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-silver-400 font-medium">Regulation</td>
                  <td className="px-6 py-4 text-white">Varies (KYC/AML typical)</td>
                  <td className="px-6 py-4 text-silver-300">SEC regulated</td>
                  <td className="px-6 py-4 text-silver-300">Local sales tax</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
