import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE, Grain } from "./v2/cinematic";
import FooterV2 from "./FooterV2";
import EarnHero from "./earn-v2/EarnHero";
import VaultsWindow from "./earn-v2/VaultsWindow";
import BuilderWindow from "./earn-v2/BuilderWindow";
import HowItWorks from "./earn-v2/HowItWorks";
import { DEFAULT_VAULT, type Vault } from "./earn-v2/yield";

// Silver Yield — secret, unlisted product page (/earn). Covered calls on STT:
// hold silver, pick a sell price, collect USDT upfront. Presentational mock.
//
// Two views, RYSK-style: the vaults list, and the builder you open by clicking
// Earn on a vault (or a CTA). We swap views with a plain conditional + a
// mount fade — no AnimatePresence. (mode="wait" hangs here because the list's
// whileInView children never resolve their exit, stranding the builder.)
export default function SilverYield() {
  const [selected, setSelected] = useState<Vault | null>(null);

  const open = (v: Vault) => setSelected(v);
  const back = () => setSelected(null);

  // Reset scroll on every view change so each view starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [selected]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary pt-14 text-white">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[46vh] w-[70vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.07] blur-[160px]" />
      <div className="pointer-events-none absolute right-0 top-[40vh] h-[36vh] w-[40vw] rounded-full bg-brand-teal/[0.05] blur-[150px]" />

      <div className="relative min-h-[70vh]">
        {selected ? (
          <motion.div
            key={`detail-${selected.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <BuilderWindow vault={selected} onBack={back} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <EarnHero onStart={() => open(DEFAULT_VAULT)} />
            <VaultsWindow onEarn={open} />
            <HowItWorks onStart={() => open(DEFAULT_VAULT)} />
          </motion.div>
        )}
      </div>

      <FooterV2 />
    </div>
  );
}
