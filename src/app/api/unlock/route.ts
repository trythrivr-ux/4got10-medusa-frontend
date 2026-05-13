import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "_site_preview"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(req: NextRequest) {
  let password: string | undefined

  try {
    const body = await req.json()
    password = body?.password
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    )
  }

  if (!password) {
    return NextResponse.json(
      { success: false, error: "Password is required." },
      { status: 400 }
    )
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const upstream = await fetch(`${backendUrl}/store/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(pk ? { "x-publishable-api-key": pk } : {}),
      },
      body: JSON.stringify({ password }),
    })

    if (upstream.ok) {
      const response = NextResponse.json({ success: true })
      // Readable by client JS (not httpOnly) so WebsiteLockGuard can check it
      response.cookies.set(COOKIE_NAME, "1", {
        httpOnly: false,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      })
      return response
    }

    return NextResponse.json(
      { success: false, error: "Incorrect password." },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not reach the server. Please try again." },
      { status: 502 }
    )
  }
}
