import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Admin dashboard — all routes require authentication.
 * clerkMiddleware with no custom logic protects all routes by default
 * when used with Clerk's auth() checks in server components.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
