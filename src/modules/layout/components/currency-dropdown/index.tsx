"use client"

import { useState } from "react"
import { StoreRegion } from "@medusajs/types"

interface CurrencyDropdownProps {
  regions: StoreRegion[]
  currentCurrency?: string
}

const CurrencyDropdown = ({ regions, currentCurrency = "DKK" }: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // Extract unique currencies from regions
  const currencies = regions.reduce((acc, region) => {
    if (region.currency_code && !acc.find(c => c.code === region.currency_code)) {
      acc.push({
        code: region.currency_code,
        name: region.currency_code.toUpperCase(),
        symbol: getCurrencySymbol(region.currency_code),
        region: region.name
      })
    }
    return acc
  }, [] as { code: string; name: string; symbol: string; region: string }[])

  // Sort currencies alphabetically
  const sortedCurrencies = currencies.sort((a, b) => a.code.localeCompare(b.code))

  const current = sortedCurrencies.find(c => c.code === currentCurrency) || sortedCurrencies[0]

  function getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
      dkk: "kr",
      eur: "€",
      usd: "$",
      gbp: "£",
      sek: "kr",
      nok: "kr",
      chf: "Fr",
      jpy: "¥",
      cad: "C$",
      aud: "A$",
    }
    return symbols[code.toLowerCase()] || code.toUpperCase()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[5px] text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular hover:opacity-70 transition-opacity"
      >
        <span>{current?.name} ({current?.symbol})</span>
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
            {sortedCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Implement currency change logic
                  console.log("Selected currency:", currency.code)
                }}
                className={`w-full text-left px-[12px] py-[8px] text-[11px] font-[family-name:var(--font-plus-jakarta-sans)] transition-colors hover:bg-[#F5F5F5] ${
                  currency.code === currentCurrency ? "bg-[#F5F5F5] font-medium" : "font-regular"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#000000]">{currency.name}</span>
                  <span className="text-[#666666] text-[10px]">{currency.symbol}</span>
                </div>
                <div className="text-[#999999] text-[9px] mt-[2px]">{currency.region}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CurrencyDropdown
