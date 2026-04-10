"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StoreRegion } from "@medusajs/types"
import { ReactNode } from "react"

type TabbarNavProps = {
  regions: StoreRegion[]
  cartButton: ReactNode
}

type Tab = {
  id: string
  label: string
  href: string
  icon?: string
  isActive?: boolean
}

export default function TabbarNav({ regions, cartButton }: TabbarNavProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "home", label: "Home", href: "/", isActive: true },
    { id: "shop", label: "Shop All", href: "/shop-all" },
    { id: "drops", label: "Just Dropped", href: "/just-dropped" },
    { id: "volume", label: "Volume IV", href: "/volume-iv" },
  ])

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })))
  }

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    if (newTabs.length === 0) {
      // Keep at least one tab
      return
    }
    if (activeTab === tabId) {
      const closedIndex = tabs.findIndex(t => t.id === tabId)
      const newActiveIndex = Math.min(closedIndex, newTabs.length - 1)
      newTabs[newActiveIndex].isActive = true
      setActiveTab(newTabs[newActiveIndex].id)
    }
    setTabs(newTabs)
  }

  return (
    <div className="w-full bg-[#1a1a1a]">
      {/* Tab bar */}
      <div className="flex items-end h-[40px] px-[8px] gap-[2px]">
        {/* Tabs */}
        <div className="flex items-end gap-[2px] flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <LocalizedClientLink
              key={tab.id}
              href={tab.href}
              onClick={() => handleTabClick(tab.id)}
              className={`
                relative flex items-center gap-[8px] px-[12px] h-[32px] min-w-[100px] max-w-[180px]
                rounded-t-[8px] text-[11px] font-medium cursor-pointer
                transition-colors duration-150 group
                ${activeTab === tab.id 
                  ? "bg-[#ececec] text-black" 
                  : "bg-[#2a2a2a] text-white/70 hover:bg-[#3a3a3a] hover:text-white"
                }
              `}
            >
              {/* Favicon placeholder */}
              <div className={`w-[12px] h-[12px] rounded-[2px] flex-shrink-0 ${
                activeTab === tab.id ? "bg-black/20" : "bg-white/20"
              }`} />
              
              {/* Tab title */}
              <span className="truncate flex-1">{tab.label}</span>
              
              {/* Close button */}
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className={`w-[14px] h-[14px] rounded-[3px] flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity
                  ${activeTab === tab.id 
                    ? "hover:bg-black/10 text-black/60" 
                    : "hover:bg-white/10 text-white/60"
                  }
                `}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </LocalizedClientLink>
          ))}
          
          {/* New tab button */}
          <button className="flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-[6px] pl-[8px]">
          {/* Search */}
          <button className="flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          
          {/* Cart */}
          <div className="flex items-center justify-center h-[28px] px-[8px] rounded-[4px] bg-white/10 text-white text-[11px] hover:bg-white/15 transition-colors">
            {cartButton}
          </div>
          
          {/* Account */}
          <LocalizedClientLink
            href="/account"
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 11C2 8.5 4 7 6 7C8 7 10 8.5 10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Content area */}
      <div className="bg-[#ececec] h-[4px]" />
    </div>
  )
}
