"use client"

import { useState } from "react"

type Props = {
  cartId: string
  step: string
  className?: string
  dataTestId?: string
}

export default function CheckoutCta({
  cartId,
  step,
  className,
  dataTestId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const modeResp = await fetch("/api/checkout-mode", { cache: "no-store" })
      const modeJson = modeResp.ok
        ? await modeResp.json()
        : { mode: "standard" }
      const rawMode = modeJson.mode
      const isEmbedded =
        rawMode === "embedded" || rawMode === true || rawMode === "true"

      if (isEmbedded) {
        // Ensure cart exists and has items before trying to create a session
        const cartCheck = await fetch("/api/cart", { cache: "no-store" })
        if (!cartCheck.ok) {
          throw new Error("Unable to read cart")
        }
        const cartPayload = await cartCheck.json().catch(() => ({} as any))
        const itemCount = Array.isArray(cartPayload?.cart?.items)
          ? cartPayload.cart.items.length
          : 0
        if (!cartPayload?.cart?.id || itemCount === 0) {
          throw new Error("Your cart is empty. Add an item to continue.")
        }

        const resp = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId }),
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          const msg =
            (data && (data.error || data.message)) || "Failed to start checkout"
          // eslint-disable-next-line no-console
          console.error("/api/create-checkout-session error:", data)
          throw new Error(msg)
        }
        if (!data.checkoutUrl) {
          throw new Error("No checkout URL returned")
        }
        window.location.href = data.checkoutUrl
        return
      }

      // standard flow
      window.location.href = `/checkout?step=${encodeURIComponent(step)}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout")
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        data-testid={dataTestId}
        className={className || "w-full h-10 rounded-md bg-black text-white"}
      >
        {loading ? "Redirecting..." : "Go to checkout"}
      </button>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  )
}
