"use client"

import { useState, useEffect } from "react"

export default function SimplePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="h-16 bg-white border-b flex items-center px-6">
        <h1 className="text-xl font-bold">4got10 Store</h1>
      </nav>
      
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome to 4got10</h2>
          <p className="text-lg text-gray-600">Your premium shopping destination</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border rounded-lg p-6">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Product 1</h3>
            <p className="text-gray-600 mb-4">Description coming soon</p>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
          
          <div className="border rounded-lg p-6">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Product 2</h3>
            <p className="text-gray-600 mb-4">Description coming soon</p>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
          
          <div className="border rounded-lg p-6">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Product 3</h3>
            <p className="text-gray-600 mb-4">Description coming soon</p>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">© 2024 4got10 Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
