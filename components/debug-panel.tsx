"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Bug, RefreshCw } from "lucide-react"

interface DebugPanelProps {
  initialReleases: any[]
}

export function DebugPanel({ initialReleases }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [releases, setReleases] = useState(initialReleases)
  const [chromiumData, setChromiumData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchChromiumDirectly = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/chromium", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const data = await response.json()
      setChromiumData(data)
      console.log("Direct Chromium API response:", data)
      alert(`Fetched ${data.length} Chromium versions directly from API`)
    } catch (error: any) {
      console.error("Error fetching Chromium directly:", error)
      alert(`Error: ${error?.message || "Unknown error occurred"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReleasesApi = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/releases?project=chromium", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const data = await response.json()
      setReleases(data)
      console.log("Releases API response:", data)
      alert(`Fetched ${data.length} releases from API`)
    } catch (error: any) {
      console.error("Error fetching releases:", error)
      alert(`Error: ${error?.message || "Unknown error occurred"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/refresh", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to refresh data: ${response.statusText}`)
      }

      alert("Data refresh initiated. The page will reload.")
      window.location.reload()
    } catch (error: any) {
      console.error("Error refreshing data:", error)
      alert(`Error: ${error?.message || "Unknown error occurred"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 w-full">
          <Bug className="h-4 w-4" />
          Debug Panel
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Troubleshooting tools for Chromium data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={fetchChromiumDirectly} disabled={isLoading}>
                    Test /api/chromium
                  </Button>
                  <Button size="sm" onClick={fetchReleasesApi} disabled={isLoading}>
                    Test /api/releases
                  </Button>
                  <Button size="sm" variant="default" onClick={refreshData} disabled={isLoading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Data
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Current Release Data ({releases.length} items)</h3>
                <div className="bg-muted p-2 rounded-md max-h-40 overflow-auto text-xs font-mono">
                  {releases.length > 0 ? (
                    <pre>{JSON.stringify(releases.slice(0, 3), null, 2)}</pre>
                  ) : (
                    <p>No release data available</p>
                  )}
                </div>
              </div>

              {chromiumData.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Chromium API Data ({chromiumData.length} versions)</h3>
                  <div className="bg-muted p-2 rounded-md max-h-40 overflow-auto text-xs font-mono">
                    <pre>{JSON.stringify(chromiumData.slice(0, 2), null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <span className="text-xs text-muted-foreground">This panel is for debugging purposes only.</span>
            {isLoading && <span className="text-xs text-blue-500">Loading...</span>}
          </CardFooter>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}

