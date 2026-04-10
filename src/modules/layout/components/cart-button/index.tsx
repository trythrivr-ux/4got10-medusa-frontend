import CartDropdown from "../cart-dropdown"

export default async function CartButton() {
  // Temporarily disable cart retrieval to prevent localStorage SSR errors
  const cart = null

  return <CartDropdown cart={cart} />
}
