import { useState } from "react";
import type { ReactNode } from "react";
import { Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";
import FooterV2 from "./FooterV2";

const AUDIT_PDF = "/docs/Beosin_Audit_Report_-_SilverTimes_202605061100.pdf";

// Brink's issues a fresh holding certificate every month. Newest first —
// add one entry per month and the page stays short: the latest is featured
// and everything older collapses into the compact archive list below it.
const porStatements: { period: string; href: string }[] = [
  {
    period: "May 2026",
    href: "/docs/Brinks_SilverTimes_Holding_Certificate_STT_Assets_Limited_1019.pdf",
  },
];

const badges = ["1:1 Backed", "Brink's, London", "Beosin Audited", "Monthly Proof-of-Reserves"];

const porIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M13.5 3.5V8H18" />
    <circle cx="11.5" cy="13.5" r="2.2" />
    <path d="M10 15.4 9 19l2.5-1.4L14 19l-1-3.6" />
  </svg>
);

const auditIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 5 5.6V11c0 4.2 3 7.5 7 9 4-1.5 7-4.8 7-9V5.6L12 3Z" />
    <path d="m9 11.8 2 2 4-4.2" />
  </svg>
);

const commitments = [
  { title: "Secure Storage", desc: "Physical silver stored at Brink's in London, with monthly storage slips for complete transparency." },
  { title: "Independent Audits", desc: "Security audits conducted by Beosin, with an annual report and monthly reviews." },
  { title: "Proof-of-Reserves", desc: "1:1 backing verifiable on demand through Proof-of-Reserves and live on-chain dashboards." },
  { title: "Open-Source Contracts", desc: "$STT runs on Ethereum using open-source, audited smart contracts — verifiable by anyone." },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-teal">
      {children}
    </span>
  );
}

const arrowIcon = (
  <svg className="h-4 w-4 transition-transform group-hover/row:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5v5m0-5L10 14M9 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
  </svg>
);

