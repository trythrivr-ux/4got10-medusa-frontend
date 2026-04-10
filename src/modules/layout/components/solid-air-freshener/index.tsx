"use client"

import { useCallback, useRef, useEffect } from "react"

interface SolidAirFreshenerProps {
  logoSrc: string
}

const SolidAirFreshener = ({ logoSrc }: SolidAirFreshenerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  // Physics: pivot at top center hole
  const pivot = useRef({ x: 100, y: 20 }) // Fixed pivot point
  const angle = useRef(0) // Current angle in radians
  const angularVel = useRef(0) // Angular velocity
  const width = 80
  const height = 120
  const pivotOffsetX = 0 // Hole at center top
  const pivotOffsetY = -height / 2

  const gravity = 0.2
  const damping = 0.98
  const torqueScale = 0.0005
  const mouseStrength = 0.0003
  const grabDist = 40

  // Mouse hook
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateMouse = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }
    window.addEventListener("mousemove", updateMouse)
    return () => window.removeEventListener("mousemove", updateMouse)
  }, [])

  // Drag events
  const onMouseDown = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const cx =
      pivot.current.x +
      Math.cos(angle.current) * pivotOffsetX -
      Math.sin(angle.current) * pivotOffsetY
    const cy =
      pivot.current.y +
      Math.sin(angle.current) * pivotOffsetX +
      Math.cos(angle.current) * pivotOffsetY
    const dist = Math.hypot(mx - cx, my - cy)
    if (dist < grabDist) {
      isDraggingRef.current = true
      e.preventDefault()
    }
  }, [])

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    const animate = () => {
      // Compute center position
      const cx =
        pivot.current.x +
        Math.cos(angle.current) * pivotOffsetX -
        Math.sin(angle.current) * pivotOffsetY
      const cy =
        pivot.current.y +
        Math.sin(angle.current) * pivotOffsetX +
        Math.cos(angle.current) * pivotOffsetY

      if (isDraggingRef.current) {
        // Direct drag: set angle toward mouse
        const dx = mouseRef.current.x - pivot.current.x
        const dy = mouseRef.current.y - pivot.current.y
        angle.current = Math.atan2(dy, dx)
      } else {
        // Physics torque from gravity
        const gravityTorque =
          (pivotOffsetX * Math.sin(angle.current) -
            pivotOffsetY * Math.cos(angle.current)) *
          gravity
        angularVel.current += gravityTorque * torqueScale

        // Mouse attraction torque
        const dxm = mouseRef.current.x - cx
        const dym = mouseRef.current.y - cy
        const distMouse = Math.hypot(dxm, dym)
        if (distMouse > 0 && distMouse < 150) {
          // Hover range
          const torque =
            ((Math.atan2(dym, dxm) - angle.current) * mouseStrength) / distMouse
          angularVel.current += torque
        }
      }

      // Integrate
      angularVel.current *= damping
      angle.current += angularVel.current

      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  // Compute current center
  const cx =
    pivot.current.x +
    Math.cos(angle.current) * pivotOffsetX -
    Math.sin(angle.current) * pivotOffsetY
  const cy =
    pivot.current.y +
    Math.sin(angle.current) * pivotOffsetX +
    Math.cos(angle.current) * pivotOffsetY

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        cursor: isDraggingRef.current ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {/* String */}
      <div
        style={{
          width: 2,
          height: 100,
          background: "#333",
          position: "absolute",
          top: 0,
        }}
      />

      {/* Freshener tag */}
      <div
        style={{
          position: "absolute",
          top: 100,
          width: 80,
          height: 120,
          background: "#f0e68c",
          borderRadius: "10px",
          border: "2px solid #8b4513",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          transformOrigin: "top center",
          transform: `translateX(${cx - 100}px) translateY(${
            cy - 100
          }px) rotate(${angle.current}rad)`,
        }}
      >
        <img
          src={logoSrc}
          alt="Logo"
          style={{ maxWidth: "70%", maxHeight: "70%" }}
        />
      </div>
    </div>
  )
}

export default SolidAirFreshener
