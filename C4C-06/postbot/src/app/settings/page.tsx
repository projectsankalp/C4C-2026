import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle2 } from "lucide-react";
import ClientAccountLinker from "./ClientAccountLinker";
import Sidebar from "@/components/Sidebar";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
  });

  const linkedProviders = accounts.map(acc => acc.provider);

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: "#0A0A0F" }}>
      <Sidebar />

      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="pr-orb pr-orb-amber" style={{ width: 400, height: 400, top: -80, right: -80 }} />
        <div className="pr-orb pr-orb-blue" style={{ width: 350, height: 350, bottom: -60, left: -60 }} />
      </div>

      <main className="relative z-10 flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top Bar */}
        <div
          className="flex items-center gap-4 px-8 py-5 sticky top-0 z-20"
          style={{
            background: "rgba(10,10,15,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Account</p>
            <h1 className="text-xl font-semibold" style={{ letterSpacing: "-0.02em", color: "#F0F0F5" }}>
              Settings
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-8 max-w-3xl mx-auto w-full">
          <div className="pr-card pr-fade-up pr-fade-up-1" style={{ padding: "32px" }}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1" style={{ color: "#F0F0F5" }}>
                Connected Accounts
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Manage the social media platforms linked to your Post'r account.
              </p>
            </div>

            {/* Orange divider */}
            <div
              className="w-full h-px mb-6"
              style={{ background: "linear-gradient(90deg, rgba(255,107,53,0.4), transparent)" }}
            />

            <div className="flex flex-col gap-3">

              {/* LinkedIn */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "rgba(10,102,194,0.08)", border: "1px solid rgba(10,102,194,0.2)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: "#0A66C2" }}
                  >
                    in
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2" style={{ color: "#F0F0F5" }}>
                      LinkedIn
                      <CheckCircle2 size={14} style={{ color: "#10B981" }} />
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>Primary Identity Provider</div>
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  Connected
                </span>
              </div>

              {/* Twitter */}
              <ClientAccountLinker
                provider="twitter"
                name="Twitter / X"
                icon={<span className="font-bold">𝕏</span>}
                color="bg-[#1DA1F2]"
                isConnected={linkedProviders.includes("twitter")}
              />

              {/* GitHub */}
              <ClientAccountLinker
                provider="github"
                name="GitHub"
                icon={<span className="font-bold text-xs">gh</span>}
                color="bg-[#333333]"
                isConnected={linkedProviders.includes("github")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
