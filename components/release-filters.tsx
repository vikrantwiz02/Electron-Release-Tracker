"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const projectTypes = [
  { label: "All Projects", value: "all" },
  { label: "Electron", value: "electron" },
  { label: "Chromium", value: "chromium" },
]

const releaseTypes = [
  { label: "All Types", value: "all" },
  { label: "Alpha", value: "alpha" },
  { label: "Beta", value: "beta" },
  { label: "Stable", value: "stable" },
]

export function ReleaseFilters() {
  const [project, setProject] = useState("all")
  const [releaseType, setReleaseType] = useState("all")
  const [projectOpen, setProjectOpen] = useState(false)
  const [releaseTypeOpen, setReleaseTypeOpen] = useState(false)

  // Dispatch a custom event when filters change
  const handleFilterChange = (newProject: string, newType: string) => {
    const event = new CustomEvent("filter-change", {
      detail: { project: newProject, type: newType },
    })
    window.dispatchEvent(event)
  }

  const handleProjectChange = (value: string) => {
    setProject(value)
    setProjectOpen(false)
    handleFilterChange(value, releaseType)
  }

  const handleTypeChange = (value: string) => {
    setReleaseType(value)
    setReleaseTypeOpen(false)
    handleFilterChange(project, value)
  }

  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
      <div className="grid gap-2">
        <Popover open={projectOpen} onOpenChange={setProjectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={projectOpen}
              className="w-full justify-between sm:w-[200px]"
            >
              {project ? projectTypes.find((item) => item.value === project)?.label : "Select project..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 sm:w-[200px]">
            <Command>
              <CommandInput placeholder="Search project..." />
              <CommandList>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandGroup>
                  {projectTypes.map((item) => (
                    <CommandItem key={item.value} value={item.value} onSelect={handleProjectChange}>
                      <Check className={cn("mr-2 h-4 w-4", project === item.value ? "opacity-100" : "opacity-0")} />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Popover open={releaseTypeOpen} onOpenChange={setReleaseTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={releaseTypeOpen}
              className="w-full justify-between sm:w-[200px]"
            >
              {releaseType ? releaseTypes.find((item) => item.value === releaseType)?.label : "Select release type..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 sm:w-[200px]">
            <Command>
              <CommandInput placeholder="Search release type..." />
              <CommandList>
                <CommandEmpty>No release type found.</CommandEmpty>
                <CommandGroup>
                  {releaseTypes.map((item) => (
                    <CommandItem key={item.value} value={item.value} onSelect={handleTypeChange}>
                      <Check className={cn("mr-2 h-4 w-4", releaseType === item.value ? "opacity-100" : "opacity-0")} />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

