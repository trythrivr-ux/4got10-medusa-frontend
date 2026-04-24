import { sdk } from "@lib/config"

export async function getActiveRollouts() {
  try {
    const response = await sdk.client.fetch("/store/rollouts", {
      method: "GET",
    })
    return response
  } catch (error) {
    console.error("Failed to fetch rollouts:", error)
    return { rollouts: [] }
  }
}
