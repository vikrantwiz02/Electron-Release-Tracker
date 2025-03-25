import { MongoClient, type Db, type Collection, type Document, type ObjectId } from "mongodb"

// Types for our database models
export type Release = {
  _id?: string | ObjectId
  id: string
  name: string
  date: Date
  type: "alpha" | "beta" | "stable"
  project: "electron" | "chromium"
  isManualOverride: boolean
  createdAt: Date
  updatedAt: Date
}

export type SlackWebhook = {
  _id?: string | ObjectId
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ApiSettings = {
  _id?: string | ObjectId
  id: string
  chromiumApiUrl: string
  refreshInterval: number
  lastRefreshed: Date
  createdAt: Date
  updatedAt: Date
}

// MongoDB connection
let client: MongoClient | null = null
let db: Db | null = null

// Collections
let releases: Collection<Document> | null = null
let webhooks: Collection<Document> | null = null
let settings: Collection<Document> | null = null

// Flag to track if we're using mock database
let usingMockDatabase = false

// Initialize the MongoDB connection with retry logic
export async function connectToDatabase() {
  // If we already have a connection or mock database setup, return it
  if ((client && db && releases && webhooks && settings) || usingMockDatabase) {
    return { client, db, releases, webhooks, settings, usingMockDatabase }
  }

  // If no MongoDB URI is provided, use mock database
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI environment variable is not set, using mock database")
    usingMockDatabase = true
    return getMockDatabase()
  }

  try {
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Reduce timeout for faster fallback to mock data
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 5000, // Give up initial connection after 5 seconds
      retryWrites: true,
      retryReads: true,
    }

    client = new MongoClient(process.env.MONGODB_URI, options)
    await client.connect()
    console.log("Connected to MongoDB")

    db = client.db(process.env.MONGODB_DB || "electron-tracker")

    // Initialize collections
    releases = db.collection("releases")
    webhooks = db.collection("webhooks")
    settings = db.collection("settings")

    // Create indexes
    await releases.createIndex({ project: 1, type: 1 })
    await releases.createIndex({ date: 1 })

    return { client, db, releases, webhooks, settings, usingMockDatabase: false }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    // Provide mock data for development if DB connection fails
    usingMockDatabase = true
    return getMockDatabase()
  }
}

// Helper function to serialize MongoDB documents to plain objects
export function serializeDocument<T>(doc: T): T {
  if (!doc) return doc

  // Convert to plain object if it's a MongoDB document
  const plainDoc = JSON.parse(JSON.stringify(doc))
  return plainDoc
}

// Helper function to serialize an array of MongoDB documents
export function serializeDocuments<T>(docs: T[]): T[] {
  if (!docs) return []
  return docs.map((doc) => serializeDocument(doc))
}

// Mock database for development/fallback
function getMockDatabase() {
  console.log("Using mock database")
  usingMockDatabase = true

  // Create in-memory collections
  const mockReleases: Release[] = [
    {
      id: "electron-1",
      name: "Electron 28.0.0",
      date: new Date("2023-12-05"),
      type: "stable",
      project: "electron",
      isManualOverride: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "chromium-120-stable",
      name: "Chromium 120 Stable",
      date: new Date("2023-12-05"),
      type: "stable",
      project: "chromium",
      isManualOverride: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockWebhooks: SlackWebhook[] = []
  const mockSettings: ApiSettings = {
    id: "api-settings",
    chromiumApiUrl: "https://chromiumdash.appspot.com/fetch_milestone_schedule",
    refreshInterval: 24,
    lastRefreshed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Mock collection methods
  const mockCollection = <T extends Document>(initialData: T[]) => {
    const data = [...initialData]
    return {
      find: () => ({
        sort: () => ({
          toArray: async () => data,
        }),
      }),
      findOne: async (query: any) => {
        if (query.id) {
          return data.find((item) => item.id === query.id) || null
        }
        return data[0] || null
      },
      insertOne: async (doc: T) => {
        data.push(doc)
        return { insertedId: "mock_id" }
      },
      updateOne: async (query: any, update: any) => {
        const index = data.findIndex((item) => item.id === query.id)
        if (index !== -1) {
          data[index] = { ...data[index], ...update.$set }
        }
        return { modifiedCount: 1 }
      },
      deleteOne: async (query: any) => {
        const index = data.findIndex((item) => item.id === query.id)
        if (index !== -1) {
          data.splice(index, 1)
        }
        return { deletedCount: 1 }
      },
      createIndex: async () => "mock_index",
    } as unknown as Collection<Document>
  }

  return {
    client: {} as MongoClient,
    db: {} as Db,
    releases: mockCollection(mockReleases as Document[]),
    webhooks: mockCollection(mockWebhooks as Document[]),
    settings: mockCollection([mockSettings] as Document[]),
    usingMockDatabase: true,
  }
}

// Helper functions for releases
export async function getAllReleases(): Promise<Release[]> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const result = await releases.find().sort({ date: 1 }).toArray()
    return serializeDocuments(result as unknown as Release[])
  } catch (error) {
    console.error("Error getting all releases:", error)
    return []
  }
}

export async function getReleasesByProject(projectName: string): Promise<Release[]> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const filter = { project: projectName }
    const result = await releases.find(filter).sort({ date: 1 }).toArray()
    return serializeDocuments(result as unknown as Release[])
  } catch (error) {
    console.error(`Error getting releases for project ${projectName}:`, error)
    return []
  }
}

