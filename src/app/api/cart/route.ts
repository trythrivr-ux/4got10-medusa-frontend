import { NextResponse } from "next/server"
import { addToCart, retrieveCart } from "@lib/data/cart"

export async function GET() {
  const cart = await retrieveCart().catch(() => null)
  return NextResponse.json({ cart })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const variantId = body.variant_id || body.variantId
    const quantity = body.quantity || 1
    const countryCode = body.countryCode

    if (!variantId || !countryCode) {
      return NextResponse.json(
        { message: "Missing variant_id or countryCode" },
        { status: 400 }
      )
    }

    await addToCart({
      variantId,
      quantity,
      countryCode,
    })

    const cart = await retrieveCart().catch(() => null)

    return NextResponse.json({ cart })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add item to cart"

    return NextResponse.json({ message }, { status: 500 })
  }
}
