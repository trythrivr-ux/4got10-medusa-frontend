import { useEffect, useState } from "react"
import { sdk as sdkFromConfig } from "@lib/config"

let sdkInstance: any = null

export function useSDK() {
  const [sdk, setSdk] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sdkInstance) {
      sdkInstance = sdkFromConfig
    }

    setSdk(sdkInstance)
    setLoading(false)
  }, [])

  return { sdk, loading }
}
