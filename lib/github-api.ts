import { createRelease } from "./db"

// Type for GitHub API response
export type GitHubRelease = {
  id: number
  tag_name: string
  name: string
  published_at: string
  prerelease: boolean
  draft: boolean
  body: string
}

// Fetch Electron releases from GitHub API
export async function fetchElectronReleases(): Promise<GitHubRelease[]> {
  try {
    // Use a smaller page size to avoid the 2MB cache limit
    const perPage = 10
    const page = 1

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    }

    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
    }

    const response = await fetch(
      `https://api.github.com/repos/electron/electron/releases?per_page=${perPage}&page=${page}`,
      { headers, cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch Electron releases: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Electron releases:", error)
    throw error
  }
}

// Parse GitHub data and convert to our application format
export function parseElectronData(releases: GitHubRelease[]) {
  if (!releases || !Array.isArray(releases)) {
    console.error("Invalid GitHub releases data:", releases)
    return []
  }

  return releases.map((release) => {
    // Determine release type based on prerelease flag and tag name
    let type: "alpha" | "beta" | "stable" = "stable"

    if (release.prerelease) {
      if (release.tag_name.includes("alpha") || release.tag_name.includes("nightly")) {
        type = "alpha"
      } else if (release.tag_name.includes("beta")) {
        type = "beta"
      }
    }

    return {
      id: `electron-${release.id}`,
      name: release.name || release.tag_name,
      date: new Date(release.published_at),
      type,
      project: "electron" as const,
      isManualOverride: false,
    }
  })
}

// Refresh Electron data and store in database
export async function refreshElectronData() {
  try {
    const githubReleases = await fetchElectronReleases()
    const releases = parseElectronData(githubReleases)

    // Store each release in the database
    const promises = releases.map(async (release) => {
      try {
        await createRelease(release)
      } catch (error) {
        console.error(`Error creating release ${release.id}:`, error)
      }
    })

    await Promise.all(promises)

    return releases
  } catch (error) {
    console.error("Error refreshing Electron data:", error)
    throw error
  }
}

