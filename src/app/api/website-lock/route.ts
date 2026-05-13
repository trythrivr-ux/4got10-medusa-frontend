import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Try to read from backend API (custom endpoint - no auth required)
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

    const response = await fetch(`${backendUrl}/custom/lock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(
        { locked: data.locked || false },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      )
    }

    return NextResponse.json({ locked: false })
  } catch (error) {
    return NextResponse.json({ locked: false })
  }
}
