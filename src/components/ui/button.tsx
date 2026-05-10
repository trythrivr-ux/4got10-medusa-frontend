import React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "backdrop" | "background" | "border"
  size?: "xsmall" | "small" | "large"
  children: React.ReactNode
}

export function Button({
  variant = "backdrop",
  size = "small",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    size === "large"
      ? "flex flex-row gap-[8px] items-center justify-center transition-all duration-250 ease-out cursor-pointer rounded-[10px] capitalize"
      : "flex flex-row gap-[8px] items-center justify-center transition-all duration-250 ease-out cursor-pointer rounded-full uppercase"

  const variantClasses = {
    backdrop: "bg-[#F8F8F8]/65 backdrop-blur",
    background: "bg-[#efefef]",
    border: "bg-transparent border-[0.8px] border-[#7B7B7B]/15",
  }

  const sizeClasses = {
    xsmall: "h-[22px] px-[12px] text-[9.5px]",
    small: "h-[28px] px-[12px] text-[9.75px]",
    large: "h-[42px] px-[12px] text-[11.5px]",
  }

  const fontClasses = {
    xsmall: "font-normal",
    small: "font-normal",
    large: "font-medium",
  }

  const fontFamily = {
    xsmall: "font-['Inklination Trail']",
    small: "font-['Inklination Trail']",
    large: "font-plus-jakarta",
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fontClasses[size],
        fontFamily[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
