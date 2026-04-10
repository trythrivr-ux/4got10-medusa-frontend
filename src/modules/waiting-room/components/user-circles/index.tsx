"use client"

import { useEffect, useState, useRef, useCallback } from "react"

type User = {
  id: string
  joinedAt: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

// Test users that always appear
const TEST_USERS: User[] = [
  {
    id: "test_1",
    joinedAt: Date.now() - 5000,
    x: 100,
    y: 50,
    vx: 0,
    vy: 0,
    radius: 28,
    color: "#00000025",
  },
  {
    id: "test_2",
    joinedAt: Date.now() - 4000,
    x: 200,
    y: 80,
    vx: 0,
    vy: 0,
    radius: 28,
    color: "#00000025",
  },
  {
    id: "test_3",
    joinedAt: Date.now() - 3000,
    x: 300,
    y: 60,
    vx: 0,
    vy: 0,
    radius: 28,
    color: "#00000025",
  },
  {
    id: "test_4",
    joinedAt: Date.now() - 2000,
    x: 150,
    y: 100,
    vx: 0,
    vy: 0,
    radius: 28,
    color: "#00000025",
  },
  {
    id: "test_5",
    joinedAt: Date.now() - 1000,
    x: 250,
    y: 90,
    vx: 0,
    vy: 0,
    radius: 28,
    color: "#00000025",
  },
]

export default function UserCircles() {
  const [users, setUsers] = useState<User[]>(TEST_USERS)
  const [myUserId, setMyUserId] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const usersRef = useRef<User[]>(users)

  // Physics constants
  const GRAVITY = 0.3
  const BOUNCE = 0.7
  const FRICTION = 0.99
  const CIRCLE_RADIUS = 28 // Same size for all circles

  // Generate a consistent color for each user based on their ID
  const getUserColor = (id: string) => {
    const colors = ["#00000025", "#000000"]
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Physics simulation
  const updatePhysics = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const padding = 10 // Padding from edges

    setUsers((prevUsers) => {
      const newUsers = prevUsers.map((user) => {
        // Apply gravity
        let vy = user.vy + GRAVITY
        let vx = user.vx * FRICTION
        let x = user.x + vx
        let y = user.y + vy

        // Bounce off walls with padding
        if (x - user.radius < padding) {
          x = padding + user.radius
          vx = -vx * BOUNCE
        }
        if (x + user.radius > width - padding) {
          x = width - padding - user.radius
          vx = -vx * BOUNCE
        }
        if (y - user.radius < padding) {
          y = padding + user.radius
          vy = -vy * BOUNCE
        }
        if (y + user.radius > height - padding) {
          y = height - padding - user.radius
          vy = -vy * BOUNCE
        }

        return { ...user, x, y, vx, vy }
      })

      // Simple collision between circles
      for (let i = 0; i < newUsers.length; i++) {
        for (let j = i + 1; j < newUsers.length; j++) {
          const u1 = newUsers[i]
          const u2 = newUsers[j]

          const dx = u2.x - u1.x
          const dy = u2.y - u1.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = u1.radius + u2.radius

          if (dist < minDist && dist > 0) {
            // Collision response
            const nx = dx / dist
            const ny = dy / dist
            const overlap = minDist - dist

            // Separate circles
            newUsers[i] = {
              ...newUsers[i],
              x: u1.x - (nx * overlap) / 2,
              y: u1.y - (ny * overlap) / 2,
            }
            newUsers[j] = {
              ...newUsers[j],
              x: u2.x + (nx * overlap) / 2,
              y: u2.y + (ny * overlap) / 2,
            }

            // Exchange velocities (simplified)
            const dvx = newUsers[i].vx - newUsers[j].vx
            const dvy = newUsers[i].vy - newUsers[j].vy
            const dvn = dvx * nx + dvy * ny

            if (dvn > 0) {
              newUsers[i] = {
                ...newUsers[i],
                vx: newUsers[i].vx - dvn * nx * BOUNCE,
                vy: newUsers[i].vy - dvn * ny * BOUNCE,
              }
              newUsers[j] = {
                ...newUsers[j],
                vx: newUsers[j].vx + dvn * nx * BOUNCE,
                vy: newUsers[j].vy + dvn * ny * BOUNCE,
              }
            }
          }
        }
      }

      usersRef.current = newUsers
      return newUsers
    })

    animationRef.current = requestAnimationFrame(updatePhysics)
  }, [])

  useEffect(() => {
    // Generate or retrieve user ID from localStorage (client-side only)
    let userId: string
    if (typeof window !== "undefined" && window.localStorage) {
      userId = window.localStorage.getItem("waitingRoomUserId") || ""
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        window.localStorage.setItem("waitingRoomUserId", userId)
      }
    } else {
      // Fallback for SSR or when localStorage is not available
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setMyUserId(userId)

    // Start physics simulation
    animationRef.current = requestAnimationFrame(updatePhysics)

    // Join the waiting room with random position at top
    const container = containerRef.current
    const width = container?.getBoundingClientRect().width || 400
    const initialX = Math.random() * (width - 60) + 30

    const myUser: User = {
      id: userId,
      joinedAt: Date.now(),
      x: initialX,
      y: 30,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      radius: CIRCLE_RADIUS,
      color: getUserColor(userId),
    }

    setUsers((prev) => [...prev, myUser])

    fetch(`/api/waiting-room`, {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: { "Content-Type": "application/json" },
    })

    // Poll for other users
    const pollInterval = setInterval(() => {
      fetch(`/api/waiting-room?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          const container = containerRef.current
          const width = container?.getBoundingClientRect().width || 400
          const height = container?.getBoundingClientRect().height || 400

          setUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id))
            const newUsers = [...prev]

            data.users.forEach(
              (serverUser: { id: string; joinedAt: number }) => {
                if (
                  !existingIds.has(serverUser.id) &&
                  serverUser.id !== userId
                ) {
                  // New user drops from top
                  newUsers.push({
                    id: serverUser.id,
                    joinedAt: serverUser.joinedAt,
                    x: Math.random() * (width - 60) + 30,
                    y: 30,
                    vx: (Math.random() - 0.5) * 2,
                    vy: 0,
                    radius: CIRCLE_RADIUS,
                    color: getUserColor(serverUser.id),
                  })
                }
              }
            )

            return newUsers
          })
        })
    }, 2000)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      clearInterval(pollInterval)
      fetch(`/api/waiting-room?userId=${userId}`, { method: "DELETE" })
    }
  }, [updatePhysics])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Physics container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
      >
        {/* User circles */}
        {users.map((user) => {
          const isMe = user.id === myUserId

          return (
            <div
              key={user.id}
              className="absolute transition-none"
              style={{
                left: user.x,
                top: user.y,
                transform: "translate(-50%, -50%)",
                width: user.radius * 2,
                height: user.radius * 2,
              }}
            >
              {/* Border wrapper with padding */}
              <div className="w-full h-full border-[1px] border-[#00000030] rounded-full p-[4px]">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: user.color,
                  }}
                >
                  {isMe && (
                    <span className="text-white text-xs font-bold">You</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
