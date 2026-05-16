"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRollout } from "@/context/rollout-context"

export default function ReleasePage() {
  const router = useRouter()
  const { rollout, status, loading } = useRollout()

  useEffect(() => {
    // If rollout hasn't dropped yet, redirect back to home
    if (!loading && status !== "DROPPED" && status !== "SOLDOUT") {
      router.push("/")
    }
  }, [status, loading, router])

  if (loading) {
    return null
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#efefef]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Release</h1>
        {rollout && (
          <p className="text-lg">{rollout.name}</p>
        )}
      </div>
    </div>
  )
}
