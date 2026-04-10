// Global localStorage polyfill to prevent SSR errors
if (typeof window === "undefined") {
  const existing = (globalThis as any).localStorage
  const isValid =
    existing &&
    typeof existing.getItem === "function" &&
    typeof existing.setItem === "function" &&
    typeof existing.removeItem === "function" &&
    typeof existing.clear === "function"

  if (!isValid) {
    const polyfill = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    } as Storage

    try {
      Object.defineProperty(globalThis, "localStorage", {
        value: polyfill,
        writable: false,
        enumerable: true,
        configurable: false,
      })
    } catch {
      ;(globalThis as any).localStorage = polyfill
    }
  }
}
