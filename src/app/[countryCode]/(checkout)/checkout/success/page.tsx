import Link from "next/link"
import { getCartId } from "@lib/data/cookies"

type SuccessResponse =
  | { status: "confirmed"; order: any }
  | { status: "pending"; message: string; cart_id: string; session_id: string }

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
  params: Promise<{ countryCode: string }>
}) {
  const { session_id: sessionId } = await searchParams

  let data: SuccessResponse | null = null
  let order: any = null
  try {
    const backend =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    // 1) Try to get order by cart_id cookie (idempotent on refresh)
    const cid = await getCartId()
    if (cid) {
      const respByCart = await fetch(
        `${backend}/custom/orders/by-cart/${encodeURIComponent(cid)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      )
      if (respByCart.ok) {
        const json = await respByCart.json()
        order = json?.order || order
      }
    }

    // 2) If not found yet and we have a session_id, call the backend resolver to create/return order
    if (!order && sessionId) {
      const resp = await fetch(`${backend}/custom/stripe/checkout/success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (resp.ok) {
        data = (await resp.json()) as SuccessResponse
        order = (data as any)?.order || null
      }
    }
  } catch {}

  // Short retry: if order is still not found, wait briefly then try by cart again
  if (!order) {
    try {
      const backend =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const cid = await getCartId()
      if (cid) {
        await new Promise((r) => setTimeout(r, 1000))
        const respRetry = await fetch(
          `${backend}/custom/orders/by-cart/${encodeURIComponent(cid)}`,
          {
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        )
        if (respRetry.ok) {
          const js = await respRetry.json()
          order = js?.order || order
        }
      }
    } catch {}
  }

  // Note: cart cookie is cleared by /api/checkout/complete Route Handler before this page loads.

  // Fallback: If items are missing, retrieve the order from Store API (by order id) to ensure full shape
  try {
    if (order && (!Array.isArray(order.items) || order.items.length === 0)) {
      const backend =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const fields =
        "id,display_id,status,payment_status,fulfillment_status,currency_code,subtotal,tax_total,shipping_total,total,*items,*shipping_address,*billing_address,*customer"
      const respFull = await fetch(
        `${backend}/store/orders/${order.id}?fields=${encodeURIComponent(
          fields
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(pk ? { "x-publishable-api-key": pk } : {}),
          },
          cache: "no-store",
        }
      )
      if (respFull.ok) {
        const json = await respFull.json()
        order = json?.order || order
      }
      // If still empty, try by cart_id cookie again
      if (!order?.items?.length) {
        const cid = await getCartId()
        if (cid) {
          const byCart = await fetch(
            `${backend}/custom/orders/by-cart/${encodeURIComponent(cid)}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              cache: "no-store",
            }
          )
          if (byCart.ok) {
            const js = await byCart.json()
            order = js?.order || order
          }
        }
      }
    }
  } catch {}

  const currency = (order?.currency_code || "").toString().toUpperCase()
  const toNum = (v: any) => (typeof v === "number" ? v : Number(v) || 0)
  const formatCents = (cents: any) => (toNum(cents) / 100).toFixed(2)
  const orderEmail =
    (order as any)?.email || (order as any)?.customer?.email || ""
  const regionDisplay =
    typeof Intl !== "undefined" && (Intl as any).DisplayNames
      ? new (Intl as any).DisplayNames(["en"], { type: "region" })
      : null
  const fullCountry = (code?: string | null) => {
    const c = (code || "").toString().toUpperCase()
    if (!c) return ""
    try {
      return regionDisplay ? regionDisplay.of(c) || c : c
    } catch {
      return c
    }
  }
  const computedTotal = order
    ? toNum(order.total) ||
      toNum(order.subtotal) +
        toNum(order.tax_total) +
        toNum(order.shipping_total)
    : 0

  return (
    <div className="min-h-screen bg-[#EFEFEF] flex items-start justify-center px-[18px] pt-[85px]">
      <div className="flex min-h-[700px] w-fit rounded-[10px] bg-[#D8D8D8] flex-row gap-[12px] p-[7px]">
        <div className="grid grid-cols-1 gap-[7px] phone:min-w-[900px]">
          <div className="bg-white rounded-[8px] p-8">
            <h1 className="text-2xl font-bold mb-2">
              Thank you for your purchase
            </h1>
            {order && (
              <p className="text-[12px] text-gray-700 mb-1">
                Order No.:{" "}
                <span className="font-mono">
                  #{order.display_id || order.id}
                </span>
              </p>
            )}

            {orderEmail && (
              <p className="text-[12px] text-gray-600 mb-4">
                Receipt sent to: <span className="font-mono">{orderEmail}</span>
              </p>
            )}

            {order ? (
              <div className="space-y-4">
                <div className="border rounded-[8px] p-4">
                  <h2 className="font-medium mb-2">Shipping details</h2>
                  <div className="text-[12.5px] text-gray-800 space-y-1">
                    <div className="font-medium">
                      {(order.shipping_address?.first_name || "") +
                        (order.shipping_address?.last_name
                          ? ` ${order.shipping_address.last_name}`
                          : "")}
                    </div>
                    {orderEmail && (
                      <div className="text-gray-600">{orderEmail}</div>
                    )}
                    {order.shipping_address?.phone && (
                      <div className="text-gray-600">
                        {order.shipping_address.phone}
                      </div>
                    )}
                    <div className="text-gray-700">
                      {order.shipping_address?.address_1}
                      {order.shipping_address?.address_2
                        ? `, ${order.shipping_address.address_2}`
                        : ""}
                    </div>
                    <div className="text-gray-700">
                      {(order.shipping_address?.postal_code || "").toString()}{" "}
                      {order.shipping_address?.city}
                    </div>
                    <div className="text-gray-700">
                      {order.shipping_address?.province || ""}
                      {order.shipping_address?.province ? ", " : ""}
                      {fullCountry(order.shipping_address?.country_code)}
                    </div>
                  </div>
                </div>
                <div className="border rounded-[8px] p-4">
                  <h2 className="font-medium mb-2">Billing details</h2>
                  <div className="text-[12.5px] text-gray-800 space-y-1">
                    <div className="font-medium">
                      {(order.billing_address?.first_name || "") +
                        (order.billing_address?.last_name
                          ? ` ${order.billing_address.last_name}`
                          : "")}
                    </div>
                    {orderEmail && (
                      <div className="text-gray-600">{orderEmail}</div>
                    )}
                    {order.billing_address?.phone && (
                      <div className="text-gray-600">
                        {order.billing_address.phone}
                      </div>
                    )}
                    <div className="text-gray-700">
                      {order.billing_address?.address_1}
                      {order.billing_address?.address_2
                        ? `, ${order.billing_address.address_2}`
                        : ""}
                    </div>
                    <div className="text-gray-700">
                      {(order.billing_address?.postal_code || "").toString()}{" "}
                      {order.billing_address?.city}
                    </div>
                    <div className="text-gray-700">
                      {order.billing_address?.province || ""}
                      {order.billing_address?.province ? ", " : ""}
                      {fullCountry(order.billing_address?.country_code)}
                    </div>
                  </div>
                </div>
                <div className="border rounded-[8px] p-4">
                  <h2 className="font-medium mb-2">Items</h2>
                  <div className="flex flex-col gap-[8px] mt-[8px]">
                    {order.items?.map((item: any) => {
                      const img =
                        item.thumbnail ||
                        item.product?.thumbnail ||
                        item.product?.images?.[0]?.url
                      return (
                        <div key={item.id} className="flex flex-row gap-[12px]">
                          {img && (
                            <div className="relative w-[85px] h-[85px] border-[#efefef] border-[1.5px] rounded-[9px] overflow-hidden bg-[#efefef] shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={item.title || ""}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <div className="flex flex-col justify-center items-start gap-[6px] min-w-0">
                            <div className="flex flex-row items-center gap-[7px] min-w-0">
                              <span className="text-[12.5px] font-medium truncate">
                                {item.title}
                              </span>
                              <div className="flex h-[12.5px] bg-[#00000030] w-[1.25px]" />
                              <span className="text-[12px] font-medium truncate">
                                {item.variant?.title ||
                                  (item as any)?.variant_title ||
                                  ""}
                              </span>
                            </div>
                            <div className="flex flex-row items-center gap-[7px]">
                              <span className="text-[11.5px] text-[#00000070] font-medium truncate">
                                {item.variant?.title ||
                                  (item as any)?.variant_title ||
                                  ""}
                              </span>
                              <div className="flex h-[12.5px] bg-[#00000030] w-[1.25px]" />
                              <span className="text-[11.5px] text-[#00000070] font-medium truncate">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: (
                                    order?.currency_code || "USD"
                                  ).toUpperCase(),
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(
                                  toNum(
                                    item.total ??
                                      toNum(item.unit_price) *
                                        toNum(item.quantity)
                                  )
                                )}
                              </span>
                              <div className="flex h-[12.5px] bg-[#00000030] w-[1.25px]" />
                              <span className="text-[11.5px] text-[#00000070] font-medium truncate">
                                x {toNum(item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="border rounded-[8px] p-4">
                  <h2 className="font-medium mb-2">Order summary</h2>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: (
                            order?.currency_code || "USD"
                          ).toUpperCase(),
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(toNum(order?.subtotal))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span className="font-mono">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: (
                            order?.currency_code || "USD"
                          ).toUpperCase(),
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(toNum(order?.shipping_total))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span className="font-mono">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: (
                            order?.currency_code || "USD"
                          ).toUpperCase(),
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(toNum(order?.tax_total))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Total</span>
                      <span className="font-mono font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: (
                            order?.currency_code || "USD"
                          ).toUpperCase(),
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(toNum(computedTotal))}
                      </span>
                    </div>
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
