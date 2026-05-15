import { sdk } from "@lib/config"

export async function getProductFeatures(productId: string) {
  try {
    const response = await sdk.client.fetch(`/store/features?product_id=${productId}`, {
      method: "GET",
    })
    return response
  } catch (error) {
    console.error("Failed to fetch features:", error)
    return { features: [] }
  }
}
