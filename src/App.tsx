import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavEthena from "./components/NavEthena";
import HeroCorrect from "./components/HeroCorrect";
import HeroV2 from "./components/HeroV2";
import YouTubeSectionV2 from "./components/YouTubeSectionV2";
import ValuePropositionV2 from "./components/ValuePropositionV2";
import TokenBackingV2 from "./components/TokenBackingV2";
import ComparisonTableV2 from "./components/ComparisonTableV2";
import ValueGrowthV2 from "./components/ValueGrowthV2";
import FAQV2 from "./components/FAQV2";
import YouTubeSection from "./components/YouTubeSection";
import ValueProposition from "./components/ValueProposition";
import TokenBacking from "./components/TokenBacking";
import ComparisonTable from "./components/ComparisonTable";
import MarketChart from "./components/MarketChart";
import HowItWorks from "./components/HowItWorks";
import Tokenomics from "./components/Tokenomics";
import Footer from "./components/Footer";
import SilverBarPurchase from "./components/SilverBarPurchase";
import PredictionGame from "./components/PredictionGame";
// import PasswordGate from "./components/PasswordGate";
import Profile from "./components/Profile";
import RewardsTerms from "./components/RewardsTerms";
import AboutUs from "./components/AboutUs";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import News from "./components/News";
import Docs from "./components/Docs";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
// import ContactButton from './components/ContactButton'

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  return (
    <>
      <HeroCorrect />
      <YouTubeSection />
      <ValueProposition />
      <TokenBacking />
      <ComparisonTable />
      <MarketChart />
      <HowItWorks />
      <Tokenomics />
    </>
  );
}

// Secret preview of the redesigned homepage (pending review/approval).
function HomePageV2() {
  return (
    <>
      <HeroV2 />
      <YouTubeSectionV2 />
      <ValuePropositionV2 />
      <TokenBackingV2 />
      <ComparisonTableV2 />
      <ValueGrowthV2 />
      <FAQV2 />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-background-primary">
        <NavEthena />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home-v2" element={<HomePageV2 />} />
          <Route path="/products" element={<SilverBarPurchase />} />
          <Route path="/prediction" element={<PredictionGame />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rewards-terms" element={<RewardsTerms />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postId" element={<BlogPost />} />
          <Route path="/news" element={<News />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <Footer />
        {/* <ContactButton /> */}
      </div>
    </Router>
  );
}

export default App;
