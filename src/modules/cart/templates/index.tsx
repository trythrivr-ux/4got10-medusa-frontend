import EmptyCartMessage from "../components/empty-cart-message"
import CartCard from "../components/cart-card"
import CartSummaryCard from "../components/cart-summary-card"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="min-h-screen bg-[#EFEFEF] flex items-start justify-center w-full px-[10px] pt-[85px]">
      <div className="flex min-h-[700px] w-full max-w-[1280px] rounded-[10px] bg-[#D8D8D8] flex-row gap-[12px] p-[7px]">
        <div className="w-full" data-testid="cart-container">
          {cart?.items?.length ? (
            <div className="grid grid-cols-1 h-full gap-[7px] laptop:grid-cols-[1fr_360px]">
              <CartCard cart={cart} />
              {cart.region && <CartSummaryCard cart={cart as any} />}
            </div>
          ) : (
            <div className="rounded-[14px] bg-white p-[18px]">
              <EmptyCartMessage />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartTemplate
