import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { SessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "PulsePoint · AI Family Health Network",
  description:
    "Remote triage, condition explanations, and lab analysis grounded in WHO/MOHFW/NHS guidelines.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased bg-background relative overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-aurora -z-10 animate-aurora pointer-events-none opacity-50" />
        <div className="absolute inset-0 grid-bg -z-10 pointer-events-none opacity-40" />
        <SessionProvider session={session}>
          <Header />
          <main className="mx-auto max-w-6xl px-6 py-8 relative z-10">{children}</main>
          <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-xs text-muted-foreground relative z-10">
            PulsePoint is decision-support, not a diagnosis. In an emergency
            call 108. All AI claims are sourced and audited.
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
