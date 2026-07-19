/**
 * Prize display: winners receive 0.1 STT per win. The backend still books
 * prizes in USDT (5 per win) until the payout migration, so convert at
 * display time — one win (prizeUsdt 5) renders as "0.1 STT".
 */
export const STT_PER_WIN = 0.1;
const USDT_PER_WIN = 5;

export function sttPrizeLabel(prizeUsdt?: number | null): string {
  const wins = Math.max(1, Math.round((prizeUsdt ?? USDT_PER_WIN) / USDT_PER_WIN));
  const stt = wins * STT_PER_WIN;
  return `${Number(stt.toFixed(1))} STT`;
}
