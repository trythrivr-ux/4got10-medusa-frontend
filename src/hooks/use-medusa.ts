"use client"

import { useState, useEffect } from "react"
import { sdk } from "@lib/config"

export function useMedusa() {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use the existing SDK from lib/config.ts
    setClient(sdk)
    setLoading(false)
  }, [])

  return { client, loading }
}
