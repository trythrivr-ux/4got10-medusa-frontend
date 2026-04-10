import { getLocaleHeader } from "@lib/util/get-locale-header"

// Use environment variables for backend configuration
const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// Create comprehensive localStorage polyfill for SDK
const createLocalStoragePolyfill = () => {
  const storage = {
    getItem: (key: string) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key)
        }
      } catch (e) {
        // Silently ignore localStorage errors
      }
      return null
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value)
        }
      } catch (e) {
        // Silently ignore localStorage errors
      }
    },
    removeItem: (key: string) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key)
        }
      } catch (e) {
        // Silently ignore localStorage errors
      }
    },
    clear: () => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.clear()
        }
      } catch (e) {
        // Silently ignore localStorage errors
      }
    },
    length: 0,
    key: (index: number) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.key(index)
        }
      } catch (e) {
        // Silently ignore localStorage errors
      }
      return null
    },
  }

  return storage as Storage
}

// Polyfill localStorage globally before initializing SDK
const storagePolyfill = createLocalStoragePolyfill()

try {
  if (typeof window === "undefined") {
    // Only polyfill if not already defined and in a safe environment
    if (!(global as any).localStorage) {
      ;(global as any).localStorage = storagePolyfill
    }
  } else {
    // Also polyfill on client side in case localStorage is disabled
    if (!window.localStorage) {
      ;(window as any).localStorage = storagePolyfill
    }
  }
} catch (e) {
  // Silently fail if localStorage can't be polyfilled
  // The SDK will handle missing localStorage gracefully
}

// Fallback SDK that works without Medusa SDK imports during SSR
export const sdk = {
  client: {
    fetch: async <T>(input: any, init?: any): Promise<T> => {
      const url = typeof input === "string" ? input : input.toString()
      const response = await fetch(`${MEDUSA_BACKEND_URL}${url}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
          ...init?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    },
  },
  store: {
    cart: {
      create: async () => ({ cart: null }),
      update: async () => ({ cart: null }),
      retrieve: async () => ({ cart: null }),
    },
  },
}
