"use client"

import { useState, useEffect } from "react"
import { initiatePaymentSession } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CheckoutSummary from "./checkout-summary"

type EmbeddedStripeCheckoutProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}

export default function EmbeddedStripeCheckout({
  cart,
  customer,
}: EmbeddedStripeCheckoutProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  useEffect(() => {
    const createStripeCheckoutSession = async () => {
      try {
        // Ensure payment collection + Stripe payment session exist for this cart
        await initiatePaymentSession(cart as any, {
          provider_id: "pp_stripe_stripe",
        })

        const response = await fetch(`/api/create-checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartId: cart.id,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create checkout session")
        }

        const data = await response.json()
        if (data.checkoutUrl) {
          setCheckoutUrl(data.checkoutUrl)
          // Redirect to Stripe Checkout
          window.location.href = data.checkoutUrl
        } else {
          throw new Error("No checkout URL returned")
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize checkout"
        )
      } finally {
        setLoading(false)
      }
    }

    createStripeCheckoutSession()
  }, [cart.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center px-[18px] pt-[85px]">
        <div className="text-center">
          <p className="text-lg">Redirecting to checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center px-[18px] pt-[85px]">
        <div className="text-center">
          <p className="text-lg text-red-500">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please try again or use standard checkout mode.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] flex items-start justify-center px-[18px] pt-[85px]">
      <div className="flex min-h-[700px] w-fit rounded-[10px] bg-[#D8D8D8] flex-row gap-[12px] p-[7px]">
        <div className="grid grid-cols-1 gap-[7px] phone:min-w-[1200px] small:grid-cols-[1fr_416px]">
          <div className="bg-white rounded-[8px] p-8">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            <p className="text-gray-600">Redirecting to Stripe Checkout...</p>
          </div>
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
