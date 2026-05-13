import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-0">
      <div className="flex w-full flex-col gap-[14px] rounded-[10px] bg-white p-[12px] py-[14px]">
        <Heading level="h2" className="text-[20px] font-semibold leading-none">
          Summary
        </Heading>
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div>
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
