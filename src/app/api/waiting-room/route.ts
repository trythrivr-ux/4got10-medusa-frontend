import { NextRequest, NextResponse } from "next/server"

// In-memory store for active users (resets on server restart)
const activeUsers = new Map<string, { id: string; joinedAt: number; lastSeen: number }>()

// Clean up users who haven't been seen in 30 seconds
const CLEANUP_INTERVAL = 30000
const USER_TIMEOUT = 30000

function cleanupStaleUsers() {
  const now = Date.now()
  activeUsers.forEach((user, id) => {
    if (now - user.lastSeen > USER_TIMEOUT) {
      activeUsers.delete(id)
    }
  })
}

// Run cleanup periodically
setInterval(cleanupStaleUsers, CLEANUP_INTERVAL)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")
  
  if (userId) {
    // Update user's last seen time
    const existing = activeUsers.get(userId)
    if (existing) {
      existing.lastSeen = Date.now()
    } else {
      activeUsers.set(userId, {
        id: userId,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      })
    }
  }
  
  // Return all active users
  const users = Array.from(activeUsers.values()).map(u => ({
    id: u.id,
    joinedAt: u.joinedAt,
  }))
  
  return NextResponse.json({ users, count: users.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const userId = body.userId
  
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }
  
  activeUsers.set(userId, {
    id: userId,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  })
  
  const users = Array.from(activeUsers.values()).map(u => ({
    id: u.id,
    joinedAt: u.joinedAt,
  }))
  
  return NextResponse.json({ users, count: users.length })
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")
  
  if (userId) {
    activeUsers.delete(userId)
  }
  
  return NextResponse.json({ success: true })
}
