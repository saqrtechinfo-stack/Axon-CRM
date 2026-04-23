import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/account-suspended(.*)", // Don't block the screen itself!
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // 1. If it's a public route, let them pass
  if (isPublicRoute(request)) return NextResponse.next();

  // 2. Protect the route (Clerk Auth)
  if (!userId) await auth.protect();

  // 3. Fetch user and company status from DB
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId as string },
    include: { company: true },
  });

  if (dbUser && dbUser.role !== "SUPER_ADMIN" && dbUser.company) {
    const now = new Date();
    const expiryDate =
      dbUser.company.subscriptionEnd || dbUser.company.trialEndsAt;

    // Check if Status is INACTIVE OR Date has passed
    const isExpired = expiryDate ? now > new Date(expiryDate) : false;
    const isDisabled = dbUser.company.status === "INACTIVE";

    if (isExpired || isDisabled) {
      // Redirect to the custom suspended page
      const url = request.nextUrl.clone();
      url.pathname = "/account-suspended";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
