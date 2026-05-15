"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { sdk } from "@lib/config"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RolloutStatus =
  | "NOT_REVEALED" // announcement_date is in the future (or not set)
  | "ANNOUNCED" // announced but drop_date is still in the future
  | "DROPPED" // drop_date has passed, not sold out yet
  | "SOLDOUT" // sold_out_date has passed

export interface ActiveRollout {
  id: string
  name: string
  announcement_date: string | null
  drop_date: string | null
  sold_out_date: string | null
  media: string[]
  media_urls: string[]
  product_ids: string[]
  products: any[]
  headliner: string | null
  description: string | null
}

interface RolloutContextType {
  /** The first rollout whose announcement_date has passed, or null if none */
  rollout: ActiveRollout | null
  /** Derived status based on dates vs now */
  status: RolloutStatus | null
  /** True while the initial fetch is in progress */
  loading: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(rollout: ActiveRollout): RolloutStatus {
  const now = Date.now()

  const announcedAt = rollout.announcement_date
    ? new Date(rollout.announcement_date).getTime()
    : null
  const dropsAt = rollout.drop_date
    ? new Date(rollout.drop_date).getTime()
    : null
  const soldOutAt = rollout.sold_out_date
    ? new Date(rollout.sold_out_date).getTime()
    : null

  if (soldOutAt !== null && now >= soldOutAt) return "SOLDOUT"
  if (dropsAt !== null && now >= dropsAt) return "DROPPED"
  if (announcedAt !== null && now >= announcedAt) return "ANNOUNCED"
  return "NOT_REVEALED"
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RolloutContext = createContext<RolloutContextType>({
  rollout: null,
  status: null,
  loading: true,
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RolloutProvider({ children }: { children: ReactNode }) {
  const [rollout, setRollout] = useState<ActiveRollout | null>(null)
  const [status, setStatus] = useState<RolloutStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await sdk.client.fetch("/store/rollouts", {
          method: "GET",
        })
        if (!response) return

        const { rollouts } = response as any
        if (cancelled) return

        const now = Date.now()

        // Pick the first rollout that has been announced (past announcement_date)
        // or, if none have been announced yet, pick the soonest upcoming one
        const announced = (rollouts as ActiveRollout[]).find((r) =>
          r.announcement_date
            ? new Date(r.announcement_date).getTime() <= now
            : false
        )

        const active = announced ?? null

        setRollout(active)
        setStatus(active ? deriveStatus(active) : null)
      } catch {
        // network error — leave loading=false, rollout=null
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <RolloutContext.Provider value={{ rollout, status, loading }}>
      {children}
    </RolloutContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Returns the active rollout and its status. Safe to call anywhere under RolloutProvider. */
export function useRollout() {
  return useContext(RolloutContext)
}
