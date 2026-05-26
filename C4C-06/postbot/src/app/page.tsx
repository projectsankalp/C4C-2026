import PostComposer from "@/components/PostComposer";
import Sidebar from "@/components/Sidebar";
import { CalendarDays } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
  });
  const linkedProviders = accounts.map(a => a.provider);
  if (!linkedProviders.includes("linkedin")) linkedProviders.push("linkedin");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="pr-orb pr-orb-amber" style={{ width: 600, height: 600, top: -100, right: -150 }} />
        <div className="pr-orb pr-orb-blue" style={{ width: 450, height: 450, bottom: -100, left: -100 }} />
        <div className="pr-orb pr-orb-warm" style={{ width: 300, height: 300, top: "40%", left: "45%" }} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-8 py-5 sticky top-0 z-20"
          style={{
            background: "rgba(10,10,15,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
              {greeting}, <span style={{ color: "#F0F0F5" }}>{userName}</span>
            </p>
            <h1
              className="text-xl font-semibold"
              style={{ letterSpacing: "-0.02em", color: "#F0F0F5" }}
            >
              Your Content Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#F0F0F5",
              }}
            >
              <CalendarDays size={16} style={{ color: "#F7931E" }} />
              Scheduled Posts
            </Link>
          </div>
        </div>

        {/* Composer Area */}
        <div className="flex-1 flex flex-col items-center justify-start py-10 px-4 sm:px-8 xl:px-12 w-full">
          <div className="w-full max-w-6xl pr-fade-up pr-fade-up-1 h-full flex flex-col">
            <PostComposer linkedProviders={linkedProviders} user={session?.user} />
          </div>
        </div>

      </main>
    </div>
  );
}
