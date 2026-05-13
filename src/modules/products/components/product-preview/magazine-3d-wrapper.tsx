"use client"

import { useState, useEffect, useRef } from "react"
import Magazine3DPreview from "./magazine-3d-preview"

export default function Magazine3DWrapper({
  coverUrl,
  productImages,
}: {
  coverUrl?: string
  productImages?: string[]
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | undefined>()
  const [imageBlobUrls, setImageBlobUrls] = useState<string[] | undefined>()
  const blobUrlsRef = useRef<string[]>([])

  useEffect(() => {
    const fetchAsBlob = async (url: string): Promise<string | null> => {
      try {
        // Use proxy API to bypass CORS
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
        const response = await fetch(proxyUrl)
        if (!response.ok) return null
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        blobUrlsRef.current.push(blobUrl)
        return blobUrl
      } catch {
        return null
      }
    }

    const loadImages = async () => {
      // Clean up previous blob URLs
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      blobUrlsRef.current = []

      const coverBlob = coverUrl ? await fetchAsBlob(coverUrl) : undefined
      setCoverBlobUrl(coverBlob || undefined)

      if (productImages && productImages.length > 0) {
        const blobs = await Promise.all(
          productImages.map((url) => fetchAsBlob(url))
        )
        setImageBlobUrls(blobs.filter((b): b is string => b !== null))
      }
    }

    loadImages()

    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [coverUrl, productImages])

  return (
    <div
      className="w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Magazine3DPreview
        coverUrl={coverUrl}
        isHovered={isHovered}
        productImages={productImages}
        coverBlobUrl={coverBlobUrl}
        imageBlobUrls={imageBlobUrls}
      />
    </div>
  )
}
