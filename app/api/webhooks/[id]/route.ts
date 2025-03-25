import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to the database
    const { webhooks } = await connectToDatabase()

    // Find the webhook
    const webhook = await webhooks.findOne({ id })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    return NextResponse.json(webhook)
  } catch (error) {
    console.error("Error fetching webhook:", error)
    return NextResponse.json({ error: "Failed to fetch webhook" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate the request body
    if (!body.name || !body.url || !body.events) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to the database
    const { webhooks } = await connectToDatabase()

    // Update the webhook
    const now = new Date()
    const result = await webhooks.findOneAndUpdate(
      { id },
      {
        $set: {
          name: body.name,
          url: body.url,
          events: body.events,
          isActive: body.isActive !== false, // Default to true if not provided
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating webhook:", error)
    return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to the database
    const { webhooks } = await connectToDatabase()

    // Delete the webhook
    const result = await webhooks.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 })
  }
}

