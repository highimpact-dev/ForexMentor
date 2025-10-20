import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/server",
  "/admin(.*)"
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isPublicRoute = createRouteMatcher([
  '/(auth)(.*)',
  '/'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is not authenticated and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Admin route protection - for now, any authenticated user can access
  // TODO: Add role-based access control when Clerk roles are configured
  if (isAdminRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (userId && req.nextUrl.pathname.startsWith('/sign-in')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (userId && req.nextUrl.pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is not authenticated and on root page, allow access
  if (!userId && req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // Protect protected routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
