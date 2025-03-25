import { SignIn } from "@clerk/nextjs"
import { CalendarIcon } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2">
        <CalendarIcon className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Electron Release Tracker</h1>
      </div>
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-background shadow-lg border rounded-lg",
              headerTitle: "text-foreground text-xl font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-background border text-foreground hover:bg-muted",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/"
          afterSignInUrl="/"
        />
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Only authorized Electron maintainers can access admin features.</p>
        <p>Sign in with your GitHub account to continue.</p>
      </div>
    </div>
  )
}

