import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Post'r — LinkedIn Content Studio",
  description: "Schedule, publish, and grow your LinkedIn presence with AI",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-full`}
    >
      <body className="min-h-full flex flex-col font-sans" style={{ backgroundColor: '#0A0A0F', color: '#F0F0F5' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

