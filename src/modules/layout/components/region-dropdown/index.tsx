"use client"

import { useState } from "react"
import { StoreRegion } from "@medusajs/types"

interface RegionDropdownProps {
  regions: StoreRegion[]
  currentRegion?: string
}

const RegionDropdown = ({ regions, currentRegion = "DK" }: RegionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // Get unique countries from regions
  const countries = regions.reduce((acc, region) => {
    if (region.countries) {
      region.countries.forEach((country) => {
        const iso2 = country.iso_2
        const displayName = country.display_name
        if (iso2 && displayName && !acc.find(c => c.code === iso2)) {
          acc.push({
            code: iso2,
            name: displayName,
            region: region.name
          })
        }
      })
    }
    return acc
  }, [] as { code: string; name: string; region: string }[])

  // Sort alphabetically
  const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name))
  const current = sortedCountries.find(c => c.code === currentRegion) || sortedCountries[0]

  // Get flag image URL from country code
  function getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[5px] text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular hover:opacity-70 transition-opacity"
      >
        <div className="flex items-center gap-[6px]">
        
          <span>{current?.name || "Denmark"}</span>
        </div>
          <img 
            src={getFlagUrl(current?.code || "DK")} 
            alt={current?.name || "Denmark"}
            className="w-[19px] mx-[2px] h-[12px] rounded-[2px] object-cover"
          />
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
          <div className="absolute top-full right-0 mt-[8px] min-w-[160px] bg-white border border-[#E5E5E5] rounded-[6px] shadow-lg z-[110] py-[4px]">
            {sortedCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Implement region change logic
                  console.log("Selected country:", country.code)
                }}
                className={`w-full text-left px-[12px] py-[8px] text-[11px] font-[family-name:var(--font-plus-jakarta-sans)] transition-colors hover:bg-[#F5F5F5] ${
                  country.code === currentRegion ? "bg-[#F5F5F5] font-medium" : "font-regular"
                }`}
              >
                <div className="flex items-center gap-[8px]">
                  <img 
                    src={getFlagUrl(country.code)} 
                    alt={country.name}
                    className="w-[19px] h-[12px] rounded-[2px] object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="text-[#000000]">{country.name}</div>
                    <div className="text-[#999999] text-[9px]">{country.region}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RegionDropdown
