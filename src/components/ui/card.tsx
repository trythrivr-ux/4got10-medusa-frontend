import React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "product" | "menu"
  children: React.ReactNode
}

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: "bg-white rounded-[10px] shadow-sm border border-gray-100",
    product:
      "bg-white rounded-[10px] p-[12px] shadow-sm border border-gray-100",
    menu: "bg-[#F8F8F8]/55 backdrop-blur-[12px] rounded-[12px]",
  }

  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 pb-2", className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 pt-2", className)} {...props}>
      {children}
    </div>
  )
}
