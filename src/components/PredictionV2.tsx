import { Grain } from "./v2/cinematic";
import FooterV2 from "./FooterV2";
import { DailyGameProvider } from "./prediction-v2/DailyGameContext";
import GameConsole from "./prediction-v2/GameConsole";

export default function PredictionV2() {
  return (
    <div className="relative min-h-screen bg-background-primary pt-14 text-white">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[36vh] w-[60vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.06] blur-[150px]" />
      <DailyGameProvider>
        <GameConsole />
      </DailyGameProvider>
      <FooterV2 />
    </div>
  );
}
