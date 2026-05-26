import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/userContext";
import Navbar from "@/components/ui/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter" 
});

export const metadata: Metadata = {
  title: "JalRakshak - Groundwater Sustainability Intelligence Platform",
  description: "AI-powered tracker designed to monitor, simulate, and sustain local groundwater resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-ocean-950 text-white min-h-screen antialiased`}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <UserProvider>
            <Navbar />
            {children}
          </UserProvider>
        </ClerkProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