// Card shell — shared gradient-border / hover-glow chrome used by both docs.
function DocCard({
  icon,
  chip,
  title,
  desc,
  children,
}: {
  icon: ReactNode;
  chip: string;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative h-full">
      <div className="pointer-events-none absolute -inset-2 rounded-[1.7rem] bg-gradient-to-br from-brand-blue/15 via-brand-teal/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full rounded-[1.35rem] bg-gradient-to-br from-white/[0.14] via-white/[0.04] to-transparent p-px">
        <div className="relative flex h-full flex-col rounded-[1.3rem] bg-background-secondary/70 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-blue/20 to-brand-teal/5 text-brand-sky">
              {icon}
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-silver-300">
              {chip}
            </span>
          </div>
          <h3 className="mb-2 mt-7 text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-silver-400">{desc}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

// One tappable statement row — used for both the featured latest and archive.
function StatementRow({
  period,
  href,
  featured = false,
}: {
  period: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group/row flex items-center justify-between rounded-xl px-4 transition-colors ${
        featured
          ? "border border-white/10 bg-white/[0.03] py-3.5 hover:border-brand-teal/40 hover:bg-brand-blue/[0.07]"
          : "py-2.5 hover:bg-white/[0.04]"
      }`}
    >
      <span className="flex items-center gap-3">
        {featured && (
          <span className="rounded-md bg-brand-teal/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-teal">
            Latest
          </span>
        )}
        <span className={`text-sm ${featured ? "font-medium text-white" : "text-silver-300"}`}>
          {period}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-sky transition-colors group-hover/row:text-white">
        View PDF
        {arrowIcon}
      </span>
    </a>
  );
}

// Proof-of-Reserve card: latest certificate featured, older months tucked
// into a collapsible, scrollable archive so the page never runs long.
function ProofOfReserveCard() {
  const [open, setOpen] = useState(false);
  const [latest, ...archive] = porStatements;

  return (
    <DocCard
      icon={porIcon}
      chip="Proof of Reserve"
      title="Brink's Holding Certificate"
      desc="Independent custody confirmation of the physical silver backing $STT, securely held at Brink's in London — issued fresh every month."
    >
      <div className="mt-auto pt-7">
        {latest && <StatementRow period={latest.period} href={latest.href} featured />}

        {archive.length > 0 && (
          <>
            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-silver-400 transition-colors hover:text-white"
            >
              {open
                ? "Hide previous statements"
                : `View ${archive.length} previous statement${archive.length > 1 ? "s" : ""}`}
              <svg
                className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="mt-2 max-h-52 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/8 bg-background-primary/30 px-1">
                {archive.map((s) => (
                  <StatementRow key={s.period} period={s.period} href={s.href} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DocCard>
  );
}

function AuditCard() {
  return (
    <DocCard
      icon={auditIcon}
      chip="Smart Contract Audit"
      title="Beosin Audit Report"
      desc="Full third-party security audit of the $STT smart contracts, with an annual report and monthly reviews."
    >
      <div className="mt-auto flex items-center justify-between pt-7">
        <span className="text-xs text-silver-500">Beosin · May 2026</span>
        <a
          href={AUDIT_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="group/row inline-flex items-center gap-1.5 text-sm font-medium text-brand-sky transition-colors hover:text-white"
        >
          View PDF
          {arrowIcon}
        </a>
      </div>
    </DocCard>
  );
}

export default function Transparency() {
  return (
    <>
      <main className="relative overflow-hidden bg-black">
        <Grain />
        <div className="pointer-events-none absolute left-1/2 top-[12%] h-[45vh] w-[60vw] -translate-x-1/2 rounded-full bg-brand-teal/[0.07] blur-[160px]" />
        <div className="pointer-events-none absolute right-0 top-[55%] h-[40vh] w-[45vw] translate-x-1/4 rounded-full bg-brand-blue/[0.05] blur-[160px]" />

        {/* Hero */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-36 sm:px-10 lg:px-16 lg:pt-44">
          <FadeUp scroll={false} className="mb-7">
            <Eyebrow>Transparency</Eyebrow>
          </FadeUp>

          <h1 className="max-w-3xl text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white">
            <Reveal scroll={false}>Verifiable</Reveal>
            <Reveal scroll={false} delay={0.08} className="gradient-text">
              by design
            </Reveal>
          </h1>

          <FadeUp scroll={false} delay={0.18} className="mt-7 max-w-2xl">
            <p className="text-[clamp(1rem,2vw,1.25rem)] font-light leading-relaxed text-silver-300">
              Every $STT is backed 1:1 by real silver — and you never have to take our
              word for it. Custody, audits, and reserves are open to inspection.
            </p>
          </FadeUp>

          <FadeUp scroll={false} delay={0.28} className="mt-9 flex flex-wrap gap-2.5">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs text-silver-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
                {b}
              </span>
            ))}
          </FadeUp>
        </div>

        {/* Attestation documents */}
        <div className="relative z-10 mx-auto mt-24 max-w-5xl px-6 sm:px-10 lg:mt-28 lg:px-16">
          <FadeUp className="mb-8">
            <SectionLabel>Attestations &amp; Reports</SectionLabel>
          </FadeUp>

          <div className="grid items-start gap-5 sm:grid-cols-2">
            <FadeUp y={28} className="h-full">
              <ProofOfReserveCard />
            </FadeUp>
            <FadeUp delay={0.08} y={28} className="h-full">
              <AuditCard />
            </FadeUp>
          </div>
        </div>

        {/* On-chain reserves — reserved for the HashKey explorer */}
        <div className="relative z-10 mx-auto mt-24 max-w-5xl px-6 sm:px-10 lg:mt-28 lg:px-16">
          <FadeUp className="mb-8">
            <SectionLabel>On-chain</SectionLabel>
          </FadeUp>

          <FadeUp y={28} className="rounded-[1.6rem] bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent p-px shadow-[0_40px_140px_-50px_rgba(0,0,0,0.9)]">
            <div className="rounded-[1.55rem] bg-background-secondary/70 p-8 backdrop-blur-sm sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-lg">
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">
                    Track every $STT on-chain
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-silver-400">
                    View live $STT mint, redeem, and transfer activity on the HashKey Chain
                    explorer. Full on-chain reserve visibility is being wired up.
                  </p>
                </div>
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-silver-400">
                  View on HashKey Explorer
                  <span className="rounded-full bg-brand-teal/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-teal">
                    Soon
                  </span>
                </span>
              </div>

              {/* Reserved space: skeleton transaction feed */}
              <div className="mt-8 overflow-hidden rounded-xl border border-white/8 bg-background-primary/40">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/8 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-silver-600">
                  <span>Transaction</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span className="text-right">Time</span>
                </div>
                {[0, 1, 2].map((r) => (
                  <div key={r} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-4 px-5 py-4">
                    <span className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
                    <span className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                    <span className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                    <span className="ml-auto h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                  </div>
                ))}
                <p className="border-t border-white/8 px-5 py-3 text-center text-xs text-silver-600">
                  Live $STT transactions — coming soon
                </p>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Commitments */}
        <div className="relative z-10 mx-auto mt-24 max-w-5xl px-6 pb-28 sm:px-10 lg:mt-28 lg:px-16 lg:pb-36">
          <FadeUp className="mb-8">
            <SectionLabel>How we stay accountable</SectionLabel>
          </FadeUp>

          <div className="grid gap-5 sm:grid-cols-2">
            {commitments.map((c, i) => (
              <FadeUp key={c.title} delay={i * 0.08} y={24} className="h-full">
                <div className="h-full rounded-[1.3rem] border border-white/8 bg-background-secondary/50 p-7">
                  <h3 className="mb-2 text-lg font-semibold text-white">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-silver-400">{c.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </main>

      <FooterV2 />
    </>
  );
}
