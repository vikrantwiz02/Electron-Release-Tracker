import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Electron and Chromium Release Tracker",
  description: "Track Electron releases alongside Chromium's schedule",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90",
              card: "bg-background border-border",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "text-foreground border-border",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-background border-border text-foreground",
              formFieldInputShowPasswordButton: "text-foreground",
              formFieldAction: "text-primary",
              footer: "text-muted-foreground",
              identityPreview: "bg-background border-border",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

