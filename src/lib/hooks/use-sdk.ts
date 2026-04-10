import { useEffect, useState } from "react"

let sdkInstance: any = null

export function useSDK() {
  const [sdk, setSdk] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sdkInstance) {
      const loadSDK = async () => {
        try {
          const { Medusa } = await import("@medusajs/js-sdk")
          
          sdkInstance = new Medusa({
            baseUrl: "https://4got10-production.up.railway.app",
            debug: process.env.NODE_ENV === "development",
            publishableKey: "apk_01KNVXSZ5C7541WRYVY2BQJ68H",
          })
          
          setSdk(sdkInstance)
        } catch (error) {
          console.error("Failed to load SDK:", error)
        } finally {
          setLoading(false)
        }
      }

      loadSDK()
    } else {
      setSdk(sdkInstance)
      setLoading(false)
    }
  }, [])

  return { sdk, loading }
}
