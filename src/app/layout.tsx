import type { Metadata } from "next"
import { Syne } from "next/font/google"
import localFont from "next/font/local"
import { cookies } from "next/headers"
import "./globals.css"
import { ErrorLogging } from "@/components/ErrorLogging"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
})

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Satoshi-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://hirepilot-app.vercel.app"),
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
    siteName: "HirePilot AI",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HirePilot AI — Your AI Co-Pilot For Getting Hired",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HirePilot AI — Your AI Co-Pilot For Getting Hired",
    description: "AI-powered career operating system. Understand why you're not getting interviews.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const nonce = cookieStore.get("csp-nonce")?.value ?? ""

  return (
    <html lang="en" className="dark" nonce={nonce}>
      <body nonce={nonce} className={`${syne.variable} ${satoshi.variable} min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased`}>
        <ErrorLogging />
        <Analytics />
        <SpeedInsights />
        <Toaster theme="dark" position="bottom-right" richColors />
        {children}
      </body>
    </html>
  )
}
