import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Grain } from "../v2/cinematic";
import FooterV2 from "../FooterV2";
import { swapApi } from "../../services/api";
import SwapCard from "./SwapCard";
import TradeHistory from "./TradeHistory";
import SwapRiskNotes from "./SwapRiskNotes";
import type { SwapConfig, Trade } from "./swap";

// USDT / STT swap — secret, unlisted page behind PasswordGate.
// Treasury-mediated: the user sends one token, the backend verifies it, routes
// through KyberSwap, and sends the other back.
export default function SwapPage() {
  const { authenticated, getAccessToken } = usePrivy();
  const [config, setConfig] = useState<SwapConfig | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setConfig(await swapApi.getConfig());
    if (authenticated) {
      const token = await getAccessToken();
      if (token) {
        const r = await swapApi.getMe(token).catch(() => ({ trades: [] }));
        setTrades(r.trades ?? []);
        return;
      }
    }
    setTrades([]);
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Settlement happens in the background after the page submits, so a trade
  // is PENDING when we first see it. Without polling the user stares at
  // "Swapping" until they think to reload.
  const inFlight = trades.some(
    (t) => t.status === "PENDING" || t.status === "SWAPPING" || t.status === "REFUNDING",
  );

  useEffect(() => {
    if (!inFlight) return;
    let cancelled = false;
    // Stop after 15 minutes rather than polling a tab forever; the refresh
    // button covers anything slower than that.
    const stopAt = Date.now() + 15 * 60 * 1000;

    const id = setInterval(() => {
      if (cancelled || Date.now() > stopAt) {
        clearInterval(id);
        return;
      }
      reload().catch(() => undefined);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [inFlight, reload]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary pt-14 text-white">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[46vh] w-[70vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.07] blur-[160px]" />
      <div className="pointer-events-none absolute right-0 top-[46vh] h-[36vh] w-[40vw] rounded-full bg-brand-teal/[0.05] blur-[150px]" />

      <SwapCard config={config} loading={loading} onSwapped={reload} />
      <TradeHistory trades={trades} onRefresh={refresh} refreshing={refreshing} />
      <SwapRiskNotes treasuryAddress={config?.treasuryAddress ?? ""} />

      <FooterV2 />
    </div>
  );
}
