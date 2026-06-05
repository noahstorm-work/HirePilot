import type { Metadata } from "next"
import { Syne, Inter } from "next/font/google"
import "./globals.css"
import { ErrorLogging } from "@/components/ErrorLogging"
import { CommandPalette } from "@/components/CommandPalette"
import { Toaster } from "sonner"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: {
    default: "HirePilot AI — Your AI Co-Pilot For Getting Hired",
    template: "%s | HirePilot AI",
  },
  description: "AI-powered career operating system. Understand why you're not getting interviews, optimize your CV, find matching jobs, and land offers faster.",
  keywords: ["career", "AI", "resume", "CV", "interview", "job search", "ATS", "career analysis"],
  openGraph: {
    title: "HirePilot AI — Your AI Co-Pilot For Getting Hired",
    description: "AI-powered career operating system. Understand why you're not getting interviews.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${syne.variable} ${inter.variable} min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased`}>
        <ErrorLogging />
        <CommandPalette />
        <Toaster theme="dark" position="bottom-right" richColors />
        {children}
      </body>
    </html>
  )
}
