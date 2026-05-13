import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  }

  return (
    <div
      className="flex flex-col gap-[16px]"
      data-testid="overview-page-wrapper"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      {/* Welcome card */}
      <div className="px-[22px] py-[20px]" style={cardStyle}>
        <p
          className="text-[20px] font-semibold text-black"
          data-testid="welcome-message"
          data-value={customer?.first_name}
        >
          Hey, {customer?.first_name || "there"} 👋
        </p>
        <p
          className="text-[12.5px] text-[#00000055] mt-[3px]"
          data-testid="customer-email"
          data-value={customer?.email}
        >
          {customer?.email}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-[16px]">
        <div className="px-[22px] py-[20px]" style={cardStyle}>
          <p className="text-[11.5px] font-medium text-[#00000055] uppercase tracking-[0.05em] mb-[8px]">
            Profile
          </p>
          <div className="flex items-end gap-[6px]">
            <span
              className="text-[28px] font-semibold text-black leading-none"
              data-testid="customer-profile-completion"
              data-value={profileCompletion}
            >
              {profileCompletion}%
            </span>
            <span className="text-[12px] text-[#00000055] mb-[2px]">
              complete
            </span>
          </div>
          <div className="mt-[12px] h-[4px] bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        <div className="px-[22px] py-[20px]" style={cardStyle}>
          <p className="text-[11.5px] font-medium text-[#00000055] uppercase tracking-[0.05em] mb-[8px]">
            Addresses
          </p>
          <div className="flex items-end gap-[6px]">
            <span
              className="text-[28px] font-semibold text-black leading-none"
              data-testid="addresses-count"
              data-value={customer?.addresses?.length || 0}
            >
              {customer?.addresses?.length || 0}
            </span>
            <span className="text-[12px] text-[#00000055] mb-[2px]">saved</span>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div style={cardStyle} className="overflow-hidden">
        <div className="px-[22px] py-[18px] border-b border-[#f0f0f0] flex items-center justify-between">
          <p className="text-[13.5px] font-semibold text-black">
            Recent orders
          </p>
          <LocalizedClientLink
            href="/account/orders"
            className="text-[12px] text-[#00000055] hover:text-black transition-colors"
          >
            View all
          </LocalizedClientLink>
        </div>

        <ul data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order, i) => (
              <li
                key={order.id}
                data-testid="order-wrapper"
                data-value={order.id}
                className={
                  i < Math.min(orders.length, 5) - 1
                    ? "border-b border-[#f0f0f0]"
                    : ""
                }
              >
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                >
                  <div className="px-[22px] py-[16px] flex items-center justify-between hover:bg-[#fafafa] transition-colors">
                    <div className="flex flex-col gap-[3px]">
                      <span
                        className="text-[13px] font-semibold text-black"
                        data-testid="order-id"
                        data-value={order.display_id}
                      >
                        Order #{order.display_id}
                      </span>
                      <span
                        className="text-[12px] text-[#00000055]"
                        data-testid="order-created-date"
                      >
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-[12px]">
                      <span
                        className="text-[13px] font-semibold text-black"
                        data-testid="order-amount"
                      >
                        {convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#00000030]"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </LocalizedClientLink>
              </li>
            ))
          ) : (
            <li className="px-[22px] py-[32px] flex flex-col items-center justify-center gap-[6px]">
              <p
                className="text-[13px] font-medium text-[#00000055]"
                data-testid="no-orders-message"
              >
                No orders yet
              </p>
              <LocalizedClientLink
                href="/store"
                className="text-[12px] text-black underline underline-offset-2"
              >
                Start shopping
              </LocalizedClientLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) return 0
  let count = 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  if (customer.addresses?.find((a) => a.is_default_billing)) count++
  return (count / 4) * 100
}

export default Overview
