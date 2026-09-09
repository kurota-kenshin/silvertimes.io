# STT Staking — Design

**Date:** 2026-09-09
**Status:** Approved for planning
**Route:** `/staking` (unlisted + PasswordGate)

## 1. Product

A closed, fixed-term staking campaign on STT. A user locks STT for 30 or 90 days
at a fixed annualised rate and receives principal plus interest at maturity.
Rewards are paid from a finite pool; when the pool is fully committed, staking
closes.

Staking is a **separate product from Silver Yield (`/earn`)**. Silver Yield sells
covered calls and pays a USDT premium upfront. Staking is a term deposit that
pays STT interest at maturity. They share the v2 cinematic design language and
the "unlisted route" mechanic, and nothing else — no shared data model, no
shared components beyond `src/components/v2/cinematic.tsx`.

### Parameters

| Parameter | Value |
|---|---|
| Deposit asset | STT (ERC-20, Ethereum mainnet, `0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce`, 18 dp) |
| Terms | 30 days at 10.0%, 90 days at 15.0% |
| Interest | Simple, pro-rated: `principal × rate × days / 365` |
| Minimum stake | 1.00 STT per position |
| Maximum stake | 10.00 STT per wallet, summed across all active positions |
| Amount precision | 2 decimal places |
| Positions per user | Multiple, subject to the 10 STT wallet cap |
| Reward pool | 14.28 STT (≈ $1,000 at ≈ $70/STT) |
| Pool exhaustion | Rewards reserved at stake time, first come first served. At full commitment, new stakes close. |
| Maturity payout | User-initiated claim |
| Early unstake | Any time before maturity: 80% of principal returned, zero interest, reserved reward released back to the pool |
| Campaign window | Open until the pool is exhausted; no end date |

### Reward maths

Interest is simple and pro-rated, not compounded. The UI labels the rate
"Fixed rate (annualised)" so the wording matches the arithmetic.

| Stake | 30D @ 10% | 90D @ 15% |
|---|---|---|
| 1 STT | 0.0082 STT | 0.0370 STT |
| 10 STT | 0.0822 STT | 0.3699 STT |

The pool therefore supports roughly 38 participants at the 10 STT / 90D
extreme and roughly 1,737 at the 1 STT / 30D extreme. Because that range is so
wide, the page shows **committed rewards against pool size**, never a
"spots remaining" count.

## 2. Custody and the deposit pipeline

Staking is **custodial**. There is no staking contract. User STT is transferred
to a SilverTimes treasury address; the backend records the position; at maturity
the existing hot wallet returns principal plus interest via
`TransferService.transferStt`.

The pipeline is **site-initiated with on-chain verification, plus an
intent-matched backstop**:

1. **Intent.** User picks term and amount and presses Stake. Backend creates a
   `StakeIntent` (wallet, amount, term, 30-minute expiry) that atomically holds
   both pool headroom and quota for its lifetime, and returns the treasury
   address. The hold is released on expiry.
2. **Transfer.** The page sends the ERC-20 transfer from the user's connected
   wallet to the treasury.
3. **Confirm.** The page POSTs the tx hash. The backend **independently
   re-reads the chain** — it never trusts the client's claim about what
   happened — and creates the position only if every check passes.
4. **Backstop.** A scheduled job scans recent treasury deposits and, for any
   deposit matching an open intent by sender and amount, creates the position
   anyway. This closes the "user closed the tab after sending" hole.

The backstop only ever matches against intents a user explicitly created, so
there is no open-ended unattributable-deposit queue and no guessing about who
sent what.

### Deposit verification

A deposit is credited only when all of the following hold:

- Receipt exists and `status === 1`.
- At least 3 confirmations.
- The tx contains an ERC-20 `Transfer` log emitted by the STT contract.
- `to` equals the configured treasury address.
- `from` equals the wallet the user authenticated with via Privy.
- The transferred amount equals the intent amount exactly.
- The tx hash has not already been used (enforced by a unique index).

