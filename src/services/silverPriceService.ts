/**
 * Silver Price Service
 * Handles fetching live silver price data from external APIs
 */

export interface PriceData {
  date: string
  price: number
}

export interface SilverPriceResponse {
  currentPrice: number
  weeklyData: PriceData[]
}

/**
 * Fetch current silver price from Coinbase public API
 * Uses XAG-USD (Silver to USD) spot price
 * This is a FREE public API with no authentication required
 */
export const fetchCurrentSilverPrice = async (): Promise<number> => {
  try {
    const response = await fetch(
      'https://api.coinbase.com/v2/prices/XAG-USD/spot'
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.data?.amount) {
      throw new Error('No silver price data in response')
    }

    // Convert to number and round to 2 decimal places
    return parseFloat(parseFloat(data.data.amount).toFixed(2))
  } catch (error) {
    console.error('Error fetching silver price from Coinbase:', error)
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
