import { Grain } from "./v2/cinematic";
import FooterV2 from "./FooterV2";
import DailyHero from "./prediction-v2/DailyHero";
import ResultReveal from "./prediction-v2/ResultReveal";
import PredictionCard from "./prediction-v2/PredictionCard";
import ClaimPanel from "./prediction-v2/ClaimPanel";
import StreakPanel from "./prediction-v2/StreakPanel";
import Leaderboards from "./prediction-v2/Leaderboards";
import HowItWorks from "./prediction-v2/HowItWorks";
import RecentWinners from "./prediction-v2/RecentWinners";

export default function PredictionV2() {
  return (
    <div className="relative min-h-screen bg-background-primary text-white">
      <Grain />
      <DailyHero />
      <ResultReveal />
      <PredictionCard />
      <ClaimPanel />
      <StreakPanel />
      <Leaderboards />
      <RecentWinners />
      <HowItWorks />
      <FooterV2 />
    </div>
  );
}
