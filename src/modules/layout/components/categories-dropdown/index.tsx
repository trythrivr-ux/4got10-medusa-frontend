"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Category {
  name: string
  href: string
}

interface CategoriesDropdownProps {
  categories?: Category[]
}

const CategoriesDropdown = ({ categories }: CategoriesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const defaultCategories: Category[] = [
    { name: "All Products", href: "/store" },
    { name: "New Arrivals", href: "/store" },
    { name: "Best Sellers", href: "/store" },
    { name: "Sale Items", href: "/store" },
    { name: "Featured", href: "/store" },
  ]

  const items = categories || defaultCategories

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[5px] text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular hover:opacity-70 transition-opacity"
      >
        <span>Categories</span>
        <svg
          className={`w-[10px] h-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-[8px] min-w-[140px] bg-white border border-[#E5E5E5] rounded-[6px] shadow-lg z-[110] py-[4px]">
            {items.map((category) => (
              <LocalizedClientLink
                key={category.name}
                href={category.href}
                className="block w-full text-left px-[12px] py-[8px] text-[11px] font-[family-name:var(--font-plus-jakarta-sans)] font-regular text-[#000000] transition-colors hover:bg-[#F5F5F5]"
                onClick={() => setIsOpen(false)}
              >
                {category.name}
              </LocalizedClientLink>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CategoriesDropdown
