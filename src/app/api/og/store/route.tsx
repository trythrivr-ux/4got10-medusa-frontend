import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function fetchProductThumbnails(): Promise<string[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products?limit=6&fields=id,thumbnail`,
      {
        headers: PK ? { "x-publishable-api-key": PK } : {},
        cache: "no-store",
      }
    )
    if (!res.ok) return []
    const json = await res.json()
    const products: any[] = json.products || []
    return products
      .map((p: any) => p.thumbnail)
      .filter(Boolean)
      .slice(0, 6)
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const thumbnails = await fetchProductThumbnails()

  // Fill with placeholders if fewer than 6
  const images = [
    ...thumbnails,
    ...Array(Math.max(0, 6 - thumbnails.length)).fill(null),
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#efefef",
          padding: "40px",
          gap: "16px",
        }}
      >
        {/* Brand label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#000",
            }}
          >
            4GOT10 MAGAZINE — SHOP
          </span>
        </div>

        {/* Product grid: 3 columns × 2 rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: "12px",
          }}
        >
          {[0, 1].map((row) => (
            <div
              key={row}
              style={{ display: "flex", flex: 1, gap: "12px" }}
            >
              {[0, 1, 2].map((col) => {
                const img = images[row * 3 + col]
                return (
                  <div
                    key={col}
                    style={{
                      flex: 1,
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#e5e5e5",
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
