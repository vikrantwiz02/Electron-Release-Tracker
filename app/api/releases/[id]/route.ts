import { NextResponse } from "next/server"
import { getReleaseById, updateRelease, deleteRelease } from "@/lib/db"
import { sendSlackNotification } from "@/lib/slack"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const release = await getReleaseById(id)

    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    return NextResponse.json(release)
  } catch (error) {
    console.error("Error fetching release:", error)
    return NextResponse.json({ error: "Failed to fetch release" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate the request body
    if (!body.name || !body.project || !body.type || !body.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mark as manual override
    body.isManualOverride = true

    // Update the release
    const updatedRelease = await updateRelease(id, body)

    if (!updatedRelease) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    // Send notification to Slack
    await sendSlackNotification(`Release "${body.name}" was updated manually.`, "update")

    return NextResponse.json(updatedRelease)
  } catch (error) {
    console.error("Error updating release:", error)
    return NextResponse.json({ error: "Failed to update release" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the release before deleting it
    const release = await getReleaseById(id)

    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    // Delete the release
    const success = await deleteRelease(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete release" }, { status: 500 })
    }

    // Send notification to Slack
    await sendSlackNotification(`Release "${release.name}" was deleted manually.`, "delete")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting release:", error)
    return NextResponse.json({ error: "Failed to delete release" }, { status: 500 })
  }
}

