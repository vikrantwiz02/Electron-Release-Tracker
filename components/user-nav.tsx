"use client"

import { useState, useEffect } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Settings, LogOut, User } from "lucide-react"

export function UserNav() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is an admin
  useEffect(() => {
    if (user && user.publicMetadata && user.publicMetadata.role === "admin") {
      setIsAdmin(true)
    }
  }, [user])

  if (!isLoaded) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
  }

  if (!isSignedIn) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/sign-in" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Sign In
        </a>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/" className="flex items-center cursor-pointer">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </a>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <a href="/admin" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

