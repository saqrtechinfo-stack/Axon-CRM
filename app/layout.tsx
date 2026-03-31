import { ClerkProvider, SignInButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server"; // Added currentUser
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser(); // Get the full Clerk user object (for email)

  console.log("CHECK 1: Clerk UserID is:", userId);

  let dbUser = null;

  if (userId) {
    // 1. Try to find the user by their Clerk ID
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { company: true },
    });

    // 2. AUTO-SYNC: If user exists in DB by email but doesn't have a Clerk ID yet
    if (!dbUser && user?.emailAddresses[0]?.emailAddress) {
      const email = user.emailAddresses[0].emailAddress;

      try {
        dbUser = await prisma.user.update({
          where: { email: email },
          data: { clerkId: userId },
          include: { company: true },
        });
        console.log(`AUTO-SYNC SUCCESS: Linked Clerk ID to ${email}`);
      } catch (error) {
        console.log("AUTO-SYNC SKIP: Email not found in database yet.");
      }
    }

    console.log("CHECK 2: Database User found:", dbUser?.name);
    console.log("CHECK 3: Database Company found:", dbUser?.company?.name);
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {!userId ? (
            /* --- LOGGED OUT VIEW --- */
            <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
              <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-sm w-full space-y-6">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                  NEXUS CRM
                </h1>
                {/* FIXED: Single child only, no whitespace or comments inside */}
                <SignInButton mode="modal" forceRedirectUrl="/">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                    Access Workspace
                  </button>
                </SignInButton>
              </div>
            </div>
          ) : (
            /* --- LOGGED IN VIEW --- */
            <div className="h-full relative bg-slate-50 min-h-screen">
              <Sidebar
                user={dbUser}
                companyName={dbUser?.company?.name || "No Company Linked"}
              />
              <main className="lg:pl-72 pt-20 lg:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
              </main>
            </div>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
