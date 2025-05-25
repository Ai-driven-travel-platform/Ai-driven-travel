import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Chatbot } from "@/components/chatbot"
import { Suspense } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EthioTravel - Discover Ethiopia",
  description: "Your ultimate guide to traveling in Ethiopia",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LayoutWrapper>
              <Navbar />
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <main className="flex-1">{children}</main>
              </Suspense>
              <Chatbot />
            </LayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