Deposits from an exchange or an unregistered wallet fail the `from` check and
are never auto-credited. The page states this requirement prominently before
the user sends anything, and an admin reconciliation endpoint exists for
manual resolution.

## 3. Data model

Four new Mongo collections, in a new `staking` Nest module.

### `StakeIntent`
`userId`, `walletAddress`, `amountStt`, `termDays` (30 | 90), `rewardStt`,
`status` (OPEN | CONSUMED | EXPIRED), `expiresAt`.

Short-lived, and it **holds a soft reservation** on both the pool and the user's
quota for its lifetime. Without that hold, several users could each pass the
headroom check, all send STT, and the last few would arrive to an exhausted
pool having already paid gas — principal in the treasury with no reward to
credit. Expiry releases the hold.

If a deposit still lands against an expired intent (a slow transfer, or the
backstop finding it late) and no pool headroom remains, the position is **not**
created at a reduced rate. The deposit is recorded as `UNCREDITED` and refunded
in full, and it appears in the admin reconciliation view. A staker is never
silently given less than the rate they were shown.

### `StakingPosition`
`userId`, `walletAddress`, `amountStt`, `termDays`, `aprBps` (1000 | 1500),
`rewardStt` (computed and frozen at creation), `depositTxHash` (**unique
index**), `stakedAt`, `maturesAt`, `status` (ACTIVE | CLOSING | CLOSED),
`closeKind` (MATURITY | EARLY), `closedAt`.

`rewardStt` is frozen at creation so a later config change cannot retroactively
alter what a staker is owed.

### `StakingPayout`
Mirrors `Claim` deliberately, so the proven state machine and worker are reused
in shape: `positionId`, `userId`, `walletAddress`, `principalStt`, `rewardStt`,
`totalStt`, `kind` (MATURITY | EARLY), `status` (PENDING | PROCESSING |
COMPLETED | FAILED), `txHash`, `failureReason`, `retryCount`, `processedAt`.

### `StakingPool`
Singleton: `totalRewardStt` (14.28), `heldRewardStt` (open intents),
`committedRewardStt` (live positions), `paidRewardStt`, `isOpen`.

Headroom is `totalRewardStt − heldRewardStt − committedRewardStt`. Staking
closes when headroom drops below the smallest possible reward (1 STT on 30D =
0.0082 STT).

## 4. Safety invariants

This design puts user principal in the hot wallet. That is the same surface as
the July 2026 concurrent-claim double-payment incident, so the following are
non-negotiable and each needs a test.

1. **A deposit tx can never fund two positions.** Unique index on
   `depositTxHash`. This is the single most important guard — it makes the
   confirm endpoint idempotent and makes the backstop job safe to run
   concurrently with it.
2. **Reward reservation is atomic.** Taking a hold is one `findOneAndUpdate` on
   the pool document guarded by
   `$expr: heldRewardStt + committedRewardStt + reward <= totalRewardStt`,
   incrementing in the same operation. A read-then-write cannot oversubscribe
   the pool. Converting a hold to a commitment on position creation moves the
   amount from `heldRewardStt` to `committedRewardStt` in a single update.
3. **The wallet quota is atomic.** The 10 STT cap is enforced by a guarded
   `findOneAndUpdate` on the user's running staked total, in the same style as
   the existing `claimedWinnings` guard, not by a separate read.
4. **One active payout per position.** Partial unique index on
   `{ positionId, status ∈ [PENDING, PROCESSING] }`, matching the existing
   claim index.
5. **The worker takes ownership before broadcasting.** Every payout is locked
   with `findOneAndUpdate({ _id, status: PENDING } → PROCESSING)` and skipped
   if the lock is lost — the exact guard that stopped the double-broadcast
   nonce race in `auth.service.ts`.
6. **Releasing a reward on early exit happens exactly once**, gated on the
   `ACTIVE → CLOSING` status transition, so a retried request cannot credit the
   pool twice.
7. **Early exit and maturity claim are mutually exclusive**, both funnelling
   through the same `ACTIVE → CLOSING` transition.
