import { NextResponse } from "next/server"
import { getChromiumReleases } from "@/lib/chromium-api"

// Define types for our Chromium release data
type ChromiumMilestone = {
  name: string
  date: string
}

type ChromiumRelease = {
  version: string
  milestones: ChromiumMilestone[]
}

// This route provides Chromium release data in a consistent format
export async function GET() {
  try {
    console.log("API route: Fetching Chromium releases...")

    // Get Chromium releases directly from API (bypassing database)
    const parsedReleases = await getChromiumReleases()

    // Debug log the actual data we got
    console.log(`API route: Received ${parsedReleases.length} releases from getChromiumReleases()`)
    console.log("First few releases:", JSON.stringify(parsedReleases.slice(0, 3)))

    // Convert to the expected format for this endpoint
    let chromiumReleases: ChromiumRelease[] = []

    if (parsedReleases && parsedReleases.length > 0) {
      console.log(`Processing ${parsedReleases.length} Chromium releases`)

      // Group releases by version
      const releasesByVersion: Record<string, ChromiumRelease> = {}

      parsedReleases.forEach((release) => {
        // Extract version number from the name (e.g., "Chromium 120 Alpha" -> "120")
        const versionMatch = release.name.match(/Chromium (\d+)/)
        if (!versionMatch) return

        const version = versionMatch[1]
        if (!releasesByVersion[version]) {
          releasesByVersion[version] = {
            version,
            milestones: [],
          }
        }

        // Convert type to name
        const name = release.type.charAt(0).toUpperCase() + release.type.slice(1)

        releasesByVersion[version].milestones.push({
          name,
          date: release.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        })
      })

      chromiumReleases = Object.values(releasesByVersion)
      console.log(`Grouped into ${chromiumReleases.length} Chromium versions`)
    } else {
      console.log("No Chromium releases found, using mock data")
      chromiumReleases = getMockChromiumReleases()
    }

    return NextResponse.json(chromiumReleases)
  } catch (error) {
    console.error("Error in Chromium API route:", error)
    // Even if everything fails, return mock data
    return NextResponse.json(getMockChromiumReleases())
  }
}

// Mock data for Chromium releases in the original format
function getMockChromiumReleases(): ChromiumRelease[] {
  console.log("Returning mock Chromium releases")
  return [
    {
      version: "120",
      milestones: [
        {
          name: "Alpha",
          date: "2023-10-05",
        },
        {
          name: "Beta",
          date: "2023-11-02",
        },
        {
          name: "Stable",
          date: "2023-12-05",
        },
      ],
    },
    {
      version: "121",
      milestones: [
        {
          name: "Alpha",
          date: "2023-11-16",
        },
        {
          name: "Beta",
          date: "2023-12-14",
        },
        {
          name: "Stable",
          date: "2024-01-23",
        },
      ],
    },
    {
      version: "122",
      milestones: [
        {
          name: "Alpha",
          date: "2024-01-04",
        },
        {
          name: "Beta",
          date: "2024-02-01",
        },
        {
          name: "Stable",
          date: "2024-03-05",
        },
      ],
    },
    {
      version: "123",
      milestones: [
        {
          name: "Alpha",
          date: "2024-02-15",
        },
        {
          name: "Beta",
          date: "2024-03-14",
        },
        {
          name: "Stable",
          date: "2024-04-16",
        },
      ],
    },
    {
      version: "124",
      milestones: [
        {
          name: "Alpha",
          date: "2024-03-28",
        },
        {
          name: "Beta",
          date: "2024-04-25",
        },
        {
          name: "Stable",
          date: "2024-05-28",
        },
      ],
    },
  ]
}

