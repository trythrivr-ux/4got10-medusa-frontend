"use client"

export default function SimpleBlurOverlay() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none z-50"
      style={{
        background:
          "linear-gradient(to top, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.04) 60%, transparent 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        maskImage:
          "linear-gradient(to top, black 0%, black 45%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 45%, transparent 100%)",
      }}
    />
  )
}
