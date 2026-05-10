"use client"

import { useTransition } from "@/context/transition-context"
import { MouseEvent, ReactNode } from "react"

export function TransitionLink({
  href,
  children,
  className,
  style,
}: {
  href: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const { navigate } = useTransition()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(href)
  }

  return (
    <a
      href={href}
      onClickCapture={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}
