import Link from "next/link"

type SuccessResponse =
  | { status: "confirmed"; order: any }
  | { status: "pending"; message: string; cart_id: string; session_id: string }

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams?.session_id

  let data: SuccessResponse | null = null
  try {
    if (sessionId) {
      const backend =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const resp = await fetch(`${backend}/custom/stripe/checkout/success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (resp.ok) {
        data = (await resp.json()) as SuccessResponse
      }
    }
  } catch {}

  const order = (data && (data as any).order) || null

  return (
    <div className="min-h-screen bg-[#EFEFEF] flex items-start justify-center px-[18px] pt-[85px]">
      <div className="flex min-h-[700px] w-fit rounded-[10px] bg-[#D8D8D8] flex-row gap-[12px] p-[7px]">
        <div className="grid grid-cols-1 gap-[7px] phone:min-w-[900px]">
          <div className="bg-white rounded-[8px] p-8">
            <h1 className="text-2xl font-bold mb-2">
              Thank you for your purchase
            </h1>
            {order && (
              <p className="text-[12px] text-gray-700 mb-4">
                Order No.:{" "}
                <span className="font-mono">
                  #{order.display_id || order.id}
                </span>
              </p>
            )}

            {order ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Your order has been created.
                </p>
                <div className="border rounded-[8px] p-4">
                  <h2 className="font-medium mb-2">Items</h2>
                  <ul className="space-y-2">
                    {order.items?.map((it: any) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate pr-2">
                          {it.title} × {it.quantity}
                        </span>
                        <span className="font-mono">
                          {(it.total / 100).toFixed(2)}{" "}
                          {order.currency_code?.toUpperCase?.()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-3">
                  <span>Total</span>
                  <span className="font-mono">
                    {(order.total / 100).toFixed(2)}{" "}
                    {order.currency_code?.toUpperCase?.()}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500">
                  A confirmation email should arrive shortly.
                </p>
              </div>
            ) : data && (data as any).status === "pending" ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  You can refresh this page in a few seconds.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-700 mb-4">
                Payment succeeded. Waiting for order confirmation.
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <Link
                href="/store"
                className="rounded-[8px] bg-black text-white px-4 py-2 text-sm"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
