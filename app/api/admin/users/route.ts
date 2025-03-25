import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { auth } from "@clerk/nextjs/server"
import { isUserAdmin } from "@/lib/auth-utils"

// This API route is for managing user roles
// Only admins can access this route (protected by middleware)

export async function GET() {
  try {
    // Check if user is authenticated and authorized
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all users
    const users = await clerkClient.users.getUserList({
      limit: 100,
    })

    // Map users to a simpler format with role information
    const mappedUsers = users.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      role: user.privateMetadata.role || "user",
      createdAt: user.createdAt,
    }))

    return NextResponse.json(mappedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId: targetUserId, role } = await request.json()

    if (!targetUserId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the current user is an admin
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update the user's role
    await clerkClient.users.updateUser(targetUserId, {
      privateMetadata: { role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}

