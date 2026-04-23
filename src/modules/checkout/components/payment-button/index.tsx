"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useRef, useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
        isSubmittingRef.current = false
      })
  }

  const stripe = useStripe()
  const elements = useElements()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    // Guard against double click
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmitting(true)
    setErrorMessage(null)

    if (!stripe || !elements || !cart) {
      setSubmitting(false)
      isSubmittingRef.current = false
      return
    }

    try {
      // Call elements.submit() before confirmPayment
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(
          "Check your payment details and try again. " + submitError.message
        )
        setSubmitting(false)
        isSubmittingRef.current = false
        return
      }

      // Call confirmPayment with redirect: "if_required"
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: session?.data.client_secret as string,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      })

      if (error) {
        // Check if payment was actually successful despite error
        if (
          error.payment_intent?.status === "requires_capture" ||
          error.payment_intent?.status === "succeeded"
        ) {
          onPaymentCompleted()
          return
        }

        setErrorMessage(error.message || "Payment failed. Please try again.")
        setSubmitting(false)
        isSubmittingRef.current = false
        return
      }

      // If paymentIntent exists and is in valid state, complete the order
      if (
        paymentIntent &&
        (paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded")
      ) {
        onPaymentCompleted()
        return
      }

      // If redirect happened, let the return_url flow handle completion
      setSubmitting(false)
      isSubmittingRef.current = false
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.")
      setSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <>
      <Button
        disabled={disabled || notReady || submitting}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
