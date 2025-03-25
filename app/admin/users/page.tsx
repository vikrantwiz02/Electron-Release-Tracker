import { Suspense } from "react"
import { CalendarIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "@/components/admin/user-management"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { UserNav } from "@/components/user-nav"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
  // Check if user is authenticated and authorized
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Check if user is an admin
  if (user.privateMetadata.role !== "admin") {
    redirect("/")
  }

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
              <a href="/admin">Admin Dashboard</a>
            </Button>
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
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground">Manage user access and permissions</p>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>View and manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<TableSkeleton />}>
                  <UserManagement />
                </Suspense>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>GitHub Integration</CardTitle>
                <CardDescription>Automatically assign admin roles to Electron maintainers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Users who sign in with GitHub and are members of the Electron organization can be automatically
                    assigned admin privileges.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Sync GitHub Permissions
                    </Button>
                    <p className="text-sm text-muted-foreground">Last synced: Never</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

