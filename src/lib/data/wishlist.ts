"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheTag } from "./cookies"
import { revalidateTag } from "next/cache"
import { retrieveCustomer, updateCustomer } from "./customer"

export type WishlistItem = {
  product_id: string
  variant_id?: string
  added_at: string
}

export type Wishlist = {
  items: WishlistItem[]
}

// Get wishlist from customer metadata
export const getWishlist = async (): Promise<Wishlist | null> => {
  const customer = await retrieveCustomer()
  
  if (!customer) return null
  
  const wishlist = customer.metadata?.wishlist as Wishlist | undefined
  
  return wishlist || { items: [] }
}

// Check if product is in wishlist
export const isInWishlist = async (productId: string): Promise<boolean> => {
  const wishlist = await getWishlist()
  
  if (!wishlist) return false
  
  return wishlist.items.some(item => item.product_id === productId)
}

// Add product to wishlist
export const addToWishlist = async (productId: string, variantId?: string) => {
  const customer = await retrieveCustomer()
  
  if (!customer) {
    throw new Error("You must be logged in to add items to your wishlist")
  }
  
  const currentWishlist = (customer.metadata?.wishlist as Wishlist) || { items: [] }
  
  // Check if already in wishlist
  if (currentWishlist.items.some(item => item.product_id === productId)) {
    return currentWishlist
  }
  
  const newWishlist: Wishlist = {
    items: [
      ...currentWishlist.items,
      {
        product_id: productId,
        variant_id: variantId,
        added_at: new Date().toISOString()
      }
    ]
  }
  
  await updateCustomer({
    metadata: {
      ...customer.metadata,
      wishlist: newWishlist
    }
  })
  
  return newWishlist
}

// Remove product from wishlist
export const removeFromWishlist = async (productId: string) => {
  const customer = await retrieveCustomer()
  
  if (!customer) {
    throw new Error("You must be logged in to remove items from your wishlist")
  }
  
  const currentWishlist = (customer.metadata?.wishlist as Wishlist) || { items: [] }
  
  const newWishlist: Wishlist = {
    items: currentWishlist.items.filter(item => item.product_id !== productId)
  }
  
  await updateCustomer({
    metadata: {
      ...customer.metadata,
      wishlist: newWishlist
    }
  })
  
  return newWishlist
}

// Toggle wishlist item
export const toggleWishlist = async (productId: string, variantId?: string): Promise<boolean> => {
  const isInList = await isInWishlist(productId)
  
  if (isInList) {
    await removeFromWishlist(productId)
    return false
  } else {
    await addToWishlist(productId, variantId)
    return true
  }
}
