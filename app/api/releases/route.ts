import { NextResponse } from "next/server"
import { fetchReleases } from "@/lib/data"
import { getChromiumReleases } from "@/lib/chromium-api"

export async function GET(request: Request) {
  try {
    // Parse URL to get query parameters
    const { searchParams } = new URL(request.url)
    const project = searchParams.get("project")
    const type = searchParams.get("type")

    console.log(`API releases route: Fetching releases with project=${project}, type=${type}`)

    // If specifically requesting Chromium data, use the direct method
    if (project === "chromium") {
      console.log("Fetching Chromium releases directly")
      const chromiumReleases = await getChromiumReleases()

      // Apply type filter if needed
      const filteredReleases = type ? chromiumReleases.filter((release) => release.type === type) : chromiumReleases

      // Log the first few releases for debugging
      console.log(
        `Returning ${filteredReleases.length} Chromium releases. Sample:`,
        filteredReleases.slice(0, 2).map((r) => ({
          id: r.id,
          name: r.name,
          date: r.date instanceof Date ? r.date.toISOString() : r.date,
          type: r.type,
        })),
      )

      return NextResponse.json(filteredReleases)
    }

    // Otherwise use the standard method
    const releases = await fetchReleases(project || undefined, type || undefined, { cache: "no-store" })
    console.log(`Returning ${releases.length} releases from database`)

    return NextResponse.json(releases)
  } catch (error) {
    console.error("Error in releases API:", error)
    return NextResponse.json({ error: "Failed to fetch releases" }, { status: 500 })
  }
}

