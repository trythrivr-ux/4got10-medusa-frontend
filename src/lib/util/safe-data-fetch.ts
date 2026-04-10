// Safe data fetching wrapper that handles localStorage errors
export async function safeDataFetch<T>(
  fetchFn: () => Promise<T>,
  fallbackValue: T | null = null
): Promise<T | null> {
  try {
    return await fetchFn()
  } catch (error: any) {
    // Handle localStorage errors gracefully
    if (
      error?.message?.includes("localStorage") ||
      error?.message?.includes("getItem is not a function") ||
      error?.message?.includes("setItem is not a function")
    ) {
      console.warn("Caught localStorage error in data fetch, using fallback")
      return fallbackValue
    }
    
    // For other errors, still throw them
    throw error
  }
}

// Safe wrapper for region fetching
export async function safeGetRegion(countryCode: string) {
  try {
    const { getRegion } = await import("@lib/data/regions")
    return await getRegion(countryCode)
  } catch (error: any) {
    if (error?.message?.includes("localStorage")) {
      console.warn("Caught localStorage error in getRegion, using default region")
      return {
        id: "default-region",
        name: "Default Region",
        currency_code: "eur",
        countries: []
      }
    }
    throw error
  }
}

// Safe wrapper for collections fetching
export async function safeListCollections(params: any) {
  try {
    const { listCollections } = await import("@lib/data/collections")
    return await listCollections(params)
  } catch (error: any) {
    if (error?.message?.includes("localStorage")) {
      console.warn("Caught localStorage error in listCollections, using empty collections")
      return { collections: [] }
    }
    throw error
  }
}
