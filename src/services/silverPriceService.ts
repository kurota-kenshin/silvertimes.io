/**
 * Silver Price Service
 * Fetches live silver price data from backend API
 */

export interface PriceData {
  date: string
  price: number
}

export interface SilverPriceResponse {
  currentPrice: number
  weeklyData: PriceData[]
  source?: 'live' | 'fallback'
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8182'

/**
 * Fetch silver price data from backend
 */
export const fetchSilverPriceData = async (): Promise<SilverPriceResponse> => {
  const response = await fetch(`${API_URL}/price/silver`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    currentPrice: data.currentPrice,
    weeklyData: data.weeklyData,
    source: data.source,
  }
}

/**
 * Legacy function for backwards compatibility
 */
export const fetchCurrentSilverPrice = async (): Promise<number> => {
  const data = await fetchSilverPriceData()
  return data.currentPrice
}

/**
 * Legacy function for backwards compatibility
 */
export const fetchWeeklySilverData = async (
  _currentPrice: number,
  _weeks: number = 12
): Promise<PriceData[]> => {
  const data = await fetchSilverPriceData()
  return data.weeklyData
}
