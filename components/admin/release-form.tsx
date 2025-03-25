"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  project: z.string({
    required_error: "Please select a project.",
  }),
  type: z.string({
    required_error: "Please select a release type.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  isManualOverride: z.boolean().default(true),
})

export function AdminReleaseForm() {
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isManualOverride: true,
    },
  })

  // Listen for edit events from the ReleaseTable
  useEffect(() => {
    const handleEditRelease = (event: CustomEvent) => {
      const { release } = event.detail

      form.reset({
        id: release.id,
        name: release.name,
        project: release.project,
        type: release.type,
        date: new Date(release.date),
        isManualOverride: true, // Always mark as manual override when editing
      })

      setIsEditing(true)
    }

    window.addEventListener("edit-release", handleEditRelease as EventListener)
    return () => {
      window.removeEventListener("edit-release", handleEditRelease as EventListener)
    }
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const method = isEditing ? "PUT" : "POST"
      const endpoint = isEditing ? `/api/releases/${values.id}` : "/api/releases"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to save release")
      }

      // Send notification to Slack
      await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Release "${values.name}" was ${isEditing ? "updated" : "created"} by an admin.`,
          event: isEditing ? "update" : "create",
        }),
      })

      // Reset the form
      form.reset()
      setIsEditing(false)

      // Refresh the page to show the updated data
      window.location.reload()
    } catch (error) {
      console.error("Error saving release:", error)
      alert("Failed to save release")
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
                <FormLabel>Release Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Electron 28.0.0" {...field} />
                </FormControl>
                <FormDescription>The name of the release version</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="electron">Electron</SelectItem>
                    <SelectItem value="chromium">Chromium</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The project this release belongs to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a release type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alpha">Alpha</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The type of release</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Release Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>The scheduled date for this release</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">{isEditing ? "Update Release" : "Save Release"}</Button>
      </form>
    </Form>
  )
}

