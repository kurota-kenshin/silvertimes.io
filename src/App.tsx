import NavEthena from './components/NavEthena'
import HeroCorrect from './components/HeroCorrect'
import TokenBacking from './components/TokenBacking'
import MarketChart from './components/MarketChart'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-background-primary">
      <NavEthena />
      <HeroCorrect />
      <TokenBacking />
      <MarketChart />
      <Footer />
    </div>
  )
}

export default App
