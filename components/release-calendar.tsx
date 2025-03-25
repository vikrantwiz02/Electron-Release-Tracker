"use client"

import { useState, useEffect } from "react"
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ErrorMessage } from "@/components/error-message"
import type { Release } from "@/lib/db"

interface ReleaseCalendarProps {
  initialReleases: Release[]
}

export function ReleaseCalendar({ initialReleases }: ReleaseCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [releases, setReleases] = useState<Release[]>(initialReleases)
  const [project, setProject] = useState<string | null>(null)
  const [releaseType, setReleaseType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initial data load
  useEffect(() => {
    if (initialReleases.length === 0) {
      console.log("No initial releases, fetching fresh data")
      fetchFilteredReleases("all", "all")
    } else {
      console.log(`Loaded ${initialReleases.length} initial releases`)
    }
  }, [initialReleases])

  // Listen for filter changes from the ReleaseFilters component
  useEffect(() => {
    const handleFilterChange = (event: CustomEvent<{ project: string; type: string }>) => {
      const { project, type } = event.detail
      console.log(`Filter changed: project=${project}, type=${type}`)

      setProject(project === "all" ? null : project)
      setReleaseType(type === "all" ? null : type)

      // Fetch filtered releases
      fetchFilteredReleases(project, type)
    }

    window.addEventListener("filter-change", handleFilterChange as EventListener)
    return () => {
      window.removeEventListener("filter-change", handleFilterChange as EventListener)
    }
  }, [])

  // Fetch releases with filters applied
  const fetchFilteredReleases = async (project: string, type: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const params = new URLSearchParams()
      if (project && project !== "all") params.append("project", project)
      if (type && type !== "all") params.append("type", type)

      console.log(`Fetching releases with filters: ${params.toString() || "none"}`)

      const response = await fetch(`/api/releases?${params.toString()}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch releases: ${response.statusText}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        console.log(`Received ${data.length} releases from API`)
        setReleases(data)
        // Debug log to check release data format
        console.log("Release data sample:", data.slice(0, 2))
      } else {
        console.error("Unexpected response format:", data)
        setError("Received invalid data format from the server")
        setReleases([])
      }
    } catch (error) {
      console.error("Error fetching filtered releases:", error)
      setError("Unable to fetch release data. This could be due to a database connection issue.")
    } finally {
      setIsLoading(false)
    }
  }

  const retryFetch = () => {
    fetchFilteredReleases(project || "all", releaseType || "all")
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getReleasesForDay = (day: Date) => {
    return releases.filter((release) => {
      // Ensure we're working with Date objects
      const releaseDate = release.date instanceof Date ? release.date : new Date(release.date)

      // Compare dates by converting to simple date strings (YYYY-MM-DD)
      const dayStr = format(day, "yyyy-MM-dd")
      const releaseDateStr = format(releaseDate, "yyyy-MM-dd")

      return dayStr === releaseDateStr
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alpha":
        return "bg-blue-500 hover:bg-blue-600"
      case "beta":
        return "bg-amber-500 hover:bg-amber-600"
      case "stable":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getProjectIcon = (project: string) => {
    return project === "electron" ? "⚛️" : "🌐"
  }

  const rows = []
  let days = []
  let day = startDate

  // Create header row with day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "d")
      const releases = getReleasesForDay(day)
      const isCurrentMonth = isSameMonth(day, monthStart)

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] p-2 border ${
            isCurrentMonth ? "bg-background" : "bg-muted/50 text-muted-foreground"
          } ${isSameDay(day, new Date()) ? "border-primary" : "border-border"}`}
        >
          <div className="font-medium text-sm">{formattedDate}</div>
          <div className="mt-1 space-y-1">
            {releases.map((release) => (
              <TooltipProvider key={release.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={`text-xs cursor-pointer text-white ${getTypeColor(release.type)}`}>
                      {getProjectIcon(release.project)} {release.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      <strong>{release.name}</strong>
                    </p>
                    <p>Date: {format(new Date(release.date), "MMMM d, yyyy")}</p>
                    <p>Type: {release.type.charAt(0).toUpperCase() + release.type.slice(1)}</p>
                    {release.isManualOverride && (
                      <p>
                        <em>Manual Override</em>
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>,
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7">
        {days}
      </div>,
    )
    days = []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} retryAction={retryFetch} />}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading releases...</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 border-b">
              {dayNames.map((day) => (
                <div key={day} className="py-2 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="divide-y">{rows}</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Alpha</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">Beta</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Stable</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">⚛️ Electron</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">🌐 Chromium</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={retryFetch} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

