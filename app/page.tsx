import { Suspense } from "react"
import { CalendarIcon, FilterIcon, RefreshCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReleaseCalendar } from "@/components/release-calendar"
import { ReleaseFilters } from "@/components/release-filters"
import { CalendarSkeleton } from "@/components/skeletons/calendar-skeleton"
import { UserNav } from "@/components/user-nav"
import { DebugPanel } from "@/components/debug-panel"
import { fetchReleases } from "@/lib/data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function DashboardPage() {
  // Fetch initial data server-side with error handling and no-cache option
  const releases = await fetchReleases(undefined, undefined, { cache: "no-store" }).catch(() => [])
  const hasReleases = releases.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">Electron Release Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/refresh" className="flex items-center">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Data
              </a>
            </Button>
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Release Schedule</h2>
                <p className="text-muted-foreground">Track Electron releases alongside Chromium's schedule</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {!hasReleases && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  Unable to fetch release data. This could be due to a database connection issue.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/" className="flex items-center">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Retry
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="calendar" className="space-y-4">
              <TabsList>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              </TabsList>
              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Release Calendar</CardTitle>
                    <CardDescription>View upcoming Electron and Chromium releases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReleaseFilters />
                    <Suspense fallback={<CalendarSkeleton />}>
                      <ReleaseCalendar initialReleases={releases} />
                    </Suspense>
                  </CardContent>
                  {!hasReleases && (
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">
                        No release data available. Using mock data or showing empty state.
                      </p>
                    </CardFooter>
                  )}
                </Card>

                {/* Debug Panel - only visible in development */}
                <DebugPanel initialReleases={releases} />
              </TabsContent>
              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Release Timeline</CardTitle>
                    <CardDescription>View releases in a chronological timeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Timeline view coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

