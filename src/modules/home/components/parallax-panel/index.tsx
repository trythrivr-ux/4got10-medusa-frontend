"use client"

import { useState, useEffect, useRef } from "react"

interface ParallaxPanelProps {
  children: React.ReactNode
  className?: string
}

export default function ParallaxPanel({ children, className = "" }: ParallaxPanelProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current || !isHovered) return

      const rect = panelRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const x = (e.clientX - centerX) / (rect.width / 2)
      const y = (e.clientY - centerY) / (rect.height / 2)

      setMousePosition({ x: x * 8, y: y * 8 }) // 8px max movement
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      setMousePosition({ x: 0, y: 0 })
    }

    const panel = panelRef.current
    if (panel) {
      panel.addEventListener("mouseenter", handleMouseEnter)
      panel.addEventListener("mouseleave", handleMouseLeave)
    }

    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (panel) {
        panel.removeEventListener("mouseenter", handleMouseEnter)
        panel.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [isHovered])

  return (
    <div
      ref={panelRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-[-30px]"
        style={{
          transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`,
          transition: "transform 0.4s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}
