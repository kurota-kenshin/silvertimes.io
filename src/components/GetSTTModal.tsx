import { useState } from "react";

interface GetSTTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ENQUIRY_TYPES = [
  "General Enquiries",
  "Minting",
  "Redemption",
  "Partnerships",
  "Press & Media",
  "Technical Support",
];

const CONTACT_EMAIL = "contact@silvertimes.io";

export default function GetSTTModal({ isOpen, onClose }: GetSTTModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enquiryType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `[${formData.enquiryType}] Enquiry from ${formData.name}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nEnquiry Type: ${formData.enquiryType}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-silver-400 hover:text-white"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <h2 className="text-2xl font-bold text-white mb-2">Get $STT</h2>
          <p className="text-silver-400 text-sm">
            Acquire STT tokens through our supported exchanges or contact us for
            large orders.
          </p>
        </div>

        {/* Acquisition Options */}
        <div className="p-6">
          <h3 className="text-xs font-semibold text-silver-500 uppercase tracking-wider mb-4">
            Buy on Exchanges
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* MEXC */}
            <a
              href="https://www.mexc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-background-primary/50 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <div className="w-10 h-10 bg-[#00B897]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#00B897] font-bold text-sm">M</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                  MEXC
                </div>
                <div className="text-silver-500 text-xs">CEX</div>
              </div>
              <svg
                className="w-4 h-4 text-silver-500 ml-auto group-hover:text-blue-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            {/* Uniswap */}
            <a
              href="https://app.uniswap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-background-primary/50 border border-white/5 rounded-xl hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group"
            >
              <div className="w-10 h-10 bg-[#FF007A]/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#FF007A]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 16.5c-1.5 1.5-4 1.5-5.5 0s-1.5-4 0-5.5 4-1.5 5.5 0 1.5 4 0 5.5z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm group-hover:text-pink-400 transition-colors">
                  Uniswap
                </div>
                <div className="text-silver-500 text-xs">DEX</div>
              </div>
              <svg
                className="w-4 h-4 text-silver-500 ml-auto group-hover:text-pink-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            {/* Gate.io */}
            <a
              href="https://www.gate.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-background-primary/50 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <div className="w-10 h-10 bg-[#2354E6]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#2354E6] font-bold text-sm">G</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                  Gate.io
                </div>
                <div className="text-silver-500 text-xs">CEX</div>
              </div>
              <svg
                className="w-4 h-4 text-silver-500 ml-auto group-hover:text-blue-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            {/* PancakeSwap */}
            <a
              href="https://pancakeswap.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-background-primary/50 border border-white/5 rounded-xl hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
            >
              <div className="w-10 h-10 bg-[#D1884F]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#D1884F] font-bold text-sm">P</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors">
                  PancakeSwap
                </div>
                <div className="text-silver-500 text-xs">DEX</div>
              </div>
              <svg
                className="w-4 h-4 text-silver-500 ml-auto group-hover:text-amber-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Separator */}
        <div className="px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-silver-500 uppercase tracking-wider">
              Or Contact Us
            </span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-silver-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-silver-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-silver-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-silver-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-silver-400 mb-1.5">
                Enquiry Type
              </label>
              <select
                required
                value={formData.enquiryType}
                onChange={(e) =>
                  setFormData({ ...formData, enquiryType: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="" className="bg-background-secondary">
                  Select enquiry type
                </option>
                {ENQUIRY_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-background-secondary"
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-silver-400 mb-1.5">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-silver-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
