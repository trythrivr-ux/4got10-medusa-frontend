// Global error handler to suppress localStorage SSR errors
if (typeof window === "undefined") {
  // Server-side: Suppress console errors for localStorage
  const originalConsoleError = console.error
  
  console.error = (...args: any[]) => {
    const message = args[0]?.message || args[0] || ""
    
    // Suppress localStorage-related errors during SSR
    if (
      typeof message === "string" && 
      (message.includes("localStorage") || 
       message.includes("getItem is not a function") ||
       message.includes("setItem is not a function"))
    ) {
      return
    }
    
    originalConsoleError.apply(console, args)
  }
  
  // Suppress unhandled promise rejections for localStorage
  process.on("unhandledRejection", (reason: any) => {
    const message = reason?.message || reason || ""
    
    if (
      typeof message === "string" && 
      (message.includes("localStorage") || 
       message.includes("getItem is not a function") ||
       message.includes("setItem is not a function"))
    ) {
      return
    }
    
    console.error("Unhandled Rejection:", reason)
  })
} else {
  // Client-side: Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason?.message || event.reason || ""
    
    if (
      typeof message === "string" && 
      (message.includes("localStorage") || 
       message.includes("getItem is not a function") ||
       message.includes("setItem is not a function"))
    ) {
      event.preventDefault()
      return
    }
  })
}
