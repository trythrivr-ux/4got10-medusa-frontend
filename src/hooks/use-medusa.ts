"use client"

import { useState, useEffect } from "react"

let medusaClient: any = null

export function useMedusa() {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== "undefined" && !medusaClient) {
      import("@medusajs/js-sdk").then(({ Medusa }) => {
        medusaClient = new Medusa({
          baseUrl: "https://4got10-production.up.railway.app",
          publishableApiKey: "apk_01KNVXSZ5C7541WRYVY2BQJ68H",
        })
        setClient(medusaClient)
        setLoading(false)
      }).catch((error) => {
        console.error("Failed to load Medusa SDK:", error)
        setLoading(false)
      })
    } else if (medusaClient) {
      setClient(medusaClient)
      setLoading(false)
    }
  }, [])

  return { client, loading }
}
