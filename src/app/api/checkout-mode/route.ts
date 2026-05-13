import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    const response = await fetch(`${MEDUSA_BACKEND_URL}/custom/checkout-mode`, {
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    return NextResponse.json({ mode: "standard" })
  } catch (error) {
    console.error("Failed to fetch checkout mode:", error)
    return NextResponse.json({ mode: "standard" })
  }
}
