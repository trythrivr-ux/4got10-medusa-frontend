import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import EmbeddedStripeCheckout from "@modules/checkout/templates/embedded-stripe-checkout"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

async function getCheckoutMode() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
    const response = await fetch(`${baseUrl}/api/checkout-mode`, {
      cache: "no-store",
      next: { revalidate: 0 },
    })
    if (response.ok) {
      const data = await response.json()
      return data.mode || "standard"
    }
  } catch (error) {
    console.error("Failed to fetch checkout mode:", error)
  }
  return "standard"
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const checkoutMode = await getCheckoutMode()

  if (checkoutMode === "embedded") {
    return <EmbeddedStripeCheckout cart={cart} customer={customer} />
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] flex items-start justify-center px-3 small:px-[18px] pt-[64px] small:pt-[85px] pb-12">
      <div className="w-full max-w-[1240px] rounded-[10px] bg-[#D8D8D8] p-[7px]">
        <div className="grid grid-cols-1 gap-[7px] small:grid-cols-[1fr_416px]">
          <PaymentWrapper cart={cart}>
            <CheckoutForm cart={cart} customer={customer} />
          </PaymentWrapper>
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
