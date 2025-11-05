import { useState } from 'react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "What makes SilverTimes different from other silver tokens?",
      answer: "SilverTimes is the only silver token that combines real physical backing by a HK listed company, full redeemability, AND yield-bearing staking mechanisms. Most silver tokens lack one or more of these features."
    },
    {
      question: "How is the silver backing verified?",
      answer: "Our silver reserves are held by a reputable Hong Kong publicly listed company and undergo regular third-party audits. All audit reports are published on our platform for full transparency."
    },
    {
      question: "Can I redeem my tokens for physical silver?",
      answer: "Yes, SilverTimes tokens are fully redeemable for physical silver. You can initiate redemption through our platform, and the physical silver will be delivered or made available for pickup."
    },
    {
      question: "How do staking rewards work?",
      answer: "When you stake your SilverTimes tokens, you lock them in our protocol for a specified period. In return, you earn regular yield payments. The yield comes from lending activities and platform fees."
    },
    {
      question: "What are the storage costs compared to physical silver?",
      answer: "With SilverTimes, you eliminate traditional storage costs entirely. Instead of paying for vault storage, insurance, and security, you hold digital tokens. Plus, you can earn staking yields instead of just paying fees."
    },
    {
      question: "Who can invest in SilverTimes?",
      answer: "SilverTimes is designed for commodity traders, institutional investors, existing silver holders, DeFi investors, and anyone seeking a safe haven asset with modern digital conveniences."
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-silver-800">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about SilverTimes
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-silver-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left bg-silver-50 hover:bg-silver-100 transition-colors flex justify-between items-center"
              >
                <span className="font-semibold text-lg text-silver-800">{faq.question}</span>
                <span className="text-2xl text-silver-600">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="bg-silver-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-silver-700 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  )
}
