"use client"

import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const initials =
    [customer?.first_name?.[0], customer?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    customer?.email?.[0]?.toUpperCase() ||
    "?"

  const navItems = [
    { href: "/account", label: "Overview", testId: "overview-link" },
    { href: "/account/profile", label: "Profile", testId: "profile-link" },
    {
      href: "/account/addresses",
      label: "Addresses",
      testId: "addresses-link",
    },
    { href: "/account/orders", label: "Orders", testId: "orders-link" },
  ]

  return (
    <div
      className="bg-white rounded-[16px] overflow-hidden"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
      data-testid="account-nav"
    >
      {/* Avatar + name */}
      <div className="px-[20px] pt-[20px] pb-[16px] border-b border-[#f0f0f0]">
        <div className="flex items-center gap-[12px]">
          <div className="w-[38px] h-[38px] rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-[13px] font-semibold text-white">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-black truncate">
              {customer?.first_name
                ? `${customer.first_name} ${customer.last_name || ""}`.trim()
                : "My Account"}
            </p>
            <p className="text-[11px] text-[#00000055] truncate">
              {customer?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="px-[10px] py-[10px] flex flex-col gap-[2px]">
        {navItems.map(({ href, label, testId }) => {
          const active = route.split(countryCode)[1] === href
          return (
            <LocalizedClientLink
              key={href}
              href={href}
              data-testid={testId}
              className={`flex items-center gap-[9px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#f0f0f0] text-black"
                  : "text-[#00000070] hover:bg-[#f7f7f7] hover:text-black"
              }`}
            >
              {label}
            </LocalizedClientLink>
          )
        })}
      </div>

      {/* Logout */}
      <div className="px-[10px] pb-[10px]">
        <div className="h-[1px] bg-[#f0f0f0] mx-[2px] mb-[10px]" />
        <button
          type="button"
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center gap-[9px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-medium text-[#00000055] hover:bg-[#fff0f0] hover:text-[#cc0000] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default AccountNav
