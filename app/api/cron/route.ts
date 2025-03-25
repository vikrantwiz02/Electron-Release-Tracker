import { NextResponse } from "next/server"
import { refreshChromiumData } from "@/lib/chromium-api"
import { refreshElectronData } from "@/lib/github-api"
import { sendSlackNotification } from "@/lib/slack"
import { updateApiSettings } from "@/lib/db"

// This route is called by a Vercel cron job to refresh the data
export async function GET() {
  try {
    // Refresh Chromium data
    const chromiumReleases = await refreshChromiumData()

    // Refresh Electron data
    const electronReleases = await refreshElectronData()

    // Update the last refreshed timestamp
    await updateApiSettings({
      id: "api-settings",
      lastRefreshed: new Date(),
    })

    // Send notification to Slack
    await sendSlackNotification(
      `Automated data refresh completed: ${chromiumReleases.length} Chromium releases and ${electronReleases.length} Electron releases updated.`,
      "refresh",
    )

    return NextResponse.json({
      success: true,
      message: "Data refreshed successfully",
      chromiumCount: chromiumReleases.length,
      electronCount: electronReleases.length,
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Failed to refresh data" }, { status: 500 })
  }
}

