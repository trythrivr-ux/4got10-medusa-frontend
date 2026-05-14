import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const thumbnail = searchParams.get("thumbnail") || ""
  const title = searchParams.get("title") || "4got10 Magazine"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "#0a0a0a",
          overflow: "hidden",
        }}
      >
        {/* Full-bleed product image */}
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : null}

        {/* Gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.0) 55%)",
            display: "flex",
          }}
        />

        {/* Text block at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            4GOT10 MAGAZINE
          </span>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
            }}
          >
            {title}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
