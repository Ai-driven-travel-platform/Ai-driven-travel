"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, User, Menu, X, Building2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { ClientOnly } from "@/components/client-only"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutUser } from "@/app/actions/auth-actions"
import { useAuth } from "@/components/auth-provider"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false) // State for Explore dropdown
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Destinations", href: "/destinations" },
    { name: "About", href: "/about" },
    {
      name: "Explore",
      items: [
        { name: "Events", href: "/events" },
        { name: "Packages", href: "/packages" },
        { name: "Business", href: "/business" },
      ],
    },
    { name: "Blog", href: "/blog" },
  ]

  const handleNavigation = (href: string) => {
    setIsOpen(false)
    setIsExploreOpen(false) // Close Explore dropdown on navigation
    router.push(href)
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      logout()
      router.push("/home")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    const handleAuthChange = () => {
      setIsOpen(isOpen)
    }
    window.addEventListener("auth-state-changed", handleAuthChange)
    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange)
    }
  }, [isOpen])

  const isUserAuthenticated = isAuthenticated && user !== null

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex md:items-center md:justify-center md:flex-1 md:space-x-8">
            {isUserAuthenticated ? (
              navItems.map((item) =>
                item.items ? (
                  <DropdownMenu
                    key={item.name}
                    open={isExploreOpen}
                    onOpenChange={setIsExploreOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <div
                        className={cn(
                          "relative px-1 py-2 text-sm font-semibold transition-colors hover:text-primary cursor-pointer group",
                          item.items.some((subItem) => pathname === subItem.href)
                            ? "text-primary"
                            : "text-secondary",
                        )}
                        onMouseEnter={() => setIsExploreOpen(true)}
                        onMouseLeave={() => setIsExploreOpen(false)}
                      >
                        {item.name}
                        <span
                          className={cn(
                            "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                            item.items.some((subItem) => pathname === subItem.href)
                              ? "w-full"
                              : "w-0 group-hover:w-full",
                          )}
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="bg-white border border-gray-200 shadow-lg rounded-md p-2"
                      onMouseEnter={() => setIsExploreOpen(true)}
                      onMouseLeave={() => setIsExploreOpen(false)}
                    >
                      {item.items.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.name}
                          asChild
                          className="hover:bg-gray-100 text-gray-700 rounded-sm"
                        >
                          <Link href={subItem.href} onClick={() => handleNavigation(subItem.href)}>
                            {subItem.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative px-1 py-2 text-sm font-semibold transition-colors hover:text-primary group",
                      pathname === item.href ? "text-primary" : "text-secondary",
                    )}
                  >
                    {item.name}
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                        pathname === item.href ? "w-full" : "w-0 group-hover:w-full",
                      )}
                    />
                  </Link>
                )
              )
            ) : null}
          </nav>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isUserAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center rounded-md">
                        <ClientOnly>
                          <Building2 className="h-4 w-4 mr-2" />
                        </ClientOnly>
                        My Business
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border border-gray-200 shadow-lg rounded-md p-2"
                    >
                      <DropdownMenuLabel className="text-gray-900 font-semibold">
                        Business Menu
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-200" />
                      <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700 rounded-sm">
                        <Link href="/business/my-business">My Listings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700 rounded-sm">
                        <Link href="/business/register">Add New Business</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200" />
                      <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700 rounded-sm">
                        <Link href="/business">Browse Directory</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white overflow-hidden">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image || "/placeholder.svg"}
                            alt={user.first_name || user.username}
                            className="h-full w-full object-cover" />
                        ) : (
                          <ClientOnly>
                            <User className="h-5 w-5" />
                          </ClientOnly>
                        )}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border border-gray-200 shadow-lg rounded-md p-2"
                  >
                    <DropdownMenuLabel className="text-gray-900 font-semibold">
                      {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700 rounded-sm">
                      <Link href="/business/my-business">My Business</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-gray-100 text-gray-700 rounded-sm">
                      <Link href="/blog/my-posts">My Blog Posts</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="hover:bg-gray-100 text-gray-700 rounded-sm"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button 
                    variant={pathname === "/login" ? "default" : "ghost"} 
                    className={cn(
                      "rounded-full",
                      pathname === "/login" ? "bg-primary text-white" : ""
                    )}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    variant={pathname === "/signup" ? "default" : "ghost"}
                    className={cn(
                      "rounded-full",
                      pathname === "/signup" ? "bg-primary text-white" : ""
                    )}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-md">
                <ClientOnly>{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</ClientOnly>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) =>
                item.items ? (
                  <div key={item.name} className="flex flex-col">
                    <div className="px-3 py-2 text-base font-semibold text-gray-700">
                      {item.name}
                    </div>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "pl-6 px-3 py-2 text-base font-semibold relative",
                          pathname === subItem.href ? "text-primary" : "text-gray-700 hover:text-primary",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.name}
                        {pathname === subItem.href && (
                          <span className="absolute bottom-1 left-6 right-3 h-0.5 bg-primary" />
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-base font-semibold relative",
                      pathname === item.href ? "text-primary" : "text-gray-700 hover:text-primary",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                    {pathname === item.href && <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary" />}
                  </Link>
                )
              )}
              {isUserAuthenticated ? (
                <>
                  <Link
                    href="/business/my-business"
                    className="px-3 py-2 text-base font-semibold text-gray-700 hover:text-primary relative"
                    onClick={() => setIsOpen(false)}
                  >
                    My Business
                    {pathname === "/business/my-business" && (
                      <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary" />
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    className="px-3 py-2 text-base font-semibold text-gray-700 hover:text-primary relative"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                    {pathname === "/profile" && <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary" />}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-base font-semibold text-gray-700 hover:text-primary relative text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-base font-semibold text-gray-700 hover:text-primary relative"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                    {pathname === "/login" && <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary" />}
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-2 text-base font-semibold text-gray-700 hover:text-primary relative"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                    {pathname === "/signup" && <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary" />}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}