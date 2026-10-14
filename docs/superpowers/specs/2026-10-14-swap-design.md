# USDT ⇄ STT Swap — Design

**Date:** 2026-10-14
**Status:** Approved for planning
**Route:** `/swap` (unlisted + PasswordGate)
**Reference:** the `trade` module in `~/projects/midias`

## 1. Product

A treasury-mediated swap between USDT and STT. The user sends one token to a
SilverTimes treasury address; the backend verifies the transfer on-chain,
deducts a service fee, routes the remainder through the KyberSwap aggregator,
and sends the output token back to the user.

Both directions are supported:

- **BUY** — USDT in, STT out
- **SELL** — STT in, USDT out

This is a port of the midias `trade` module, with three security guards added
(§4) that the reference implementation does not have.

### Parameters

| Parameter | Value |
|---|---|
| Chain | Ethereum mainnet |
| STT | `0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce`, 18 decimals |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7`, 6 decimals |
| Treasury | the existing staking hot wallet, derived from `HOT_WALLET_PRIVATE_KEY` |
| Service fee | 1%, configurable via `SWAP_FEE_PERCENT` |
| Slippage tolerance | 5% (500 bps), as midias |
| Minimum swap | 0.1 USDT (BUY) · 0.001 STT (SELL) — fixed per token, as midias does |
| Maximum swap | 1,000 USDT (BUY) · 15 STT (SELL), via `SWAP_MAX_USDT` / `SWAP_MAX_STT` |
| Maximum price impact | 2%, via `SWAP_MAX_PRICE_IMPACT_PCT` — see §5.1 |
| Confirmations | 3 before a deposit is credited |
| Routing | KyberSwap aggregator |
| Quote source | KyberSwap route API |

### Why the quote does not use a Quoter contract

midias quotes by calling the Uniswap **v3** Quoter at
`0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6`. The STT/USDT pool is a Uniswap
**v4** pool (`0xdf6f11d5…`, a 32-byte pool ID rather than a v3 pool address),
which that contract cannot see. Quotes therefore come from the same KyberSwap
route API used for execution, so the quoted and executed routes agree.

Note also that STT has **18 decimals** where midias' XGZ has 8. Every amount
conversion differs from the reference by a factor of 10^10.

## 2. Data model

One new collection, in a new `swap` Nest module.

### `SwapTrade`

`userId`, `walletAddress` (lowercased snapshot), `direction` (`BUY` | `SELL`),
`amountIn`, `quotedOut`, `fee`, `feePercent`, `actualOut`, `txHashIn`
(**unique index**), `txHashOut`, `refundTxHash`, `status`, `failureReason`,
`retryCount`, `claimedAt`, `processedAt`.

Status machine, following midias:

```
PENDING ──► SWAPPING ──► COMPLETED
                │
                └──► FAILED ──► REFUNDING ──► REFUNDED
