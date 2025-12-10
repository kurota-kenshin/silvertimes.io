import { useState } from "react";

interface SilverBarPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  pricePerKg: number | null;
}

const CONTACT_EMAIL = "contact@silvertimes.io";

export default function SilverBarPurchaseModal({
  isOpen,
  onClose,
  quantity,
  pricePerKg,
}: SilverBarPurchaseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const totalPrice = pricePerKg ? pricePerKg * quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `[Silver Bar Purchase] Order from ${formData.name}`
    );
    const body = encodeURIComponent(
      `SILVER BAR PURCHASE ORDER\n` +
        `========================\n\n` +
        `Customer Details:\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n` +
        `Delivery Address: ${formData.address}\n\n` +
        `Order Details:\n` +
        `Product: 1kg Fine Silver Bar (999.9)\n` +
        `Quantity: ${quantity}\n` +
        `Price per kg: $${pricePerKg?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
        `Total Amount: $${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n` +
        `Payment Method: Cryptocurrency\n\n` +
        `Please contact me to arrange payment and delivery.`
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
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Your Purchase
          </h2>
          <p className="text-silver-400 text-sm">
            Fill in your details below. Our team will contact you to arrange
            payment and delivery.
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6 pb-4">
          <div className="bg-background-primary/50 border border-white/5 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-silver-500 uppercase tracking-wider mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Product</span>
                <span className="text-white">1kg Fine Silver Bar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Quantity</span>
                <span className="text-white">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Price per kg</span>
                <span className="text-white">
                  $
                  {pricePerKg?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t border-white/5 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-xl font-bold text-white">
                    $
                    {totalPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-silver-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-silver-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs text-silver-400 mb-1.5">
                Email Address
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

            <div>
              <label className="block text-xs text-silver-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-silver-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-xs text-silver-400 mb-1.5">
                Delivery Address
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2.5 bg-background-primary/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-silver-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                placeholder="Full delivery address including city, state/province, postal code, and country"
              />
            </div>

            {/* Payment Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-blue-400 font-medium mb-1">
                    Payment via Cryptocurrency
                  </p>
                  <p className="text-xs text-silver-400">
                    After submitting, our team will contact you with payment
                    details. We accept USDT, USDC, and major cryptocurrencies.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-silver-200 transition-all flex items-center justify-center gap-2"
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
              Submit Order Request
            </button>

            <p className="text-xs text-silver-500 text-center">
              By submitting, you agree to our terms and conditions. Delivery
              fees will be calculated based on your location.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
