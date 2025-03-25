import { NextResponse } from "next/server"
import { refreshChromiumData } from "@/lib/chromium-api"
import { sendSlackNotification } from "@/lib/slack"

// This route would be called by a cron job to refresh the data
export async function GET() {
  try {
    // Refresh the Chromium data
    const releases = await refreshChromiumData()

    // Log success for debugging
    console.log(`Successfully refreshed ${releases.length} Chromium releases`)

    // Send notification to Slack
    try {
      await sendSlackNotification(`Chromium data refreshed: ${releases.length} releases updated.`, "refresh")
    } catch (slackError) {
      console.error("Error sending Slack notification:", slackError)
      // Continue regardless of Slack notification success
    }

    return NextResponse.json({
      success: true,
      message: "Data refreshed successfully",
      count: releases.length,
    })
  } catch (error) {
    console.error("Error refreshing data:", error)
    return NextResponse.json({ error: "Failed to refresh data" }, { status: 500 })
  }
}

