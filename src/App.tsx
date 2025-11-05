import NavEthena from './components/NavEthena'
import HeroCorrect from './components/HeroCorrect'
import ValueProposition from './components/ValueProposition'
import TokenBacking from './components/TokenBacking'
import MarketChart from './components/MarketChart'
import HowItWorks from './components/HowItWorks'
import Tokenomics from './components/Tokenomics'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-background-primary">
      <NavEthena />
      <HeroCorrect />
      <ValueProposition />
      <TokenBacking />
      <MarketChart />
      <HowItWorks />
      <Tokenomics />
      <Footer />
    </div>
  )
}

export default App
