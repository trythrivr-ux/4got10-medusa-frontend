"use client"

import { useNavScroll } from "@modules/layout/components/nav-wrapper"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AirFreshenerRope from "@modules/layout/components/air-freshener-rope"
import CurrencyDropdown from "@modules/layout/components/currency-dropdown"
import RegionDropdown from "@modules/layout/components/region-dropdown"
import CategoriesDropdown from "@modules/layout/components/categories-dropdown"
import { StoreRegion } from "@medusajs/types"
import { ReactNode } from "react"

type NavContentProps = {
  regions: StoreRegion[]
  cartButton: ReactNode
}

export default function NavContent({ regions, cartButton }: NavContentProps) {
  const { isScrolled } = useNavScroll()

  return (
    <nav className="txt-xsmall-plus gap-[12px] pt-[15px] px-[15px] text-ui-fg-subtle flex flex-col items-center justify-start w-full h-full text-small-regular">
      {/** Row 1 **/}
      <div className="w-full h-[28.5px] flex items-center shrink-0">
        {/** Column 1 - Menu **/}
        <div className="flex-1 flex-row gap-[7px] basis-0 h-full flex items-center shrink-0">
          {/** Menu **/}
          <div className="bg-[#1E1E1E] flex items-center justify-center rounded-full text-white text-[10.25px] tracking-[1%] px-[15px] h-[28.5px] font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
            <LocalizedClientLink href="/account" data-testid="nav-account-link">
              Menu
            </LocalizedClientLink>
            <img
              src="/menu-icons/menu.svg"
              alt=""
              className="w-[11.5px] pl-[2px] aspect-square h-fit ml-[4.5px] mb-[0px]"
            />
          </div>
          {/** Countdown - Hidden when scrolled **/}
          <div
            className={`bg-[#F1F1F1] flex-row gap-[5px] flex items-center justify-center rounded-full text-black text-[9.75px] tracking-[1%] px-[15px] h-[28.5px] font-[family-name:var(--font-plus-jakarta-sans)] font-regular transition-all duration-300 overflow-hidden ${
              isScrolled ? "w-0 opacity-0 px-0" : "w-auto opacity-100"
            }`}
          >
            <p className="text-[#00000070]">00d</p>
            <div className="h-[7.5px] rounded-full w-[1.55px] bg-[#1E1E1E35]"></div>
            <p>15h</p>
            <div className="h-[7.5px] rounded-full w-[1.55px] bg-[#1E1E1E35]"></div>
            <p>20s</p>
          </div>
        </div>
        {/** Column 2 - Cart & Account **/}
        <div className="flex-1 flex-row gap-[7px] basis-0 h-full flex items-center justify-end shrink-0">
          {/** Sign Up - Hidden when scrolled **/}
          <p
            className={`text-[#000000] text-[10.25px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular transition-all duration-300 overflow-hidden ${
              isScrolled ? "w-0 opacity-0 pr-0" : "w-auto opacity-100"
            }`}
          >
            Sign Up
          </p>
          {/** Search **/}
          <div className="bg-[#F1F1F1] flex-row gap-[5px] flex items-center justify-center rounded-full text-black text-[10.25px] tracking-[1%] aspect-square h-[28.5px] font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
            <img
              src="/menu-icons/search.png"
              alt=""
              className="w-[11.5px] aspect-square h-fit mb-[0px]"
            />
          </div>
          {/** Cart **/}
          <div className="bg-[#F1F1F1] flex-row gap-[7px] flex items-center justify-center rounded-full text-black text-[10.25px] tracking-[1%] pl-[12px] pr-[7px] h-[28.5px] font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
            {cartButton}
          </div>
          {/** Account **/}
          <div className="bg-[#1E1E1E] flex items-center justify-center rounded-full text-white text-[10.25px] tracking-[1%] px-[15px] h-[28.5px] font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
            <LocalizedClientLink href="/account" data-testid="nav-account-link">
              Account
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/** Row 2 - 4got10mag images always visible at full size **/}
      <div
        className={`pt-[5px] w-full flex items-center nav-row-blend transition-all duration-500 ease-in-out overflow-hidden shrink-0 ${
          isScrolled
            ? "h-[50px] justify-between px-[0px]"
            : "h-[50px] gap-[5px] justify-center"
        }`}
      >
        <img
          src="/menu-icons/4got10/1.svg"
          alt=""
          className="h-[41px] ring-opacity-80"
        />
        <img
          src="/menu-icons/4got10/2.svg"
          alt=""
          className="h-[42px] ring-opacity-80"
        />
        <img
          src="/menu-icons/4got10/3.svg"
          alt=""
          className="h-[43px] ring-opacity-80"
        />
        <div
          className={`flex flex-row gap-[5px] justify-center items-start transition-all duration-500 ease-in-out ${
            isScrolled ? "w-0 opacity-0 overflow-hidden" : "w-full opacity-100"
          }`}
        >
          <div className="h-[14px] opacity-25 aspect-square rounded-full border-black border-[1.8px]"></div>
        </div>
        <img
          src="/menu-icons/4got10/4.svg"
          alt=""
          className="h-[44px] ring-opacity-80"
        />
        <img
          src="/menu-icons/4got10/5.svg"
          alt=""
          className="h-[44px] ring-opacity-80"
        />
      </div>

      {/** Row 3 - Hidden when scrolled **/}
      <div
        className={`pt-[5px] w-full flex items-center nav-row-blend transition-all duration-500 ease-in-out shrink-0 ${
          isScrolled ? "h-0 opacity-0 pt-0" : "h-[20px] opacity-100"
        }`}
      >
        <div className="flex flex-row gap-[8px] justify-start items-center w-full">
          <LocalizedClientLink
            href="/shop-all"
            data-testid="nav-account-link"
            className="relative inline-block"
          >
            <span className="text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
              Shop All
            </span>
          </LocalizedClientLink>
          <CategoriesDropdown />
          <LocalizedClientLink
            href="/account"
            data-testid="nav-account-link"
            className="relative flex-row items-center justify-center pr-[4px] flex"
          >
            <span className="text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
              Just Dropped
            </span>
            <img
              src="/menu-icons/justdropped.png"
              alt=""
              className="h-[12px] ml-[1px]"
            />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account"
            data-testid="nav-account-link"
            className="relative flex-row items-center justify-center pr-[4px] flex"
          >
            <span className="text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
              Buy Volume IV
            </span>
            <img
              src="/menu-icons/newspaper.png"
              alt=""
              className="h-[14px] ml-[1px]"
            />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account"
            data-testid="nav-account-link"
            className="relative inline-block"
          >
            <span className="text-[#000000] text-[11px] pr-[5px] tracking-[1%] text-nowrap font-[family-name:var(--font-plus-jakarta-sans)] font-regular">
              Features
            </span>
          </LocalizedClientLink>
        </div>
        <div className="flex flex-row gap-[8px] justify-end items-center w-full">
          <CurrencyDropdown regions={regions} currentCurrency="DKK" />
          <RegionDropdown regions={regions} currentRegion="DK" />
        </div>
      </div>
    </nav>
  )
}
