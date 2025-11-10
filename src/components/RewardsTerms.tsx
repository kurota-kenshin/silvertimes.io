export default function RewardsTerms() {
  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Legal Terms</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Rewards Delivery T&C
          </h2>
          <p className="text-base text-silver-400 max-w-2xl mx-auto">
            Terms and conditions for physical silver prize shipments and digital payouts
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 space-y-6 text-sm text-silver-400">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Scope</h3>
            <p>
              Applies to prize shipments originating from Hong Kong to international addresses for physical silver bullion, which is subject to carrier restrictions globally.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Eligibility/KYC</h3>
            <p>
              Winners must complete identity verification (photo ID and proof of address) before dispatch to satisfy AML and security requirements under Hong Kong's Precious Metals and Stones regime.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Shipping Method</h3>
            <p>
              Ship via specialist insured precious-metal logistics or arrange vault pickup/allocated transfer; standard express couriers are not used where bullion is prohibited.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Insurance and Risk</h3>
            <p>
              Shipments are insured to declared value and require adult signature; risk transfers upon confirmed delivery or vault handover as evidenced by carrier or depository records.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Customs and Taxes</h3>
            <p>
              Recipient is responsible for destination import duties, VAT/GST, brokerage, permits, and any local restrictions; admissibility should be confirmed before dispatch.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Address Standards</h3>
            <p>
              No P.O. Boxes; provide complete residential or business address and contact number matching KYC documents for insured delivery validation.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Timing</h3>
            <p>
              Target dispatch within 7 business days after Monday winner determination and successful KYC; timelines may extend for compliance checks or restricted routes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Failed Delivery</h3>
            <p>
              If a shipment is undeliverable, prohibited, or refused, winner may choose a digital payout or approved alternate address; return/re-delivery costs may apply.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Digital Fallback</h3>
            <p>
              If physical shipping is unavailable or declined, pay USDT to the verified wallet within 7 days; STT/STG issued when live with on-chain transaction records.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Compliance and Records</h3>
            <p>
              KYC, shipping, and payout data are retained for audit to comply with Hong Kong's Dealers in Precious Metals and Stones regulatory regime.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Restricted Destinations</h3>
            <p>
              Shipments may be refused to jurisdictions with bullion bans, carrier prohibitions, or sanctions; such cases default to digital payout per campaign policy.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Loss/Confiscation</h3>
            <p>
              In any case of accident, loss, theft, damage, seizure, or customs confiscation after dispatch, the winner bears the loss; no resend or cash replacement will be provided.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Insurance Claims</h3>
            <p>
              Any post-dispatch claim is at our insurer's and our discretion; if proceeds are paid, we may remit net proceeds to the winner after fees and charges, otherwise no compensation.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Undispatchable Routes</h3>
            <p>
              If shipment cannot be dispatched due to legal or carrier prohibitions identified before dispatch, the winner may opt for the published digital payout instead.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Customs and Duties</h3>
            <p>
              The winner is responsible for all import duties, taxes, permits, and compliance; refusal or failure to clear customs is treated as winner's risk with no resend.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Legal</h3>
            <p>
              Applies to shipments dispatched from Hong Kong and is enforceable to the maximum extent permitted by applicable law in the destination jurisdiction.
            </p>
          </div>

          <div className="pt-6 border-t border-white/5 mt-8">
            <p className="text-xs text-silver-500 italic">
              Last updated: November 2025
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
