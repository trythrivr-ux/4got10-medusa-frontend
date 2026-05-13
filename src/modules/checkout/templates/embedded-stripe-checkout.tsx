"use client"

import { useState, useEffect, useRef } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"
import CheckoutSummary from "./checkout-summary"

type EmbeddedStripeCheckoutProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  : Promise.resolve(null)

export default function EmbeddedStripeCheckout({
  cart,
  customer,
}: EmbeddedStripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializePaymentSession = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
          throw new Error("Stripe publishable key is not configured")
        }

        const MEDUSA_BACKEND_URL =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const response = await fetch(
          `${MEDUSA_BACKEND_URL}/store/carts/${cart.id}/payment-sessions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider_id: "pp_stripe_stripe",
            }),
          }
        )

        if (!response.ok) {
          throw new Error("Failed to initialize payment session")
        }

        const data = await response.json()
        const paymentSession = data.payment_session

        if (paymentSession?.data?.client_secret) {
          setClientSecret(paymentSession.data.client_secret)
        } else {
          throw new Error("No client secret returned")
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize checkout"
        )
      } finally {
        setLoading(false)
      }
    }

    initializePaymentSession()
  }, [cart.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center px-[18px] pt-[85px]">
        <div className="text-center">
          <p className="text-lg">Loading checkout...</p>
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
            Please configure NEXT_PUBLIC_STRIPE_KEY environment variable or use
            standard checkout mode.
          </p>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center px-[18px] pt-[85px]">
        <div className="text-center">
          <p className="text-lg">Unable to initialize checkout</p>
        </div>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center px-[18px] pt-[85px]">
        <div className="text-center">
          <p className="text-lg">Stripe is not configured</p>
          <p className="text-sm text-gray-500 mt-2">
            Please configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment
            variable.
          </p>
        </div>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#000000",
        colorBackground: "#ffffff",
        colorText: "#000000",
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] flex items-start justify-center px-[18px] pt-[85px]">
      <div className="flex min-h-[700px] w-fit rounded-[10px] bg-[#D8D8D8] flex-row gap-[12px] p-[7px]">
        <div className="grid grid-cols-1 gap-[7px] phone:min-w-[1200px] small:grid-cols-[1fr_416px]">
          <div className="bg-white rounded-[8px] p-8">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            <Elements stripe={stripePromise} options={options}>
              <EmbeddedPaymentForm cart={cart} customer={customer} />
            </Elements>
          </div>
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}

function EmbeddedPaymentForm({ cart, customer }: EmbeddedStripeCheckoutProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      if (!elements || !stripe) {
        throw new Error("Stripe not initialized")
      }

      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Payment details are invalid")
        isSubmittingRef.current = false
        setIsSubmitting(false)
        return
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/complete`,
          },
          redirect: "if_required",
        })

      if (confirmError) {
        setError(confirmError.message || "Payment failed")
        isSubmittingRef.current = false
        setIsSubmitting(false)
        return
      }

      if (
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "requires_capture"
      ) {
        // Complete the cart
        const MEDUSA_BACKEND_URL =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const response = await fetch(
          `${MEDUSA_BACKEND_URL}/store/carts/${cart.id}/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.type === "order") {
            window.location.href = `/checkout/complete?order_id=${data.order.id}`
          } else {
            setError("Failed to complete order")
            isSubmittingRef.current = false
            setIsSubmitting(false)
          }
        } else {
          setError("Failed to complete order")
          isSubmittingRef.current = false
          setIsSubmitting(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Processing..." : "Pay Now"}
      </button>
    </form>
  )
}
