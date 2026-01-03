import { create } from 'zustand'
import { fetchSilverPriceData, PriceData } from '../services/silverPriceService'

// Historical silver prices for 5-year average APY calculation (annual averages)
const HISTORICAL_SILVER_PRICES = [
  { year: 2020, price: 20.55 },
  { year: 2021, price: 25.14 },
  { year: 2022, price: 21.73 },
  { year: 2023, price: 23.35 },
  { year: 2024, price: 28.27 },
];

// Calculate 5-year CAGR (Compound Annual Growth Rate)
export function calculateFiveYearAPY(): number {
  const startPrice = HISTORICAL_SILVER_PRICES[0].price; // 2020
  const endPrice = HISTORICAL_SILVER_PRICES[HISTORICAL_SILVER_PRICES.length - 1].price; // 2024
  const years = HISTORICAL_SILVER_PRICES.length - 1; // 4 years

  // CAGR formula: (EndValue/StartValue)^(1/years) - 1
  const cagr = Math.pow(endPrice / startPrice, 1 / years) - 1;
  return cagr;
}

// Get formatted APY string (e.g., "8%" or "8.3%")
export function getFormattedAPY(): string {
  const apy = calculateFiveYearAPY() * 100;
  // Round to nearest integer if close, otherwise show one decimal
  return apy % 1 < 0.1 || apy % 1 > 0.9
    ? `${Math.round(apy)}%`
    : `${apy.toFixed(1)}%`;
}

// Get the APY as a decimal for calculations
export const SILVER_APY = calculateFiveYearAPY();

interface SilverPriceState {
  currentPrice: number | null
  weeklyData: PriceData[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  silverAPY: number

  // Actions
  fetchData: () => Promise<void>
  setError: (error: string | null) => void
}

// Fallback data in case API fails - 12 weeks back from November 10, 2025
const FALLBACK_DATA: PriceData[] = [
  { date: '2025-08-18', price: 32.15 },
  { date: '2025-08-25', price: 32.89 },
  { date: '2025-09-01', price: 31.45 },
  { date: '2025-09-08', price: 30.95 },
  { date: '2025-09-15', price: 31.28 },
  { date: '2025-09-22', price: 30.73 },
  { date: '2025-09-29', price: 31.52 },
  { date: '2025-10-06', price: 31.89 },
  { date: '2025-10-13', price: 30.42 },
  { date: '2025-10-20', price: 29.98 },
  { date: '2025-10-27', price: 30.55 },
  { date: '2025-11-03', price: 32.50 },
]

export const useSilverPriceStore = create<SilverPriceState>((set) => ({
  currentPrice: null,
  weeklyData: [],
  isLoading: true,
  error: null,
  lastUpdated: null,
  silverAPY: SILVER_APY,

  fetchData: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await fetchSilverPriceData()

      set({
        currentPrice: data.currentPrice,
        weeklyData: data.weeklyData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      // Use fallback data if API fails
      console.error('Failed to fetch live silver price, using fallback:', error)
      set({
        currentPrice: 32.50,
        weeklyData: FALLBACK_DATA,
        isLoading: false,
        error: 'Unable to load live data - using fallback',
        lastUpdated: null,
      })
    }
  },

  setError: (error) => set({ error }),
}))
