/**
 * Silver Price Service
 * Handles fetching live silver price data from Metals-API (LBMA prices)
 */

export interface PriceData {
  date: string
  price: number
}

export interface SilverPriceResponse {
  currentPrice: number
  weeklyData: PriceData[]
}

// Metals-API credentials from environment variables
const METALS_API_TOKEN = import.meta.env.VITE_METALS_API_TOKEN || ''
const METALS_API_USER_ID = import.meta.env.VITE_METALS_API_USER_ID || ''

/**
 * Fetch current silver price from Metals-API
 * Uses XAG (Silver) with USD base - returns LBMA silver price
 */
export const fetchCurrentSilverPrice = async (): Promise<number> => {
  try {
    const formData = new FormData()
    formData.append('_token', METALS_API_TOKEN)
    formData.append('user_id', METALS_API_USER_ID)
    formData.append('base', 'USD')
    formData.append('symbols', 'XAG')

    const response = await fetch('https://metals-api.com/api/latest', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.rates?.XAG) {
      throw new Error('No silver price data in response')
    }

    // Metals-API returns rate as 1/price (how much silver per 1 USD)
    // So we need to invert it to get USD per oz
    const silverPrice = 1 / data.rates.XAG

    // Round to 2 decimal places
    return parseFloat(silverPrice.toFixed(2))
  } catch (error) {
    console.error('Error fetching silver price from Metals-API:', error)
    throw error
  }
}

/**
 * Generate weekly silver price data for the past 12 weeks
 * In production, this should fetch from a proper historical data API
 */
export const fetchWeeklySilverData = async (
  currentPrice: number,
  weeks: number = 12
): Promise<PriceData[]> => {
  const weeklyData: PriceData[] = []
  const now = new Date()

  // Generate data for past weeks (going backwards from today)
  for (let i = weeks - 1; i >= 0; i--) {
    // Create a fresh date for each week, going back i weeks
    const weekDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000))

    // Simulate weekly variation
    // TODO: Replace with actual historical data API
    const variation = (Math.random() - 0.5) * 4 // +/- $2 variation
    const weekPrice = currentPrice + variation

    weeklyData.push({
      date: weekDate.toISOString().split('T')[0],
      price: parseFloat(weekPrice.toFixed(2)),
    })
  }

  return weeklyData
}

/**
 * Fetch complete silver price data (current + weekly)
 */
export const fetchSilverPriceData = async (): Promise<SilverPriceResponse> => {
  try {
    const currentPrice = await fetchCurrentSilverPrice()
    const weeklyData = await fetchWeeklySilverData(currentPrice)

    return {
      currentPrice,
      weeklyData,
    }
  } catch (error) {
    // Silently fail - store will handle fallback
    throw error
  }
}
