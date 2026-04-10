import { sdk } from "@lib/config"

// Create a safe SDK wrapper that handles localStorage errors
export const safeSdk = {
  ...sdk,
  client: {
    ...sdk.client,
    fetch: async <T>(input: any, init?: any): Promise<T> => {
      try {
        return await sdk.client.fetch<T>(input, init)
      } catch (error: any) {
        // Handle localStorage errors gracefully
        if (
          error?.message?.includes("localStorage") ||
          error?.message?.includes("getItem is not a function") ||
          error?.message?.includes("setItem is not a function")
        ) {
          console.warn("Caught localStorage error in SDK fetch, retrying without localStorage")
          
          // Retry the request without any localStorage dependencies
          try {
            const headers = { ...init?.headers }
            // Remove any localStorage-dependent headers if needed
            delete headers["authorization"]
            
            return await fetch(`${sdk.config.baseUrl}${input}`, {
              ...init,
              headers
            }).then(res => res.json())
          } catch (retryError) {
            console.error("Retry failed:", retryError)
            throw retryError
          }
        }
        
        throw error
      }
    }
  },
  store: {
    ...sdk.store,
    cart: {
      ...sdk.store.cart,
      create: async (...args: any[]) => {
        try {
          return await sdk.store.cart.create(...args)
        } catch (error: any) {
          if (error?.message?.includes("localStorage")) {
            console.warn("Caught localStorage error in cart.create")
            // Return a mock response or handle gracefully
            return { cart: null }
          }
          throw error
        }
      }
    }
  }
}

export default safeSdk
