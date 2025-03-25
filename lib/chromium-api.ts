import { createRelease, updateRelease, getReleaseById, updateApiSettings, isUsingMockDatabase } from "./db"

// Updated types for the actual Chromium API response
export type ChromiumMilestone = {
  mstone: number
  branch_point: string
  earliest_beta: string
  latest_beta: string
  stable_date: string
  earliest_dev?: string // This field might not exist in the actual API
}

// Type for the raw API response
interface ChromiumApiResponse {
  mstones: Array<{
    mstone: number
    branch_point: string
    earliest_beta: string
    latest_beta?: string
    final_beta?: string
    stable_date: string
    [key: string]: any // For other fields we don't explicitly use
  }>
}

// Fetch Chromium release schedule from the official API
export async function fetchChromiumReleases(): Promise<ChromiumMilestone[]> {
  try {
    console.log("Fetching Chromium releases from API...")

    // Chromium's official schedule API
    const response = await fetch("https://chromiumdash.appspot.com/fetch_milestone_schedule", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Chromium releases: ${response.statusText}`)
    }

    const data = (await response.json()) as ChromiumApiResponse
    console.log("Chromium API response received")

    // Log a sample of the response for debugging
    console.log("API response sample:", JSON.stringify(data).substring(0, 500) + "...")

    // The API returns mstones instead of milestones
    if (!data || !data.mstones || !Array.isArray(data.mstones)) {
      console.error("Unexpected Chromium API response format:", data)
      return getMockChromiumData()
    }

    // Map the API response to the expected format
    const milestones = data.mstones.map((milestone) => ({
      mstone: milestone.mstone,
      branch_point: milestone.branch_point,
      earliest_beta: milestone.earliest_beta,
      latest_beta: milestone.latest_beta || milestone.final_beta || "", // Some use final_beta instead of latest_beta
      stable_date: milestone.stable_date,
      earliest_dev: milestone.branch_point, // Use branch_point as the dev/alpha date
    }))

    console.log(`Successfully mapped ${milestones.length} Chromium milestones`)
    return milestones
  } catch (error) {
    console.error("Error fetching Chromium releases:", error)
    // Return mock data in case of error
    return getMockChromiumData()
  }
}

// Provide mock Chromium data for development or when API fails
function getMockChromiumData(): ChromiumMilestone[] {
  console.log("Using mock Chromium data")
  return [
    {
      mstone: 120,
      branch_point: "2023-10-05T00:00:00",
      earliest_beta: "2023-11-02T00:00:00",
      latest_beta: "2023-11-30T00:00:00",
      stable_date: "2023-12-05T00:00:00",
      earliest_dev: "2023-10-05T00:00:00",
    },
    {
      mstone: 121,
      branch_point: "2023-11-16T00:00:00",
      earliest_beta: "2023-12-14T00:00:00",
      latest_beta: "2024-01-18T00:00:00",
      stable_date: "2024-01-23T00:00:00",
      earliest_dev: "2023-11-16T00:00:00",
    },
    {
      mstone: 122,
      branch_point: "2024-01-04T00:00:00",
      earliest_beta: "2024-02-01T00:00:00",
      latest_beta: "2024-02-29T00:00:00",
      stable_date: "2024-03-05T00:00:00",
      earliest_dev: "2024-01-04T00:00:00",
    },
    {
      mstone: 123,
      branch_point: "2024-02-15T00:00:00",
      earliest_beta: "2024-03-14T00:00:00",
      latest_beta: "2024-04-11T00:00:00",
      stable_date: "2024-04-16T00:00:00",
      earliest_dev: "2024-02-15T00:00:00",
    },
    {
      mstone: 124,
      branch_point: "2024-03-28T00:00:00",
      earliest_beta: "2024-04-25T00:00:00",
      latest_beta: "2024-05-23T00:00:00",
      stable_date: "2024-05-28T00:00:00",
      earliest_dev: "2024-03-28T00:00:00",
    },
  ]
}

// Parse Chromium data and convert to our application format
export function parseChromiumData(milestones: ChromiumMilestone[]) {
  // Add null check to prevent the flatMap error
  if (!milestones || !Array.isArray(milestones)) {
    console.error("Invalid milestones data:", milestones)
    return []
  }

  console.log(`Parsing ${milestones.length} Chromium milestones`)

  const releases = milestones.flatMap((milestone) => {
    const result = []

    // Add Alpha/Dev release
    if (milestone.branch_point) {
      result.push({
        id: `chromium-${milestone.mstone}-alpha`,
        name: `Chromium ${milestone.mstone} Alpha`,
        date: new Date(milestone.branch_point),
        type: "alpha" as const,
        project: "chromium" as const,
        isManualOverride: false,
      })
    }

    // Add Beta release
    if (milestone.earliest_beta) {
      result.push({
        id: `chromium-${milestone.mstone}-beta`,
        name: `Chromium ${milestone.mstone} Beta`,
        date: new Date(milestone.earliest_beta),
        type: "beta" as const,
        project: "chromium" as const,
        isManualOverride: false,
      })
    }

    // Add Stable release
    if (milestone.stable_date) {
      result.push({
        id: `chromium-${milestone.mstone}-stable`,
        name: `Chromium ${milestone.mstone} Stable`,
        date: new Date(milestone.stable_date),
        type: "stable" as const,
        project: "chromium" as const,
        isManualOverride: false,
      })
    }

    return result
  })

  console.log(`Parsed ${releases.length} Chromium releases`)

  // Sort releases by date
  releases.sort((a, b) => a.date.getTime() - b.date.getTime())

  return releases
}

// Refresh Chromium data and store in database
export async function refreshChromiumData() {
  try {
    console.log("Starting Chromium data refresh...")

    // Fetch and parse Chromium data
    const milestones = await fetchChromiumReleases()
    const releases = parseChromiumData(milestones)

    if (releases.length === 0) {
      console.warn("No Chromium releases found to refresh")
      return []
    }

    // Only try to store in database if we're not using mock database
    const usingMock = await isUsingMockDatabase()
    if (!usingMock) {
      console.log(`Storing ${releases.length} Chromium releases in database`)

      // Store each release in the database with upsert logic
      const promises = releases.map(async (release) => {
        try {
          // Check if the release already exists
          const existingRelease = await getReleaseById(release.id)

          if (existingRelease) {
            // Update existing release
            await updateRelease(release.id, release)
            console.log(`Updated existing release: ${release.name}`)
          } else {
            // Create new release
            await createRelease(release)
            console.log(`Created new release: ${release.name}`)
          }
        } catch (error) {
          console.error(`Error storing release ${release.id}:`, error)
        }
      })

      await Promise.all(promises)

      // Update the last refreshed timestamp
      await updateApiSettings({
        id: "api-settings",
        lastRefreshed: new Date(),
        chromiumApiUrl: "https://chromiumdash.appspot.com/fetch_milestone_schedule",
        refreshInterval: 24, // hours
      })
    } else {
      console.log("Using mock database - skipping database storage")
    }

    console.log("Chromium data refresh completed successfully")
    return releases
  } catch (error) {
    console.error("Error refreshing Chromium data:", error)
    throw error
  }
}

// Direct function to get Chromium releases for display
export async function getChromiumReleases() {
  try {
    // First try to fetch and parse from the API
    const milestones = await fetchChromiumReleases()
    const releases = parseChromiumData(milestones)

    // Log to help debug
    console.log(`getChromiumReleases: Generated ${releases.length} releases.`)
    if (releases.length > 0) {
      console.log("Sample release:", JSON.stringify(releases[0]))
    }

    return releases
  } catch (error) {
    console.error("Error getting Chromium releases:", error)
    // Return empty array on error
    return []
  }
}

