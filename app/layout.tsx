// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from "nextjs-toploader";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthLayout } from "@/components/AuthLayout";
import { prisma } from "@/lib/prisma";
import { Toaster } from "sonner";
import { Prisma } from "@prisma/client";
import { Suspense } from "react";
import Loading from "./loading";

const inter = Inter({ subsets: ["latin"] });

// FORCE NEXT.JS TO NOT CACHE THIS LAYOUT
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  let dbUser = null;

  if (userId) {
    // 1. Try finding by Clerk ID first
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        company: true,
        department: true,
        designation: true,
      },
    });

    // 2. AUTO-SYNC BRIDGE: Fallback to Email if ID isn't linked
    if (!dbUser && clerkUser?.emailAddresses[0]?.emailAddress) {
      // TRICK: Always use lowercase for email comparison
      const email = clerkUser.emailAddresses[0].emailAddress
        .toLowerCase()
        .trim();

      try {
        dbUser = await prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            // Use updateMany or findFirst if email isn't unique,
            // but assuming email is unique in your User model:
            const updatedUser = await tx.user.update({
              where: { email: email },
              data: {
                clerkId: userId,
                status: "ACTIVE",
              },
              include: {
                company: true,
                department: true,
                designation: true,
              },
            });

            await tx.companyInvitation.updateMany({
              where: {
                email: email,
                companyId: updatedUser.companyId,
                status: "PENDING",
              },
              data: { status: "ACCEPTED" },
            });

            return updatedUser;
          },
        );
        console.log(`✅ AUTO-SYNC SUCCESS: Linked ${email}`);
      } catch (error) {
        console.log("⚠️ AUTO-SYNC SKIP: No pre-registered user found.");
      }
    }
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}
        >
          <NextTopLoader
            color="#FF9E7D"
            showSpinner={false}
            shadow="0 0 10px #FF9E7D,0 0 5px #FF9E7D"
          />
          <AuthLayout dbUser={dbUser}>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </AuthLayout>
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
