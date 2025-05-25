"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideFooterPaths = ["/login", "/signup", "/verify"]
  const shouldShowFooter = !hideFooterPaths.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      {children}
      {shouldShowFooter && <Footer />}
    </div>
  )
} 