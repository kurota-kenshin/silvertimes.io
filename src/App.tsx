import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavEthena from "./components/NavEthena";
import HeroCorrect from "./components/HeroCorrect";
import YouTubeSection from "./components/YouTubeSection";
import ValueProposition from "./components/ValueProposition";
import TokenBacking from "./components/TokenBacking";
import MarketChart from "./components/MarketChart";
import HowItWorks from "./components/HowItWorks";
import Tokenomics from "./components/Tokenomics";
import Footer from "./components/Footer";
import SilverBarPurchase from "./components/SilverBarPurchase";
import PredictionGame from "./components/PredictionGame";
import PasswordGate from "./components/PasswordGate";
import Profile from "./components/Profile";
import RewardsTerms from "./components/RewardsTerms";
import AboutUs from "./components/AboutUs";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import News from "./components/News";
import Docs from "./components/Docs";
import Terms from "./components/Terms";
// import ContactButton from './components/ContactButton'

function HomePage() {
  return (
    <>
      <HeroCorrect />
      <YouTubeSection />
      <ValueProposition />
      <TokenBacking />
      <MarketChart />
      <HowItWorks />
      <Tokenomics />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-primary">
        <NavEthena />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<SilverBarPurchase />} />
          <Route path="/prediction" element={<PasswordGate><PredictionGame /></PasswordGate>} />
          <Route path="/profile" element={<PasswordGate><Profile /></PasswordGate>} />
          <Route path="/rewards-terms" element={<RewardsTerms />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postId" element={<BlogPost />} />
          <Route path="/news" element={<News />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
        <Footer />
        {/* <ContactButton /> */}
      </div>
    </Router>
  );
}

export default App;
