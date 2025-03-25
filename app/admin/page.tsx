import { Suspense } from "react"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminReleaseForm } from "@/components/admin/release-form"
import { AdminReleaseTable } from "@/components/admin/release-table"
import { AdminWebhookForm } from "@/components/admin/webhook-form"
import { AdminWebhookTable } from "@/components/admin/webhook-table"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { UserNav } from "@/components/user-nav"
import { getAllReleases, getAllWebhooks } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { isUserAdmin } from "@/lib/auth-utils"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  // Check if user is authenticated and authorized
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Check if user is an admin
  const isAdmin = await isUserAdmin(userId)
  if (!isAdmin) {
    redirect("/")
  }

  // Fetch data for the admin dashboard
  const releases = await getAllReleases()
  const webhooks = await getAllWebhooks()

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
              <a href="/">View Calendar</a>
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
                <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">Manage release dates and manual overrides</p>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Release
              </Button>
            </div>
            <Tabs defaultValue="releases" className="space-y-4">
              <TabsList>
                <TabsTrigger value="releases">Releases</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="releases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Releases</CardTitle>
                    <CardDescription>View and edit release dates for Electron and Chromium</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<TableSkeleton />}>
                      <AdminReleaseTable initialReleases={releases} />
                    </Suspense>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Add/Edit Release</CardTitle>
                    <CardDescription>Create a new release or edit an existing one</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminReleaseForm />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="webhooks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Slack Webhooks</CardTitle>
                    <CardDescription>Configure Slack notifications for release updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<TableSkeleton />}>
                      <AdminWebhookTable initialWebhooks={webhooks} />
                    </Suspense>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Add/Edit Webhook</CardTitle>
                    <CardDescription>Create a new webhook or edit an existing one</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminWebhookForm />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>API Settings</CardTitle>
                    <CardDescription>Configure API connections and refresh intervals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <h3 className="text-lg font-medium">Chromium API</h3>
                        <p className="text-sm text-muted-foreground">
                          The application fetches Chromium release data from the official Chromium Dashboard API.
                        </p>
                        <p className="text-sm">
                          API Endpoint: <code>https://chromiumdash.appspot.com/fetch_milestone_schedule</code>
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <h3 className="text-lg font-medium">GitHub API</h3>
                        <p className="text-sm text-muted-foreground">
                          The application fetches Electron release data from the GitHub API.
                        </p>
                        <p className="text-sm">
                          API Endpoint: <code>https://api.github.com/repos/electron/electron/releases</code>
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <h3 className="text-lg font-medium">Refresh Schedule</h3>
                        <p className="text-sm text-muted-foreground">
                          Data is automatically refreshed every 24 hours via a scheduled cron job.
                        </p>
                        <Button variant="outline" asChild>
                          <a href="/api/refresh">Refresh Data Now</a>
                        </Button>
                      </div>
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

