import { NextResponse } from "next/server"
import { removeCartId } from "@lib/data/cookies"
import { getOrSetCart } from "@lib/data/cart"

export async function POST(req: Request) {
  try {
    const { countryCode } = (await req.json().catch(() => ({}))) as {
      countryCode?: string
    }

    if (!countryCode) {
      return NextResponse.json(
        { error: "countryCode is required" },
        { status: 400 }
      )
    }

    await removeCartId()
    const cart = await getOrSetCart(countryCode)

    return NextResponse.json({ success: true, cart_id: cart.id })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to reset cart" },
      { status: 500 }
    )
  }
}
