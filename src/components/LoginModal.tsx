import { usePrivy } from "@privy-io/react-auth";
import { useLoginWithSiwe } from "@privy-io/react-auth";
import { useCallback, useState } from "react";
import { connectKuCoinWallet, signMessage } from "../utils/kucoinWallet";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = usePrivy();
  const { generateSiweMessage, loginWithSiwe } = useLoginWithSiwe();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleKuCoinWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      // 1. Connect to KuCoin via WalletConnect (shows QR modal targeting KuCoin)
      const { address, provider } = await connectKuCoinWallet();

      // 2. Generate SIWE message from Privy
      const message = await generateSiweMessage({
        address,
        chainId: "eip155:1",
      });

      // 3. Sign the message with KuCoin wallet
      const signature = await signMessage(provider, address, message);

      // 4. Authenticate with Privy using the SIWE signature
      await loginWithSiwe({
        signature,
        message,
        walletClientType: "kucoin_wallet",
        connectorType: "wallet_connect_v2",
      });

      onClose();
    } catch (error) {
      console.error("KuCoin wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [generateSiweMessage, loginWithSiwe, onClose]);

  if (!isOpen) return null;

  const handleMetaMask = () => {
    onClose();
    login({ loginMethods: ["wallet"] });
  };

  const handleCoinbaseWallet = () => {
    onClose();
    login({ loginMethods: ["wallet"] });
  };

  const handleOtherWallets = () => {
    onClose();
    login({ loginMethods: ["wallet"] });
  };

  const handleEmailSocials = () => {
    onClose();
    login({ loginMethods: ["email", "google", "twitter"] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isConnecting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0c1425] border border-white/10 rounded-2xl w-full max-w-sm mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isConnecting}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-silver-400 hover:text-white disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/ST_ICON_DARK@2x.png" alt="SilverTimes" className="h-16" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Log in or sign up
        </h2>

        {/* Login Options */}
        <div className="space-y-3">
          {/* KuCoin Web3 Wallet - Featured */}
          <button
            onClick={handleKuCoinWallet}
            disabled={isConnecting}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-[#23D985]/40 rounded-xl hover:bg-[#23D985]/10 transition-all group disabled:opacity-60"
          >
            <img
              src="https://assets.staticimg.com/cms/media/3gfl2DgVUqjJ8FnkC7QxhvPmXmPgpt42FrAqklVMr.png"
              alt="KuCoin"
              className="w-9 h-9 rounded-lg flex-shrink-0"
            />
            <span className="text-white font-medium text-sm whitespace-nowrap">
              {isConnecting ? "Connecting..." : "KuCoin Web3 Wallet"}
            </span>
            {!isConnecting && (
              <span className="text-[#23D985] text-[10px] font-medium ml-auto whitespace-nowrap">Official Wallet Partner</span>
            )}
          </button>

          {/* MetaMask */}
          <button
            onClick={handleMetaMask}
            disabled={isConnecting}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all disabled:opacity-40"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/3840px-MetaMask_Fox.svg.png"
              alt="MetaMask"
              className="w-9 h-9 rounded-lg flex-shrink-0"
            />
            <span className="text-white font-medium text-sm">MetaMask</span>
          </button>

          {/* Coinbase Wallet */}
          <button
            onClick={handleCoinbaseWallet}
            disabled={isConnecting}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all disabled:opacity-40"
          >
            <div className="w-9 h-9 bg-[#0052FF] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <rect x="4" y="4" width="16" height="16" rx="3" fill="white" />
                <rect x="8" y="8" width="8" height="8" rx="1" fill="#0052FF" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">Coinbase Wallet</span>
          </button>

          {/* Other wallets */}
          <button
            onClick={handleOtherWallets}
            disabled={isConnecting}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all disabled:opacity-40"
          >
            <div className="w-9 h-9 bg-silver-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-silver-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75A2.25 2.25 0 0118 6v0a2.25 2.25 0 01-2.25 2.25H15M3 12a9 9 0 0118 0 9 9 0 01-18 0z" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">Other wallets</span>
          </button>

          {/* Email or socials */}
          <button
            onClick={handleEmailSocials}
            disabled={isConnecting}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all disabled:opacity-40"
          >
            <div className="w-9 h-9 bg-silver-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-silver-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">Log in with email or socials</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-silver-500">
          <span>Protected by</span>
          <span className="font-semibold text-silver-400">privy</span>
        </div>
      </div>
    </div>
  );
}
