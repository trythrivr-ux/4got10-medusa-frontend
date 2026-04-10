import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/png"
    
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}
