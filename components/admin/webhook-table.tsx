"use client"

import { useState } from "react"
import { Edit, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SlackWebhook } from "@/lib/db"

interface AdminWebhookTableProps {
  initialWebhooks: SlackWebhook[]
}

export function AdminWebhookTable({ initialWebhooks }: AdminWebhookTableProps) {
  const [webhooks, setWebhooks] = useState<SlackWebhook[]>(initialWebhooks)

  const handleDelete = async (id: string, name: string) => {
    try {
      // Call API to delete the webhook
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete webhook")
      }

      // Update the UI
      setWebhooks(webhooks.filter((webhook) => webhook.id !== id))
    } catch (error) {
      console.error("Error deleting webhook:", error)
      alert("Failed to delete webhook")
    }
  }

  const handleEdit = (id: string) => {
    // Dispatch an event to populate the form with the webhook data
    const webhook = webhooks.find((w) => w.id === id)
    if (webhook) {
      const event = new CustomEvent("edit-webhook", {
        detail: { webhook },
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
            <TableHead>URL</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.map((webhook) => (
            <TableRow key={webhook.id}>
              <TableCell className="font-medium">{webhook.name}</TableCell>
              <TableCell className="font-mono text-xs truncate max-w-[200px]">{webhook.url}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline">
                      {event}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {webhook.isActive ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <Check className="mr-1 h-3 w-3" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <X className="mr-1 h-3 w-3" /> Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(webhook.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(webhook.id, webhook.name)}>
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