```

`quotedOut` is frozen at creation. The user is shown a minimum received based
on it, and slippage beyond tolerance triggers a refund rather than a worse fill.

## 3. Lifecycle

1. **Quote.** `GET /swap/quote?amount=&direction=` calls the KyberSwap route
   API, applies the fee to the input, and returns `amountOut`, rate, fee, the
   treasury address and the minimum received after slippage. **The fee is taken
   in the input token** and retained by the treasury — USDT on a BUY, STT on a
   SELL — matching midias.
2. **Send.** The page transfers the input token from the user's connected
   wallet to the treasury, the same mechanic as the staking page.
3. **Execute.** `POST /swap/execute { direction, amountIn, txHashIn }`, behind
   Privy auth. The backend **re-reads the chain** and requires every one of:
   receipt exists, `status === 1`, at least 3 confirmations, a `Transfer` log
   emitted by the expected token contract, `to` equals the treasury, **`from`
   equals the authenticated user's wallet**, and the amount matches within the
   0.5% tolerance midias allows for rounding. Only then is the row created.
4. **Swap.** An immediate attempt runs for responsiveness; a worker sweeps
   anything left `PENDING`, or stuck in `SWAPPING` past a timeout. Both claim
   the row with an atomic `PENDING → SWAPPING` transition, so exactly one
   executes. The fee is deducted, the net amount is routed through KyberSwap at
   5% slippage, and the output is transferred to the user.
5. **Refund.** Any failure — route unavailable, slippage breached, output
   transfer failed — moves the row to `REFUNDING` and returns the original
   token to the sender, gated on the status transition so it happens once.

## 4. Safety invariants

The reference implementation is missing the first three of these. Each needs a
test.

1. **One deposit funds exactly one trade.** Unique index on `txHashIn`. In
   midias nothing checks whether a tx hash has been used, so a single genuine
   deposit can be submitted repeatedly and paid out every time.
2. **The sender must own the trade.** The `from` address of the deposit must
   equal the authenticated user's wallet. midias sums only `Transfer` logs
   where `to === treasury` and never inspects `from`, so a third party can
   claim someone else's deposit by quoting their tx hash.
3. **Execute is authenticated.** `userAddress` is derived from the verified
   Privy token, never read from the request body. The midias endpoint has no
   guard at all.
4. **Atomic claim before any on-chain action.** `findOneAndUpdate` on
   `{ _id, status: PENDING } → SWAPPING`; a runner that loses the race skips.
   This is what lets the immediate attempt and the worker coexist.
5. **Refund happens exactly once**, gated on the `FAILED → REFUNDING`
   transition.
6. **Confirmations before crediting**, so a reorg cannot strand a credited
   trade.
7. **The backend is the authority on quote, fee and limits.** Frontend values
   are presentational and re-derived server-side.
8. **The reserve floor is checked before every swap** (§5).

Existing staking and claim logic must not be weakened to accommodate swaps.
The swap module gets its own collection and its own worker.

## 5. Reserve floor

Swaps share the staking hot wallet, so swap activity must never leave staking
unable to pay out.

The check runs immediately **before transferring STT out to a user**, which is
the BUY output leg — the only step that can reduce the wallet's STT balance.
The backend computes outstanding staking obligations as the sum of
`amountStt + rewardStt` across all positions in `ACTIVE` or `CLOSING`, and
refuses to transfer if the post-transfer balance would fall below that figure.
A refused transfer moves the trade to `REFUNDING` and returns the user's USDT;
it is never left half-finished.

A SELL pays the user in USDT and therefore cannot breach the STT floor, but it
is still subject to the same check on the STT it adds, so the two directions
share one code path.

In steady state a swap is a pass-through and should not touch staking reserves:
a BUY receives STT from the aggregator and forwards it; a SELL receives STT
from the user and swaps it away. The floor exists for the cases where that
assumption breaks — a partially failed swap, an accounting error, or a bug —
and bounds the damage from a partially failed swap. Swap size itself is
bounded by §5.1.

### 5.1 Price-impact ceiling

A flat maximum is a blunt instrument: the right size depends on how deep the
pool is on the day, which a number committed today cannot track. The STT/USDT
v4 pool is thin, so a large order can move the price materially while still
sitting inside the 5% slippage tolerance — the swap succeeds, and the user
silently receives a much worse rate than quoted.

KyberSwap's route response carries a `priceImpact` figure. The backend rejects
any quote whose price impact exceeds `SWAP_MAX_PRICE_IMPACT_PCT` (default 2%),
at **both** quote time and execute time. Checking twice matters: liquidity can
move between the two, and the execute-time check is the one that protects the
user's money.

A rejection at quote time surfaces as a clear message — "this amount would move
the price by more than 2%; try a smaller swap" — rather than a failed
transaction. At execute time the deposit has already landed, so the trade moves
to `REFUNDING` and the input is returned.

The flat per-token maxima remain as a backstop for the case where the
aggregator omits `priceImpact` or returns an implausible value; the adaptive
check is the one expected to bind in practice. Both are configurable, and both
are enforced server-side regardless of what the page sends.

## 6. API

Public:
- `GET /swap/config` — fee percent, minimum, treasury address, slippage, supported directions.
- `GET /swap/quote?amount=&direction=` — live quote.

Authenticated (Privy bearer token, as `authApi` and `stakingApi` already do):
- `POST /swap/execute` — `{ direction, amountIn, txHashIn }` → verified trade.
- `GET /swap/me` — the caller's trade history.

Admin, behind the existing `AdminSecretGuard`:
- `GET /swap/admin/trades`, `POST /swap/admin/trades/:id/retry`.

## 7. Page UX

Route `/swap`, wrapped in `PasswordGate`, not linked from nav or footer.
Components in `src/components/swap/`, built from the v2 cinematic primitives
(`Eyebrow`, `Reveal`, `FadeUp`, `Grain`) and brand colours only. No emoji.

A swap card carries the interaction: a direction toggle, the amount input, and
a live quote showing rate, the 1% fee and the minimum received. Explicit states
for: not connected, quoting, confirm in wallet, verifying on-chain, swapping,
completed, and refunded. Trade history sits below, and a short risk section
covers custody, the sender requirement and slippage.

### Key UX rules

- The **sender requirement is stated before the user sends**, as on the staking
  page. A deposit from an exchange cannot be credited.
- The **fee and minimum received are shown as concrete figures**, not
  percentages alone, before the user commits.
- A **refund is reported plainly** with its tx hash, never left as a silent
  failure.

## 8. Testing

- Unit: quote maths including fee application at both directions and both
  decimal scales; deposit verification accepting a good transfer and rejecting
  each failure individually (wrong token, wrong recipient, **wrong sender**,
  wrong amount, insufficient confirmations, failed status, **reused hash**).
- Concurrency: parallel executes of the same tx hash create exactly one trade;
  an immediate attempt and the worker never both swap the same row; a refund
  fires once under parallel failure handling.
- Reserve floor: a swap that would breach the staking obligation is refused,
  and the trade refunds rather than half-completing.
- Price impact: a quote above the ceiling is rejected; a trade whose impact
  rises above the ceiling between quote and execute refunds rather than filling.
- Worker: a row claimed by one runner is skipped by another.

No test may run against production Mongo, the real hot wallet, or the live
aggregator.

## 9. Out of scope

Limit orders, price charts, multi-hop routing choices exposed to the user,
chains other than Ethereum, tokens other than USDT and STT, and any change to
the staking or prediction claim flows.
