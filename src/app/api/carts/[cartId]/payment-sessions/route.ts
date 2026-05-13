import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cartId: string }> }
) {
  try {
    const { cartId } = await params
    const MEDUSA_BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const body = await request.json()

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/payment-sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to initialize payment session" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Payment session proxy error:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment session" },
      { status: 500 }
    )
  }
}
