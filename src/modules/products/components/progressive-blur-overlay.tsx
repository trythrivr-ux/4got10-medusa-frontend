"use client"

export default function ProgressiveBlurOverlay() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      }}
    />
  )
}
