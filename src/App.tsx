import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavEthena from "./components/NavEthena";
import HeroCorrect from "./components/HeroCorrect";
import ValueProposition from "./components/ValueProposition";
import TokenBacking from "./components/TokenBacking";
import MarketChart from "./components/MarketChart";
import HowItWorks from "./components/HowItWorks";
import Tokenomics from "./components/Tokenomics";
import Footer from "./components/Footer";
import SilverBarPurchase from "./components/SilverBarPurchase";
import PredictionGame from "./components/PredictionGame";
import RewardsTerms from "./components/RewardsTerms";
import AboutUs from "./components/AboutUs";
import Blog from "./components/Blog";
import News from "./components/News";
import Docs from "./components/Docs";
// import ContactButton from './components/ContactButton'

function HomePage() {
  return (
    <>
      <HeroCorrect />
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
          <Route path="/prediction" element={<PredictionGame />} />
          <Route path="/rewards-terms" element={<RewardsTerms />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/news" element={<News />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
        <Footer />
        {/* <ContactButton /> */}
      </div>
    </Router>
  );
}

export default App;
