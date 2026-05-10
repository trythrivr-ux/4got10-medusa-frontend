import React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "title" | "subtitle1" | "subtitle2" | "body"
  stroke?: false | "thin" | "medium"
  className?: string
  children: React.ReactNode
}

const Typography = React.forwardRef<
  HTMLParagraphElement | HTMLHeadingElement,
  TypographyProps
>(
  (
    { variant = "body", stroke = false, className = "", children, ...props },
    ref
  ) => {
    const variantClasses = {
      title:
        "inline-flex items-center h-[28px] leading-none text-[23px] tracking-[0.5%] font-normal uppercase font-neue-haas-display",
      subtitle1: "text-[12px] tracking-[2.5%] font-normal font-plus-jakarta",
      subtitle2:
        "text-[10.5px] inline-flex items-center h-[10px] tracking-[2%] font-light uppercase font-inklination-light",
      body: "text-[9.5px] tracking-[1%] font-normal font-inklination-regular",
    }

    const Tag = variant === "title" ? "h1" : "p"

    const strokeStyle: React.CSSProperties | undefined = (() => {
      if (!stroke) return undefined

      const px = stroke === "medium" ? 0.75 : 0.35

      return {
        textShadow: [
          `${px}px 0 0 currentColor`,
          `-${px}px 0 0 currentColor`,
          `0 ${px}px 0 currentColor`,
          `0 -${px}px 0 currentColor`,
        ].join(", "),
      }
    })()

    const { style, ...restProps } = props

    return (
      <Tag
        ref={ref as any}
        className={cn(variantClasses[variant], className)}
        style={{ ...strokeStyle, ...style }}
        {...restProps}
      >
        {children}
      </Tag>
    )
  }
)

Typography.displayName = "Typography"

export default Typography
