"use server"

import { sdk } from "@lib/config"

export async function resendOrderConfirmation(
  _currentState: unknown,
  formData: FormData
) {
  const orderId = formData.get("order_id") as string

  if (!orderId) {
    return { success: false, error: "Order ID is required" }
  }

  try {
    await sdk.client.fetch("/store/send-order-confirmation", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.toString() }
  }
}
