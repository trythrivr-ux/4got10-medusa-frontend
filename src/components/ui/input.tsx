import React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search" | "menu"
}

export function Input({
  variant = "default",
  className = "",
  ...props
}: InputProps) {
  const variantClasses = {
    default:
      "px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-black",
    search:
      "w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-black",
    menu: "w-full px-[9px] py-[9px] rounded-[10px] bg-[#FFFFFF] text-[12.5px] tracking-[0.01em] outline-none focus:outline-none",
  }

  return <input className={cn(variantClasses[variant], className)} {...props} />
}