8. **A hold is released exactly once**, gated on the intent's
   `OPEN → CONSUMED | EXPIRED` transition, so neither the confirm endpoint nor
   the expiry sweeper can double-release capacity back into the pool.
9. **The backend is the authority on min, max, rate and maturity.** Frontend
   values are presentational mirrors and are re-derived server-side.

Existing claim-flow logic must not be weakened to accommodate staking. Staking
gets its own collections and its own worker.

## 5. API

Public:
- `GET /staking/config` — terms, rates, min/max, pool totals, open/closed.

Authenticated (Privy bearer token, as `authApi` does today):
- `GET /staking/me` — positions, staked total, remaining allowance, payouts.
- `POST /staking/intent` — `{ amountStt, termDays }` → intent + treasury address.
- `POST /staking/confirm` — `{ intentId, txHash }` → verified position.
- `POST /staking/positions/:id/claim` — matured payout.
- `POST /staking/positions/:id/unstake` — early exit.

Admin:
- `GET /staking/admin/positions`, `POST /staking/admin/reconcile`,
  `POST /staking/admin/process-payouts`.

## 6. Page UX

Route `/staking`, wrapped in `PasswordGate`, not linked from nav or footer.
Components live in `src/components/staking/`, styled with the existing v2
cinematic primitives (`Eyebrow`, `Reveal`, `FadeUp`, `Grain`) and brand colours
only. No emoji anywhere.

Section layouts deliberately vary so the page does not read as one repeated
template:

1. **Hero** — full-bleed, left-aligned cinematic type. "Lock silver. Earn
   silver." Live pool meter as the hero's proof element: a thin committed/total
   bar with the remaining reward figure.
2. **Term choice** — two large side-by-side cards, 30D and 90D, not a table.
   Each shows the rate as the dominant figure, the lockup, and the maturity
   date it would produce if started today. Selecting one drives the calculator.
3. **Stake panel** — the interactive core, centred and narrower than the
   sections around it. Amount input with a 1–10 slider, live reward preview,
   maturity date, and the resulting total. Explicit states for: not connected,
   connected but zero allowance, dust allowance below the 1 STT floor, pool
   exhausted.
4. **Your positions** — appears only when the user has positions. Horizontal
   cards with a circular maturity progress ring, days remaining, accrued
   figure, and the primary action (Claim when matured, Unstake with its penalty
   spelled out before confirmation).
5. **Technical parameters** — the source table, restyled as a dark spec sheet
   with a left accent rule rather than a bordered grid.
6. **Risk and mechanics** — plain-language notes on custody, the sender-address
   requirement, and the early-exit penalty.

### Key UX rules

- The **sender-address requirement is stated before the user sends**, not after
  a failed deposit. This is the highest-risk user error in the whole flow.
- The **20% early-exit penalty is quoted as a concrete STT figure** in the
  confirmation step, never as a bare percentage.
- The **dust allowance state is explicit**: "0.5 STT allowance remaining, below
  the 1 STT minimum" rather than a button that fails validation.
- Pending deposits show a **verification-in-progress state** while
  confirmations accumulate, so the user is never left staring at an unchanged
  page after paying gas.

## 7. Testing

- Unit: interest maths at both terms and both amount bounds; maturity date
  derivation; deposit verification accepting a good tx and rejecting each
  failure mode individually (wrong recipient, wrong sender, wrong token, wrong
  amount, insufficient confirmations, failed status, reused hash).
- Concurrency: parallel confirms of the same tx hash create exactly one
  position; parallel stakes cannot exceed the 10 STT cap; parallel stakes
  cannot oversubscribe the reward pool; parallel claim and unstake on one
  position produce exactly one payout.
- Holds: parallel intents cannot oversubscribe the pool; an expired intent
  releases its hold exactly once; a consumed intent cannot also be expired.
- Worker: a payout locked by one runner is skipped by another.

No test may run against production Mongo or the real hot wallet.

## 8. Out of scope

Compounding interest, term extension or auto-roll, secondary transfer of
positions, non-Ethereum chains, USDT-denominated rewards, and any change to the
existing prediction claim flow.