export async function getReleasesByType(typeName: string): Promise<Release[]> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const filter = { type: typeName }
    const result = await releases.find(filter).sort({ date: 1 }).toArray()
    return serializeDocuments(result as unknown as Release[])
  } catch (error) {
    console.error(`Error getting releases of type ${typeName}:`, error)
    return []
  }
}

export async function getReleaseById(id: string): Promise<Release | null> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const result = await releases.findOne({ id })
    return serializeDocument(result as unknown as Release | null)
  } catch (error) {
    console.error(`Error getting release with id ${id}:`, error)
    return null
  }
}

export async function createRelease(release: Omit<Release, "_id" | "createdAt" | "updatedAt">): Promise<Release> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const now = new Date()
    const newRelease: Release = {
      ...release,
      createdAt: now,
      updatedAt: now,
    }

    // If using mock database, check if release already exists to avoid duplicates
    if (usingMockDatabase) {
      const existing = await getReleaseById(release.id)
      if (existing) {
        return updateRelease(release.id, release) as Promise<Release>
      }
    }

    await releases.insertOne(newRelease as unknown as Document)
    return serializeDocument(newRelease)
  } catch (error) {
    console.error("Error creating release:", error)
    throw error
  }
}

export async function updateRelease(id: string, update: Partial<Release>): Promise<Release | null> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const now = new Date()
    const updatedRelease = {
      ...update,
      updatedAt: now,
    }

    // First update the document
    await releases.updateOne({ id }, { $set: updatedRelease })

    // Then fetch the updated document
    const result = await releases.findOne({ id })
    return serializeDocument(result as unknown as Release)
  } catch (error) {
    console.error(`Error updating release with id ${id}:`, error)
    return null
  }
}

export async function deleteRelease(id: string): Promise<boolean> {
  try {
    const { releases, usingMockDatabase } = await connectToDatabase()
    if (!releases) throw new Error("Releases collection not initialized")

    const { deletedCount } = await releases.deleteOne({ id })
    return deletedCount === 1
  } catch (error) {
    console.error(`Error deleting release with id ${id}:`, error)
    return false
  }
}

// Helper functions for webhooks
export async function getAllWebhooks(): Promise<SlackWebhook[]> {
  try {
    const { webhooks, usingMockDatabase } = await connectToDatabase()
    if (!webhooks) throw new Error("Webhooks collection not initialized")

    const result = await webhooks.find().toArray()
    return serializeDocuments(result as unknown as SlackWebhook[])
  } catch (error) {
    console.error("Error getting all webhooks:", error)
    return []
  }
}

export async function getActiveWebhooks(): Promise<SlackWebhook[]> {
  try {
    const { webhooks, usingMockDatabase } = await connectToDatabase()
    if (!webhooks) throw new Error("Webhooks collection not initialized")

    const result = await webhooks.find({ isActive: true }).toArray()
    return serializeDocuments(result as unknown as SlackWebhook[])
  } catch (error) {
    console.error("Error getting active webhooks:", error)
    return []
  }
}

// Helper functions for settings
export async function getApiSettings(): Promise<ApiSettings | null> {
  try {
    const { settings, usingMockDatabase } = await connectToDatabase()
    if (!settings) throw new Error("Settings collection not initialized")

    const result = await settings.findOne({}) // Assuming we only have one settings document
    return serializeDocument(result as unknown as ApiSettings | null)
  } catch (error) {
    console.error("Error getting API settings:", error)
    return null
  }
}

export async function updateApiSettings(update: Partial<ApiSettings>): Promise<ApiSettings | null> {
  try {
    const { settings, usingMockDatabase } = await connectToDatabase()
    if (!settings) throw new Error("Settings collection not initialized")

    const now = new Date()
    const updatedSettings = {
      ...update,
      updatedAt: now,
    }

    // First update the document
    await settings.updateOne({ id: "api-settings" }, { $set: updatedSettings }, { upsert: true })

    // Then fetch the updated document
    const result = await settings.findOne({ id: "api-settings" })
    return serializeDocument(result as unknown as ApiSettings)
  } catch (error) {
    console.error("Error updating API settings:", error)
    return null
  }
}

// Check if we're using mock database
export async function isUsingMockDatabase(): Promise<boolean> {
  await connectToDatabase()
  return usingMockDatabase
}

