import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavEthena from "./components/NavEthena";
import { AirdropBanner, CoinstoreListingPopup } from "./components/CoinstorePromo";
import HeroCorrect from "./components/HeroCorrect";
import HeroV2 from "./components/HeroV2";
import YouTubeSectionV2 from "./components/YouTubeSectionV2";
import ValuePropositionV2 from "./components/ValuePropositionV2";
import TokenBackingV2 from "./components/TokenBackingV2";
import ComparisonTableV2 from "./components/ComparisonTableV2";
import ValueGrowthV2 from "./components/ValueGrowthV2";
import FAQV2 from "./components/FAQV2";
import FooterV2 from "./components/FooterV2";
import Transparency from "./components/Transparency";
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
import PredictionV2 from "./components/PredictionV2";
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

// Redesigned homepage — now the primary site homepage at "/".
function HomePageV2() {
  return (
    <>
      <HeroV2 />
      <AirdropBanner />
      <YouTubeSectionV2 />
      <ValuePropositionV2 />
      <TokenBackingV2 />
      <ComparisonTableV2 />
      <ValueGrowthV2 />
      <FAQV2 />
      <FooterV2 />
    </>
  );
}

// The redesigned (v2) routes ship their own FooterV2, so the legacy global
// footer is suppressed on them. The legacy "-v1" routes keep the global footer.
const V2_ROUTES = ["/", "/transparency", "/prediction"];

function SiteFooter() {
  const { pathname } = useLocation();
  if (V2_ROUTES.includes(pathname)) return null;
  return <Footer />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-background-primary">
        <NavEthena />
        <CoinstoreListingPopup />
        <Routes>
          <Route path="/" element={<HomePageV2 />} />
          <Route path="/home-v1" element={<HomePage />} />
          {/* Old preview URLs now redirect to the canonical paths. */}
          <Route path="/home-v2" element={<Navigate to="/" replace />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/products" element={<SilverBarPurchase />} />
          <Route path="/prediction" element={<PredictionV2 />} />
          <Route path="/prediction-v1" element={<PredictionGame />} />
          <Route path="/prediction-v2" element={<Navigate to="/prediction" replace />} />
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
        <SiteFooter />
        {/* <ContactButton /> */}
      </div>
    </Router>
  );
}

export default App;
