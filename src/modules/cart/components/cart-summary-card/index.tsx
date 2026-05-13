"use client"

import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DiscountCode from "@modules/checkout/components/discount-code"

type CartSummaryCardProps = {
  cart: HttpTypes.StoreCart & {
    promotions?: HttpTypes.StorePromotion[]
  }
}

const Row = ({
  label,
  amount,
  currencyCode,
  emphasize,
}: {
  label: string
  amount?: number | null
  currencyCode: string
  emphasize?: boolean
}) => (
  <div
    className={`flex items-center justify-between ${
      emphasize ? "text-[14px] font-semibold" : "text-[12px] text-black/70"
    }`}
  >
    <span>{label}</span>
    <span>
      {convertToLocale({
        amount: amount ?? 0,
        currency_code: currencyCode,
      })}
    </span>
  </div>
)

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  }
  if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  }
  return "payment"
}

const CartSummaryCard = ({ cart }: CartSummaryCardProps) => {
  const step = getCheckoutStep(cart)
  const currencyCode = cart.currency_code

  return (
    <div className="flex h-full w-full flex-col gap-[18px] rounded-[14px] bg-white p-[18px]">
      <div className="flex items-start justify-between">
        <h2 className="text-[20px] font-semibold leading-none">Summary</h2>
      </div>

      <DiscountCode cart={cart as any} />

      <div className="flex flex-col gap-[10px]">
        <Row
          label="Subtotal (excl. shipping & taxes)"
          amount={cart.subtotal}
          currencyCode={currencyCode}
        />
        {!!cart.discount_total && (
          <Row
            label="Discount"
            amount={-cart.discount_total}
            currencyCode={currencyCode}
          />
        )}
        <Row
          label="Shipping"
          amount={cart.shipping_subtotal}
          currencyCode={currencyCode}
        />
        <Row
          label="Taxes"
          amount={cart.tax_total}
          currencyCode={currencyCode}
        />
        <div className="my-[6px] h-px w-full bg-black/10" />
        <Row
          label="Total"
          amount={cart.total}
          currencyCode={currencyCode}
          emphasize
        />
      </div>

      <LocalizedClientLink
        href={`/checkout?step=${step}`}
        className="mt-auto flex items-center justify-center rounded-[10px] bg-black px-[14px] py-[12px] text-[12px] font-medium text-white"
        data-testid="summary-checkout-button"
      >
        Go to checkout
      </LocalizedClientLink>
    </div>
  )
}

export default CartSummaryCard
