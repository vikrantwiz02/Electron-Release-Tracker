import { clerkClient } from "@clerk/nextjs"

// Function to set a user as an admin
export async function setUserAsAdmin(userId: string) {
  try {
    await clerkClient.users.updateUser(userId, {
      privateMetadata: { role: "admin" },
    })
    return true
  } catch (error) {
    console.error("Error setting user as admin:", error)
    return false
  }
}

// Function to check if a user is an admin
export async function isUserAdmin(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)
    return user.privateMetadata.role === "admin"
  } catch (error) {
    console.error("Error checking if user is admin:", error)
    return false
  }
}

// Function to get all admin users
export async function getAdminUsers() {
  try {
    const users = await clerkClient.users.getUserList({
      limit: 100,
    })

    return users.filter((user) => user.privateMetadata.role === "admin")
  } catch (error) {
    console.error("Error getting admin users:", error)
    return []
  }
}

// Function to get GitHub username from Clerk user
export async function getGitHubUsername(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)

    // Find GitHub OAuth account
    const githubAccount = user.externalAccounts.find((account) => account.provider === "github")

    return githubAccount?.username || null
  } catch (error) {
    console.error("Error getting GitHub username:", error)
    return null
  }
}

// Function to check if user is an Electron maintainer on GitHub
export async function isElectronMaintainer(userId: string) {
  try {
    const githubUsername = await getGitHubUsername(userId)

    if (!githubUsername) return false

    // Check if the user is a member of the Electron organization
    // This requires a GitHub token with the right permissions
    const response = await fetch(`https://api.github.com/orgs/electron/members/${githubUsername}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    // Status 204 means the user is a member
    return response.status === 204
  } catch (error) {
    console.error("Error checking if user is an Electron maintainer:", error)
    return false
  }
}

