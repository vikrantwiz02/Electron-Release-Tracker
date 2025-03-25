import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Define admin routes that require special permissions
const ADMIN_ROUTES = ["/admin", "/api/admin"];

// This function will run before Clerk's authMiddleware
function beforeAuthMiddleware(request: Request) {
  // You can add custom logic here that runs before auth checks
  return NextResponse.next();
}

// This function will run after Clerk's authMiddleware
function afterAuthMiddleware(auth: { userId?: string | null }, request: Request) {
  const url = new URL(request.url);
  // If the user is trying to access an admin route
  if (isAdminRoute(url.pathname)) {
    // If the user isn't signed in, redirect them to the sign-in page
    if (!auth.userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', url.pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // For checking admin status, we'll need to do this in the route handler
    // since we can't access the Clerk API directly in middleware
    // We'll redirect non-admins from the page component
  }
  
  return NextResponse.next();
}

// Helper function to check if a route is an admin route
function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

export default authMiddleware({
  beforeAuth: beforeAuthMiddleware,
  afterAuth: afterAuthMiddleware,
  publicRoutes: ["/", "/sign-in", "/sign-up"],
});

export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
    "/api/admin/:path*",
    
    // Match auth routes
    "/sign-in/:path*",
    "/sign-up/:path*",
    
    // Skip all static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
