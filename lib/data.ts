import { getAllReleases, getReleasesByProject, getReleasesByType, isUsingMockDatabase } from "./db"
import { getChromiumReleases } from "./chromium-api"
import type { Release } from "./db"

// Fetch releases with optional filtering and error handling
export async function fetchReleases(
  project?: string,
  type?: string,
  options?: { cache?: RequestCache },
): Promise<Release[]> {
  try {
    console.log(`Fetching releases with project=${project}, type=${type}`)

    // Check if we're using mock database
    const usingMock = await isUsingMockDatabase()

    // Special case for Chromium - always fetch directly from API
    if (project === "chromium") {
      console.log("Fetching Chromium releases directly from API")
      const chromiumReleases = await getChromiumReleases()

      // Transform releases to include required properties
      const transformedReleases = chromiumReleases.map(release => ({
        ...release,
        createdAt: release.date,
        updatedAt: release.date
      }))

      // Apply type filter if needed
      const filteredReleases = type ? transformedReleases.filter((release) => release.type === type) : transformedReleases

      console.log(`Got ${filteredReleases.length} Chromium releases from API`)
      return filteredReleases
    }

    // If using mock database and not specifically requesting Electron,
    // fetch Chromium directly from API to ensure we have the latest data
    if (usingMock && !project) {
      console.log("Using mock database - fetching mixed data")

      // Get Electron releases from mock DB
      const dbReleases = await getAllReleases()
      const electronReleases = dbReleases.filter((r) => r.project === "electron")

      // Get Chromium releases directly from API
      const chromiumReleases = await getChromiumReleases()
      const transformedChromiumReleases = chromiumReleases.map(release => ({
        ...release,
        createdAt: release.date,
        updatedAt: release.date
      }))

      // Combine both sets
      const combinedReleases = [...electronReleases, ...transformedChromiumReleases]

      // Apply type filter if needed
      const filteredReleases = type ? combinedReleases.filter((release) => release.type === type) : combinedReleases

      console.log(`Combined ${electronReleases.length} Electron and ${chromiumReleases.length} Chromium releases`)
      return filteredReleases
    }

    // Standard database fetching for other cases
    let releases: Release[]

    if (project && type) {
      // Filter by both project and type
      const projectReleases = await getReleasesByProject(project)
      releases = projectReleases.filter((release) => release.type === type)
    } else if (project) {
      // Filter by project only
      releases = await getReleasesByProject(project)
    } else if (type) {
      // Filter by type only
      releases = await getReleasesByType(type)
    } else {
      // No filters, get all releases
      releases = await getAllReleases()
    }

    console.log(`Fetched ${releases.length} releases from database`)
    return releases
  } catch (error) {
    console.error("Error fetching releases:", error)
    // Return empty array instead of throwing to prevent UI errors
    return []
  }
}

