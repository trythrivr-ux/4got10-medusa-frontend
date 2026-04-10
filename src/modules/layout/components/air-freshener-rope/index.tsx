"use client"

import { useEffect, useRef } from "react"

interface Point {
  x: number
  y: number
  px: number
  py: number
  pinned: boolean
}

const AirFreshenerRope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const canvas = canvasRef.current
    if (!canvas) {
      console.log("Canvas ref is null")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.log("Could not get 2d context")
      return
    }

    canvas.width = 300
    canvas.height = 300

    // Test canvas rendering
    ctx.fillStyle = "#f0e68c"
    ctx.fillRect(10, 10, 50, 50)

    console.log("Canvas initialized:", {
      width: canvas.width,
      height: canvas.height,
    })

    const numSegments = 12
    const ropeLength = 140
    const segLen = ropeLength / numSegments

    const points: Point[] = []
    const gravity = 0.4
    const iterations = 5

    const anchor = { x: canvas.width / 2, y: 40 }
    const mouse = { x: 0, y: 0, down: false }

    for (let i = 0; i <= numSegments; i++) {
      const x = anchor.x
      const y = anchor.y + i * segLen
      points.push({
        x,
        y,
        px: x,
        py: y,
        pinned: i === 0,
      })
    }

    let endPoint: Point | null = null

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const onMouseDown = () => {
      mouse.down = true
    }

    const onMouseUp = () => {
      mouse.down = false
    }

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)

    let lastTime = performance.now()

    const step = (time: number) => {
      const dt = (time - lastTime) / 16.67 // ~60fps norm
      lastTime = time

      // Verlet integration
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        if (p.pinned) continue

        const vx = (p.x - p.px) * 0.99
        const vy = (p.y - p.py) * 0.99

        p.px = p.x
        p.py = p.y

        p.x += vx
        p.y += vy + gravity
      }

      // Mouse influence (towards mouse)
      endPoint = points[points.length - 1]
      if (endPoint) {
        const dxm = mouse.x - endPoint.x
        const dym = mouse.y - endPoint.y
        const distm = Math.hypot(dxm, dym)
        if (distm < 120 && distm > 0 && !mouse.down) {
          const strength = 0.03
          endPoint.x += dxm * strength
          endPoint.y += dym * strength
        }

        // Drag card by mouse
        if (mouse.down && distm < 40) {
          endPoint.x = mouse.x
          endPoint.y = mouse.y
        }
      }

      // Satisfy constraints (rope length / bend)
      for (let k = 0; k < iterations; k++) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i]
          const p2 = points[i + 1]
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const dist = Math.hypot(dx, dy)
          const diff = segLen - dist
          const percent = diff / segLen
          const offsetX = dx * percent * 0.5
          const offsetY = dy * percent * 0.5
          p1.x += offsetX
          p1.y += offsetY
          p2.x -= offsetX
          p2.y -= offsetY
        }
      }

      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw rope
      ctx.strokeStyle = "#8b4513"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(anchor.x, anchor.y)
      for (let i = 0; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()

      // Draw freshener tag at end
      if (endPoint) {
        ctx.fillStyle = "#f0e68c"
        ctx.fillRect(endPoint.x - 40, endPoint.y - 60, 80, 120)
      }

      // Draw logo
      const img = new Image()
      img.src = "/menu-icons/4got10/logo.svg"
      img.onload = () => {
        if (endPoint) {
          ctx.drawImage(img, endPoint.x - 35, endPoint.y - 55, 70, 70)
        }
      }
    }

    const animate = (time: number) => {
      step(time)
      requestAnimationFrame(animate)
    }

    animate(performance.now())

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
        position: "relative",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
        }}
      />
    </div>
  )
}

export default AirFreshenerRope
