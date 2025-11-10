import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PredictionGame() {
  const [prediction, setPrediction] = useState('')

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Demo Notice - Fixed at top */}
      <div className="fixed top-24 left-10 right-10 z-40 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md rounded-xl p-4">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-300 font-medium">
            Pure frontend demo - This is a preview of the prediction game interface
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 mt-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Weekly Competition</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Silver Price Prediction
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            Predict next week's LBMA silver price and win physical silver bars or crypto rewards
          </p>
        </div>

        {/* Prediction Input Section */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10 mb-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Enter Your Prediction</h3>

            <div className="mb-8">
              <label className="block text-sm text-silver-400 mb-3">Next Monday's LBMA Silver Price (USD/oz)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/50">$</span>
                <input
                  type="number"
                  step="0.1"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder="32.5"
                  className="w-full bg-background-primary/50 border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-2xl font-bold text-white focus:outline-none focus:border-blue-500/30 focus:bg-background-primary/80 transition-all"
                />
              </div>
            </div>

            <button className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-all mb-4">
              Connect Wallet to Submit
            </button>

            <p className="text-xs text-silver-500 text-center">
              Connect your EVM wallet to participate. One submission per wallet per round.
            </p>
          </div>
        </div>

        {/* Current Round Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">Current Price</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">$32.50</div>
            <div className="text-xs text-silver-500 mt-1">LBMA Fixing</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">Prize Pool</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">100 oz</div>
            <div className="text-xs text-silver-500 mt-1">Physical Silver</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">Participants</span>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">847</div>
            <div className="text-xs text-silver-500 mt-1">Unique Wallets</div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Game Rules</h3>
          </div>

          <div className="space-y-4 text-sm text-silver-400">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Benchmark:</strong> Use the official LBMA Silver Price (USD/oz); valid reference is the first fixing after the round locks, rounded to one decimal place.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Example:</strong> If Monday's fixing is USD 47.690, guesses closest to 47.7 win.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Access:</strong> Connect an EVM wallet to enter; one submission per wallet per round; edits allowed until lock.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Schedule:</strong> Weekly rounds; submission window runs Monday–Thursday; winners are determined each Monday using that day's fixing.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Scoring:</strong> Rank by absolute error to the benchmark; ties break by earliest valid submission timestamp at lock.
              </p>
            </div>
          </div>
        </div>

        {/* Prizes and Rewards */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-emerald-500/60 to-emerald-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Prizes and Rewards</h3>
          </div>

          <div className="space-y-4 text-sm text-silver-400">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Monthly base prize pool:</strong> 100 oz.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Tier unlocks (for next month's pool):</strong> Tier 1 = 150 oz at 1,000 unique wallets; Tier 2 = 200 oz at 5,000 unique wallets.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Reward order:</strong> Physical silver first; if unavailable or declined, USDT; then STT when live; then STG when live.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Payout timing:</strong> Prizes distributed within 7 days of each Monday determination.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                Rewards are distributed according to the <Link to="/rewards-terms" className="text-blue-400 hover:text-blue-300 underline">rewards delivery T&C</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Data, Fairness, and Admin */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-violet-500/60 to-violet-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Data, Fairness, and Admin</h3>
          </div>

          <div className="space-y-4 text-sm text-silver-400">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Data:</strong> Use only licensed LBMA feeds or validated manual inputs; rounds may be voided if the benchmark is unavailable or materially disrupted.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Compliance:</strong> Physical deliveries may require KYC and are subject to regional restrictions; terms may be updated with notice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
