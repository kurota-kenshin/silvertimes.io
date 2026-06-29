import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { dailyPredictionApi } from "../../services/api";

export interface LatestResult {
  roundKey: string;
  predictedPrice: number;
  actualPrice: number;
  error: number;
  percentile: number;
  points: number;
  rank?: number;
  prize?: number;
  isWinner: boolean;
}

/**
 * Fetches the signed-in user's outcome for the most recently settled round
 * (winners() points at it; result() carries the user's own entry). Returns
 * null until a settled result with a scored entry exists. Used by both the
 * inline ResultReveal summary and the celebratory WinPopup — call it once and
 * pass the value down so the result endpoint is only hit a single time.
 */
export function useLatestResult(): LatestResult | null {
  const { authenticated } = usePrivy();
  const [result, setResult] = useState<LatestResult | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setResult(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const winners = await dailyPredictionApi.winners().catch(() => null);
      if (!winners?.round) return;
      const r = await dailyPredictionApi
        .result(winners.round.roundKey)
        .catch(() => null);
      if (cancelled) return;
      if (r?.myEntry && r.round.actualPrice != null && r.myEntry.error != null) {
        setResult({
          roundKey: r.round.roundKey,
          predictedPrice: r.myEntry.predictedPrice,
          actualPrice: r.round.actualPrice,
          error: r.myEntry.error,
          percentile: r.myEntry.percentile ?? 100,
          points: r.myEntry.points ?? 0,
          rank: r.myEntry.rank,
          prize: r.myEntry.prizeUsdt,
          isWinner: (r.myEntry.prizeUsdt ?? 0) > 0,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  return result;
}
