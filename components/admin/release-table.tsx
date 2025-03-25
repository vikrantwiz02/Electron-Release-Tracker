"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Release } from "@/lib/db"

interface AdminReleaseTableProps {
  initialReleases: Release[]
}

export function AdminReleaseTable({ initialReleases }: AdminReleaseTableProps) {
  const [releases, setReleases] = useState<Release[]>(initialReleases)

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

  const handleDelete = async (id: string, name: string) => {
    try {
      // Call API to delete the release
      const response = await fetch(`/api/releases/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete release")
      }

      // Update the UI
      setReleases(releases.filter((release) => release.id !== id))

      // Send notification to Slack
      await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Release "${name}" was deleted by an admin.`,
          event: "delete",
        }),
      })
    } catch (error) {
      console.error("Error deleting release:", error)
      alert("Failed to delete release")
    }
  }

  const handleEdit = (id: string) => {
    // Dispatch an event to populate the form with the release data
    const release = releases.find((r) => r.id === id)
    if (release) {
      const event = new CustomEvent("edit-release", {
        detail: { release },
      })
      window.dispatchEvent(event)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {releases.map((release) => (
            <TableRow key={release.id}>
              <TableCell className="font-medium">{release.name}</TableCell>
              <TableCell>{release.project === "electron" ? "⚛️ Electron" : "🌐 Chromium"}</TableCell>
              <TableCell>
                <Badge className={`text-white ${getTypeColor(release.type)}`}>
                  {release.type.charAt(0).toUpperCase() + release.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(release.date), "MMMM d, yyyy")}</TableCell>
              <TableCell>
                {release.isManualOverride ? (
                  <Badge variant="outline">Manual Override</Badge>
                ) : (
                  <Badge variant="outline">API</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(release.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(release.id, release.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

