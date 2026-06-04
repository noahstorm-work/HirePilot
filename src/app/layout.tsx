import type { Metadata } from "next"
import { Syne, Inter } from "next/font/google"
import "./globals.css"
import { ErrorLogging } from "@/components/ErrorLogging"

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
  title: "HirePilot AI - Your AI Co-Pilot For Getting Hired",
  description: "AI-powered career optimization. Understand why you're not getting interviews, improve your CV, find the right jobs, and land offers faster.",
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
      <body className={`${syne.variable} ${inter.variable} min-h-screen bg-[#09090b] text-[#fafafa] antialiased`}>
        <ErrorLogging />
        {children}
      </body>
    </html>
  )
}
