import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import PlausibleProvider from 'next-plausible'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solanize — Solana AI Assistant",
  description: "Chat with your Solana wallet. Check balances, swap tokens, and send SOL — all through natural conversation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PlausibleProvider domain={process.env.NEXT_PUBLIC_DOMAIN || "solanize.ai"} trackOutboundLinks>
          <Toaster />
          {children}
        </PlausibleProvider>
      </body>
    </html>
  )
}
