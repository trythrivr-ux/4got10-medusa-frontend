"use client"

import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React, { useActionState } from "react"
import { resendOrderConfirmation } from "@lib/data/order-email"

type OrderDetailsTemplateProps = {
  order: any // Use any type to prevent Medusa imports during SSR
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  const [state, formAction] = useActionState(resendOrderConfirmation, {
    success: false,
    error: "",
  })

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <div className="flex gap-4 items-center">
          <form action={formAction}>
            <input type="hidden" name="order_id" value={order.id} />
            <button
              type="submit"
              className="text-small-regular text-ui-fg-subtle hover:text-ui-fg-base underline"
            >
              Resend confirmation email
            </button>
          </form>
          <LocalizedClientLink
            href="/account/orders"
            className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
            data-testid="back-to-overview-button"
          >
            <XMark /> Back to overview
          </LocalizedClientLink>
        </div>
      </div>
      {state.success && (
        <div className="text-green-600 text-small-regular">
          Order confirmation email sent successfully!
        </div>
      )}
      {state.error && (
        <div className="text-red-600 text-small-regular">
          Failed to send email: {state.error}
        </div>
      )}
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
