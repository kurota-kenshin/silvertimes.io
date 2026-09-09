import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Grain } from "../v2/cinematic";
import FooterV2 from "../FooterV2";
import { stakingApi } from "../../services/api";
import StakingHero from "./StakingHero";
import TermCards from "./TermCards";
import StakePanel from "./StakePanel";
import PositionsPanel from "./PositionsPanel";
import ParametersSheet from "./ParametersSheet";
import RiskNotes from "./RiskNotes";
import type { MyStaking, StakingConfig, TermDays } from "./staking";

// STT Staking — secret, unlisted product page (/staking), behind PasswordGate.
// Distinct product from Silver Yield (/earn): a fixed-term deposit paying STT
// interest at maturity, not a covered call paying a USDT premium upfront.
export default function StakingPage() {
  const { authenticated, getAccessToken } = usePrivy();

  const [config, setConfig] = useState<StakingConfig | null>(null);
  const [me, setMe] = useState<MyStaking | null>(null);
  const [term, setTerm] = useState<TermDays>(90);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const cfg = await stakingApi.getConfig();
    setConfig(cfg);

    if (authenticated) {
      const token = await getAccessToken();
      if (token) {
        setMe(await stakingApi.getMe(token).catch(() => null));
        return;
      }
    }
    setMe(null);
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary pt-14 text-white">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[46vh] w-[70vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.07] blur-[160px]" />
      <div className="pointer-events-none absolute right-0 top-[46vh] h-[36vh] w-[40vw] rounded-full bg-brand-teal/[0.05] blur-[150px]" />

      <StakingHero pool={config?.pool ?? null} loading={loading} />
      <TermCards term={term} onSelect={setTerm} />
      <StakePanel config={config} me={me} term={term} onStaked={reload} />
      <PositionsPanel me={me} onChanged={reload} />
      <ParametersSheet />
      <RiskNotes treasuryAddress={config?.treasuryAddress ?? ""} />

      <FooterV2 />
    </div>
  );
}
