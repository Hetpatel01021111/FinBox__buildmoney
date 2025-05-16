import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Create Arcjet middleware with fallback for missing key
const aj = process.env.ARCJET_KEY 
  ? arcjet({
      key: process.env.ARCJET_KEY,
      // characteristics: ["userId"], // Track based on Clerk userId
      rules: [
        // Shield protection for content and security
        shield({
          mode: "LIVE",
        }),
        detectBot({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
          allow: [
            "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
            "GO_HTTP", // For Inngest
            // See the full list at https://arcjet.com/bot-list
          ],
        }),
      ],
    })
  : (req) => NextResponse.next(); // Bypass if no key is found

// Create base Clerk middleware with error handling
const clerk = clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();

    if (!userId && isProtectedRoute(req)) {
      const { redirectToSignIn } = await auth();
      return redirectToSignIn();
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Clerk middleware error:', error);
    // Fall back to allowing the request through
    return NextResponse.next();
  }
});

// Chain middlewares - ArcJet runs first, then Clerk
export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};