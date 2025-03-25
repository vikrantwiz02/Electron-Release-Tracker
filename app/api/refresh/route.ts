import { NextResponse } from "next/server"
import { refreshChromiumData } from "@/lib/chromium-api"
import { refreshElectronData } from "@/lib/github-api"
import { sendSlackNotification } from "@/lib/slack"
import { updateApiSettings } from "@/lib/db"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Starting data refresh...")

    // Refresh Chromium data with error handling
    let chromiumReleases = []
    try {
      console.log("Refreshing Chromium data...")
      chromiumReleases = await refreshChromiumData()
      console.log(`Successfully refreshed ${chromiumReleases.length} Chromium releases`)
    } catch (error) {
      console.error("Error refreshing Chromium data:", error)
      // Continue with other operations even if Chromium refresh fails
    }

    // Refresh Electron data with error handling
    let electronReleases = []
    try {
      console.log("Refreshing Electron data...")
      electronReleases = await refreshElectronData()
      console.log(`Successfully refreshed ${electronReleases.length} Electron releases`)
    } catch (error) {
      console.error("Error refreshing Electron data:", error)
      // Continue with other operations even if Electron refresh fails
    }

    // Send notification to Slack (if we have a webhook URL)
    try {
      if (process.env.SLACK_WEBHOOK_URL) {
        await sendSlackNotification(
          `Release data refreshed: ${chromiumReleases.length} Chromium releases and ${electronReleases.length} Electron releases updated.`,
          "refresh",
        )
      } else {
        console.log("Skipping Slack notification - no webhook URL configured")
      }
    } catch (error) {
      console.error("Error sending Slack notification:", error)
    }

    // Update the last refreshed timestamp
    try {
      await updateApiSettings({
        id: "api-settings",
        lastRefreshed: new Date(),
      })
    } catch (error) {
      console.error("Error updating API settings:", error)
    }

    // Redirect back to the dashboard
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Error refreshing data:", error)
    return NextResponse.json({ error: "Failed to refresh data" }, { status: 500 })
  }
}

