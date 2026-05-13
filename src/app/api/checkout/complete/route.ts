import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// GET /api/checkout/complete?session_id=xxx&country=dk
// Stripe redirects here. This Route Handler CAN set cookies (unlike Server Components).
// It clears the completed cart cookie then redirects to the success page.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const session_id = searchParams.get("session_id") || ""
  const country = searchParams.get("country") || "us"

  const cookieStore = await cookies()

  // Clear the old (completed) cart cookie
  cookieStore.set("_medusa_cart_id", "", {
    maxAge: -1,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  // Redirect to the localized success page
  const origin = req.nextUrl.origin
  const dest = `${origin}/${country}/checkout/success?session_id=${encodeURIComponent(session_id)}`
  return NextResponse.redirect(dest)
}
