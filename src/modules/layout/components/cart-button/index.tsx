import CartDropdown from "../cart-dropdown"
import { retrieveCart } from "@lib/data/cart"

export default async function CartButton() {
  const cart = await retrieveCart().catch(() => null)

  return <CartDropdown cart={cart} />
}
