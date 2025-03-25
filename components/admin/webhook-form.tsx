"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  events: z.array(z.string()).min(1, {
    message: "Please select at least one event.",
  }),
  isActive: z.boolean().default(true),
})

const eventTypes = [
  { id: "create", label: "Release Created" },
  { id: "update", label: "Release Updated" },
  { id: "delete", label: "Release Deleted" },
  { id: "refresh", label: "Data Refreshed" },
]

export function AdminWebhookForm() {
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      events: ["create", "update", "delete"],
      isActive: true,
    },
  })

  // Listen for edit events from the WebhookTable
  useEffect(() => {
    const handleEditWebhook = (event: CustomEvent) => {
      const { webhook } = event.detail

      form.reset({
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
      })

      setIsEditing(true)
    }

    window.addEventListener("edit-webhook", handleEditWebhook as EventListener)
    return () => {
      window.removeEventListener("edit-webhook", handleEditWebhook as EventListener)
    }
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const method = isEditing ? "PUT" : "POST"
      const endpoint = isEditing ? `/api/webhooks/${values.id}` : "/api/webhooks"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to save webhook")
      }

      // Reset the form
      form.reset()
      setIsEditing(false)

      // Refresh the page to show the updated data
      window.location.reload()
    } catch (error) {
      console.error("Error saving webhook:", error)
      alert("Failed to save webhook")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Electron Team Slack" {...field} />
                </FormControl>
                <FormDescription>A descriptive name for this webhook</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                </FormControl>
                <FormDescription>The Slack webhook URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="events"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Events</FormLabel>
                <FormDescription>Select which events should trigger this webhook</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {eventTypes.map((event) => (
                  <FormField
                    key={event.id}
                    control={form.control}
                    name="events"
                    render={({ field }) => {
                      return (
                        <FormItem key={event.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(event.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, event.id])
                                  : field.onChange(field.value?.filter((value) => value !== event.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{event.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>Uncheck to temporarily disable this webhook</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">{isEditing ? "Update Webhook" : "Save Webhook"}</Button>
      </form>
    </Form>
  )
}

