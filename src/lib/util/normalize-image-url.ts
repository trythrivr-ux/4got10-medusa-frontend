export const normalizeImageUrl = (url?: string | null) => {
  if (!url) {
    return undefined
  }

  // If the URL is already encoded, decode it once so Next.js doesn't double-encode
  // it when creating the /_next/image proxy URL.
  try {
    return decodeURIComponent(url)
  } catch {
    return url
  }
}
