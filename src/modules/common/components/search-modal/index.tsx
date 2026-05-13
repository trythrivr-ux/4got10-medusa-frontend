"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

type Product = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  variants?: Array<{
    calculated_price?: { calculated_amount?: number }
  }>
}

type SearchModalProps = {
  open: boolean
  onClose: () => void
  countryCode: string
  regionId?: string | null
  currencyCode?: string
  categoryHandle?: string
}

export default function SearchModal({
  open,
  onClose,
  countryCode,
  regionId,
  currencyCode = "usd",
  categoryHandle = "magazines",
}: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoryReady, setCategoryReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Resolve category ID once on mount
  useEffect(() => {
    const backend =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    fetch(
      `${backend}/store/product-categories?handle=${encodeURIComponent(
        categoryHandle
      )}&fields=id,handle`,
      {
        headers: pk ? { "x-publishable-api-key": pk } : {},
        cache: "force-cache",
      }
    )
      .then((r) => r.json())
      .then((json) => {
        const cat = json?.product_categories?.[0]
        if (cat?.id) {
          setCategoryId(cat.id)
        } else {
          console.warn(
            `[SearchModal] Category with handle "${categoryHandle}" not found. Check the handle in Medusa Admin.`
          )
        }
        setCategoryReady(true)
      })
      .catch(() => {
        setCategoryReady(true)
      })
  }, [categoryHandle])

  // Autofocus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults([])
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Debounced product search
  const search = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!q.trim()) {
        setResults([])
        setLoading(false)
        return
      }
      // Wait for category fetch to settle before searching
      if (!categoryReady) {
        setLoading(false)
        return
      }
      setLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const backend =
            process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
            "http://localhost:9000"
          const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
          const params = new URLSearchParams({
            q,
            limit: "12",
            fields:
              "id,title,handle,thumbnail,*variants.calculated_price,*images",
          })
          if (regionId) params.set("region_id", regionId)
          // Append category filter as raw string — URLSearchParams double-encodes
          // brackets which breaks Medusa's qs parser on the backend
          let qs = params.toString()
          if (categoryId)
            qs += `&category_id[0]=${encodeURIComponent(categoryId)}`

          const res = await fetch(`${backend}/store/products?${qs}`, {
            headers: pk ? { "x-publishable-api-key": pk } : {},
            cache: "no-store",
          })
          if (res.ok) {
            const json = await res.json()
            setResults(json.products || [])
          }
        } catch {
          setResults([])
        } finally {
          setLoading(false)
        }
      }, 280)
    },
    [regionId, categoryId, categoryReady]
  )

  useEffect(() => {
    search(query)
  }, [query, search])

  const formatPrice = (product: Product) => {
    const amount = product.variants?.[0]?.calculated_price?.calculated_amount
    if (amount == null) return null
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100)
  }

  const goToProduct = (handle: string) => {
    onClose()
    router.push(`/${countryCode}/products/${handle}`)
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-[80px] px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className="w-full max-w-[640px] bg-white rounded-[16px] overflow-hidden shadow-2xl"
        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center px-[20px] py-[18px] gap-[12px] border-b border-[#efefef]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-[#00000060]"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-[16px] font-medium tracking-[0.01em] outline-none bg-transparent placeholder:text-[#00000040]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 text-[#00000040] hover:text-black transition-colors text-[20px] leading-none"
            >
              ×
            </button>
          )}
          <button
            onClick={onClose}
            className="shrink-0 text-[11px] font-medium text-[#00000060] hover:text-black border border-[#e5e5e5] rounded-full px-[10px] py-[4px] transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[460px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-[40px]">
              <div className="w-[20px] h-[20px] border-2 border-[#e5e5e5] border-t-black rounded-full animate-spin" />
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[48px] gap-[8px]">
              <p className="text-[14px] font-medium text-[#00000070]">
                No products found for &quot;{query}&quot;
              </p>
              <p className="text-[12px] text-[#00000040]">
                Try a different search term
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 gap-[1px] bg-[#f5f5f5] p-[1px]">
              {results.map((product) => {
                const price = formatPrice(product)
                return (
                  <button
                    key={product.id}
                    onClick={() => goToProduct(product.handle)}
                    className="flex flex-row items-center gap-[12px] bg-white p-[14px] hover:bg-[#fafafa] transition-colors text-left"
                  >
                    <div className="relative w-[52px] h-[52px] rounded-[8px] overflow-hidden bg-[#efefef] shrink-0">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          sizes="52px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e5e5e5]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12.5px] font-medium truncate text-black">
                        {product.title}
                      </span>
                      {price && (
                        <span className="text-[11.5px] text-[#00000060] font-medium mt-[2px]">
                          {price}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="flex flex-col items-center justify-center py-[48px] gap-[8px]">
              <p className="text-[13px] font-medium text-[#00000050]">
                Start typing to search products
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
