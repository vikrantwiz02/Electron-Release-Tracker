// This file would define the MongoDB models for our application

export type Release = {
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
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ApiSettings = {
  id: string
  chromiumApiUrl: string
  refreshInterval: number
  lastRefreshed: Date
  createdAt: Date
  updatedAt: Date
}

// In a real app, we would use a MongoDB client like Mongoose
// to define and interact with these models

