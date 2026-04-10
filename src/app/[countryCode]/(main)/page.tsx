"use client"

import { useState, useEffect } from "react"
import { useMedusa } from "@/hooks/use-medusa"

export default function HomePage() {
  const { client, loading } = useMedusa()
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (client && !loading) {
      client.products
        .list()
        .then((response: any) => {
          setProducts(response.products || [])
        })
        .catch((err: any) => {
          setError(err.message || "Failed to fetch products")
        })
    }
  }, [client, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading 4got10 Store...</h2>
          <p className="text-gray-600">Connecting to Medusa backend</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to 4got10</h2>
          <p className="text-xl text-gray-600">
            Premium products from our Medusa backend
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in the store.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {product.thumbnail && (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-48 w-full object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    ${product.variants?.[0]?.prices?.[0]?.amount / 100 || 0}
                  </span>
                  <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © 2024 4got10 Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
