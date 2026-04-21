import { getLocaleHeader } from "@lib/util/get-locale-header"

// Use environment variables for backend configuration
const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
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

      const searchParams = new URLSearchParams()
      const query = init?.query

      if (query && typeof query === "object") {
        for (const [key, value] of Object.entries(query)) {
          if (value === undefined || value === null) {
            continue
          }

          if (Array.isArray(value)) {
            const arrayKey = key.endsWith("[]") ? key : `${key}[]`
            for (const v of value) {
              if (v === undefined || v === null) continue
              searchParams.append(arrayKey, String(v))
            }
            continue
          }

          if (typeof value === "object") {
            searchParams.append(key, JSON.stringify(value))
            continue
          }

          searchParams.append(key, String(value))
        }
      }

      const queryString = searchParams.toString()
      const urlWithQuery = queryString ? `${url}?${queryString}` : url

      const response = await fetch(`${MEDUSA_BACKEND_URL}${urlWithQuery}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
          ...init?.headers,
        },
      })

      if (!response.ok) {
        let details = ""
        try {
          const text = await response.text()
          details = text ? ` - ${text.slice(0, 500)}` : ""
        } catch {
          // ignore
        }

        throw new Error(
          `HTTP ${response.status}: ${response.statusText} (${urlWithQuery})${details}`
        )
      }

      return await response.json()
    },
  },
  store: {
    cart: {
      create: async (
        data: any,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch("/store/carts", {
          method: "POST",
          body: JSON.stringify(data ?? {}),
          headers,
        })
      },
      update: async (
        cartId: string,
        data: any,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(`/store/carts/${cartId}`, {
          method: "POST",
          body: JSON.stringify(data ?? {}),
          headers,
        })
      },
      retrieve: async (
        cartId: string,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(`/store/carts/${cartId}`, {
          method: "GET",
          headers,
        })
      },
      createLineItem: async (
        cartId: string,
        data: any,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(`/store/carts/${cartId}/line-items`, {
          method: "POST",
          body: JSON.stringify(data ?? {}),
          headers,
        })
      },
      updateLineItem: async (
        cartId: string,
        lineId: string,
        data: any,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(
          `/store/carts/${cartId}/line-items/${lineId}`,
          {
            method: "POST",
            body: JSON.stringify(data ?? {}),
            headers,
          }
        )
      },
      deleteLineItem: async (
        cartId: string,
        lineId: string,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(
          `/store/carts/${cartId}/line-items/${lineId}`,
          {
            method: "DELETE",
            headers,
          }
        )
      },
      addShippingMethod: async (
        cartId: string,
        data: any,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(
          `/store/carts/${cartId}/shipping-methods`,
          {
            method: "POST",
            body: JSON.stringify(data ?? {}),
            headers,
          }
        )
      },
      complete: async (
        cartId: string,
        _query: any = {},
        headers: Record<string, string> = {}
      ) => {
        return await sdk.client.fetch(`/store/carts/${cartId}/complete`, {
          method: "POST",
          headers,
        })
      },
    },
  },
}
