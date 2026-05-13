import { NextRequest, NextResponse } from "next/server"
// Proxies to Medusa backend custom route which creates a Stripe Checkout Session

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { cartId } = body as { cartId?: string }
    if (!cartId) {
      // Derive the cart from the current session, just like /checkout
      const cartUrl = new URL("/api/cart", request.url)
      const cartResp = await fetch(cartUrl.toString(), {
        cache: "no-store",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      })
      if (cartResp.ok) {
        const cartData = await cartResp.json()
        cartId = cartData?.cart?.id
      }
      if (!cartId) {
        return NextResponse.json(
          { error: "Cart ID is required" },
          { status: 400 }
        )
      }
    }

    const MEDUSA_BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

    // Try to fetch full cart snapshot from Store API using publishable key
    let cartSnapshot: any = undefined
    try {
      const cartRes = await fetch(
        `${MEDUSA_BACKEND_URL}/store/carts/${cartId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          cache: "no-store",
        }
      )
      if (cartRes.ok) {
        const json = await cartRes.json()
        cartSnapshot = json?.cart
      }
    } catch {}

    const resp = await fetch(`${MEDUSA_BACKEND_URL}/custom/stripe/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_id: cartId, cart: cartSnapshot }),
    })

    if (!resp.ok) {
      const details = await resp.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Failed to create checkout session", details },
        { status: resp.status }
      )
    }

    const data = await resp.json()
    return NextResponse.json({ checkoutUrl: data.url })
  } catch (error) {
    console.error("Create checkout session error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
