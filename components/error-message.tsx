"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  title?: string
  message: string
  retryAction?: () => void
  className?: string
}

export function ErrorMessage({ title = "Connection Error", message, retryAction, className }: ErrorMessageProps) {
  return (
    <div className={cn("border border-destructive/50 rounded-md bg-destructive/10 text-destructive p-4", className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-1 text-sm">{message}</p>
      {retryAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={retryAction}
          className="mt-3 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  )
}

