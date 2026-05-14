"use client"

import { HttpTypes } from "@medusajs/types"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState } from "react"
import Image from "next/image"

type CartCardProps = {
  cart: HttpTypes.StoreCart
}

const Pill = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-full bg-[#EFEFEF] px-[10px] py-[4px] text-[9px] font-medium uppercase tracking-[0.06em] text-black transition-opacity hover:opacity-70 disabled:opacity-50"
  >
    {children}
  </button>
)

const formatPrice = (amount: number, currencyCode: string) => {
  const formatted = convertToLocale({ amount, currency_code: currencyCode })
  const match = formatted.match(/^([^\d-]*)(-?\d[\d.,]*)/)

  if (!match) {
    return { symbol: "", main: formatted, cents: "" }
  }

  const symbol = match[1].trim()
  const numeric = match[2]
  const [main, cents = ""] = numeric.split(/[.,]/)

  return { symbol, main, cents }
}

const Price = ({
  amount,
  currencyCode,
  size = "sm",
}: {
  amount: number
  currencyCode: string
  size?: "sm" | "lg"
}) => {
  const { symbol, main, cents } = formatPrice(amount, currencyCode)

  return (
    <span className="inline-flex items-baseline">
      <span
        className={
          size === "lg" ? "text-[13px] mr-[2px]" : "text-[11px] mr-[2px]"
        }
      >
        {symbol}
      </span>
      <span
        className={
          size === "lg" ? "text-[20px] font-medium" : "text-[13px] font-medium"
        }
      >
        {main}
      </span>
      {cents && (
        <span className={size === "lg" ? "text-[11px]" : "text-[9px]"}>
          .{cents}
        </span>
      )}
    </span>
  )
}

const CartCard = ({ cart }: CartCardProps) => {
  const [pendingId, setPendingId] = useState<string | null>(null)

  const items = (cart.items || []).slice().sort((a, b) => {
    return (a.created_at ?? "") > (b.created_at ?? "") ? 1 : -1
  })

  const subtitle = items[0]?.product?.categories?.[0]?.name || ""
  const currencyCode = cart.currency_code

  const handleQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      setPendingId(id)
      await deleteLineItem(id)
        .then(() => window.dispatchEvent(new Event("cart-updated")))
        .catch(() => {})
        .finally(() => setPendingId(null))
      return
    }

    setPendingId(id)
    await updateLineItem({ lineId: id, quantity })
      .then(() => window.dispatchEvent(new Event("cart-updated")))
      .catch(() => {})
      .finally(() => setPendingId(null))
  }

  return (
    <div className="flex h-full w-full flex-col rounded-[10px] bg-white p-[12px] py-[14px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-semibold leading-none">Cart</h2>
          {subtitle && (
            <p className="mt-[6px] text-[11px] text-black/70">{subtitle}</p>
          )}
        </div>
        <Price amount={cart.total ?? 0} currencyCode={currencyCode} size="lg" />
      </div>

      <div className="mt-[20px] flex flex-1 flex-col gap-[14px] overflow-y-auto pr-[2px]">
        {items.map((item) => {
          const imageUrl =
            item.thumbnail ||
            item.product?.thumbnail ||
            item.variant?.product?.images?.[0]?.url ||
            item.product?.images?.[0]?.url

          const category = item.product?.categories?.[0]?.name || "Item"
          const isPending = pendingId === item.id

          return (
            <div
              key={item.id}
              className="flex items-center gap-[14px]"
              data-testid="cart-row"
            >
              <LocalizedClientLink
                href={`/products/${item.product_handle}`}
                className="block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[10px] bg-[#EFEFEF]"
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={item.product_title || ""}
                    className="h-full w-full object-cover"
                  />
                )}
              </LocalizedClientLink>

              <div className="flex flex-1 flex-col gap-[6px]">
                <p className="text-[10px] uppercase tracking-[0.06em] text-black/60">
                  {category}
                </p>
                <div className="flex items-baseline gap-[10px]">
                  <LocalizedClientLink
                    href={`/products/${item.product_handle}`}
                    className="text-[14px] font-semibold leading-none"
                  >
                    {item.product_title}
                  </LocalizedClientLink>
                  <span className="text-[11px] text-black/30">|</span>
                  <Price
                    amount={item.unit_price * item.quantity}
                    currencyCode={currencyCode}
                  />
                </div>

                <div className="mt-[4px] flex items-center gap-[6px]">
                  <Pill
                    onClick={() => handleQuantity(item.id, 0)}
                    disabled={isPending}
                  >
                    Remove
                  </Pill>
                  <Pill
                    onClick={() => handleQuantity(item.id, item.quantity - 1)}
                    disabled={isPending}
                  >
                    <div className="h-[10px] flex items-center justify-center">
                      <Image
                        alt=""
                        src="/icons/minus.svg"
                        width={10}
                        height={10}
                        className="w-[6px] h-[6px]"
                      />
                    </div>
                  </Pill>
                  <Pill
                    onClick={() => handleQuantity(item.id, item.quantity + 1)}
                    disabled={isPending}
                  >
                    <div className="h-[10px] flex items-center justify-center">
                      <Image
                        alt=""
                        src="/icons/plus.svg"
                        width={10}
                        height={10}
                        className="w-[6px] h-[6px]"
                      />
                    </div>
                  </Pill>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CartCard
