"use client"

import React from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if it's a localStorage error and ignore it
    if (error.message.includes("localStorage") || error.message.includes("getItem is not a function")) {
      console.warn("Caught localStorage SSR error, ignoring:", error.message)
      return { hasError: false }
    }
    
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log non-localStorage errors
    if (!error.message.includes("localStorage") && !error.message.includes("getItem is not a function")) {
      console.error("Error caught by boundary:", error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={() => this.setState({ hasError: false, error: undefined })} />
      }
      
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
