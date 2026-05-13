import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
