import EthereumProvider from "@walletconnect/ethereum-provider";

const KUCOIN_WC_ID =
  "67f1ec404dbf3bddc509b5fcf615850e05b28c287ccd7167b4fe81b4293ac9df";
const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

let providerInstance: InstanceType<typeof EthereumProvider> | null = null;

export async function connectKuCoinWallet(): Promise<{
  address: string;
  provider: InstanceType<typeof EthereumProvider>;
}> {
  // Disconnect any existing session
  if (providerInstance) {
    try {
      await providerInstance.disconnect();
    } catch {}
    providerInstance = null;
  }

  const provider = await EthereumProvider.init({
    projectId: WC_PROJECT_ID,
    chains: [1],
    optionalChains: [10, 137, 56, 42161, 8453],
    showQrModal: true,
    qrModalOptions: {
      explorerRecommendedWalletIds: [KUCOIN_WC_ID],
      explorerExcludedWalletIds: "ALL" as const,
      mobileWallets: [
        {
          id: KUCOIN_WC_ID,
          name: "KuCoin Web3 Wallet",
          links: { native: "kucoin:///wallet/walletConnect", universal: "" },
        },
      ],
    },
    metadata: {
      name: "SilverTimes",
      description: "Silver-backed stablecoin protocol",
      url: window.location.origin,
      icons: [`${window.location.origin}/ST_ICON_DARK@2x.png`],
    },
  });

  providerInstance = provider;

  await provider.connect();

  const accounts = provider.accounts;
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from KuCoin Wallet");
  }

  return { address: accounts[0], provider };
}

export async function signMessage(
  provider: InstanceType<typeof EthereumProvider>,
  address: string,
  message: string
): Promise<string> {
  const signature = await provider.request({
    method: "personal_sign",
    params: [message, address],
  });
  return signature as string;
}

export async function disconnectKuCoin() {
  if (providerInstance) {
    try {
      await providerInstance.disconnect();
    } catch {}
    providerInstance = null;
  }
}
