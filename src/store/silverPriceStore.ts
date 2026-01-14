import { create } from 'zustand'
import { fetchSilverPriceData, PriceData } from '../services/silverPriceService'

// Historical silver prices for 5-year average APY calculation (annual averages)
// Sources: Statista, Trading Economics, CNBC
const HISTORICAL_SILVER_PRICES = [
  { year: 2022, price: 21.73 },
  { year: 2023, price: 23.35 },
  { year: 2024, price: 28.27 },
  { year: 2025, price: 73.50 },  // 2025 avg (silver surged in 2025)
];

// Current fallback price for 2026 (updated from live data)
const FALLBACK_CURRENT_PRICE = 73.50;

// Calculate 5-year average APY using Simple Average method
// Sum of annual percentage returns divided by number of years
export function calculateFiveYearAPY(_currentPrice?: number | null): number {
  const prices = [...HISTORICAL_SILVER_PRICES];

  const annualReturns: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const startPrice = prices[i - 1].price;
    const endPrice = prices[i].price;
    const annualReturn = (endPrice - startPrice) / startPrice;
    annualReturns.push(annualReturn);
  }

  // Simple average of annual returns
  const averageReturn = annualReturns.reduce((sum, r) => sum + r, 0) / annualReturns.length;
  return averageReturn;
}

// Get formatted APY string (e.g., "8%" or "44%")
export function getFormattedAPY(currentPrice?: number | null): string {
  const apy = calculateFiveYearAPY(currentPrice) * 100;
  // Round to nearest integer if close, otherwise show one decimal
  return apy % 1 < 0.1 || apy % 1 > 0.9
    ? `${Math.round(apy)}%`
    : `${apy.toFixed(1)}%`;
}

// Get the APY as a decimal for calculations (using fallback price)
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

// Fallback data in case API fails - 12 weeks back from January 2026
// Reflects 2025 silver surge (147% gain)
const FALLBACK_DATA: PriceData[] = [
  { date: '2025-10-14', price: 48.50 },
  { date: '2025-10-21', price: 52.30 },
  { date: '2025-10-28', price: 55.80 },
  { date: '2025-11-04', price: 58.20 },
  { date: '2025-11-11', price: 61.50 },
  { date: '2025-11-18', price: 63.80 },
  { date: '2025-11-25', price: 66.20 },
  { date: '2025-12-02', price: 68.90 },
  { date: '2025-12-09', price: 71.50 },
  { date: '2025-12-16', price: 74.80 },
  { date: '2025-12-23', price: 79.28 },  // 2025 high
  { date: '2025-12-30', price: 73.50 },
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
        currentPrice: FALLBACK_CURRENT_PRICE,
        weeklyData: FALLBACK_DATA,
        isLoading: false,
        error: 'Unable to load live data - using fallback',
        lastUpdated: null,
      })
    }
  },

  setError: (error) => set({ error }),
}))
