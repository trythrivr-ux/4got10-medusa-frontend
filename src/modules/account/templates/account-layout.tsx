import React from "react"
import AccountNav from "../components/account-nav"

interface AccountLayoutProps {
  customer: any | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div
      className="min-h-screen bg-[#f7f7f7] py-[40px] px-[16px]"
      data-testid="account-page"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-[900px] mx-auto">
        <div className="flex flex-col small:flex-row gap-[16px]">
          {customer && (
            <div className="small:w-[220px] shrink-0">
              <AccountNav customer={customer} />
            </div>
          )}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
