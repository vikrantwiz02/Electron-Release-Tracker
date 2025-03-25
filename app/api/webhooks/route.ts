import { NextResponse } from "next/server"
import { getAllWebhooks } from "@/lib/db"
import { connectToDatabase } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const webhooks = await getAllWebhooks()
    return NextResponse.json(webhooks)
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the request body
    if (!body.name || !body.url || !body.events) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to the database
    const { webhooks } = await connectToDatabase()

    // Add null check for webhooks
    if (!webhooks) {
      console.error("Webhooks collection is not initialized")
      return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    }

    // Create a new webhook
    const now = new Date()
    const newWebhook = {
      id: uuidv4(),
      name: body.name,
      url: body.url,
      events: body.events,
      isActive: body.isActive !== false,
      createdAt: now,
      updatedAt: now,
    }

    await webhooks.insertOne(newWebhook)

    return NextResponse.json(newWebhook)
  } catch (error) {
    console.error("Error creating webhook:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}

