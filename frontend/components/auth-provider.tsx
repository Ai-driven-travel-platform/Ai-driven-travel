"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { getCurrentUser, logoutUser } from "@/app/actions/auth-actions"

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  role?: string
  profile_image?: string
  email_verified?: boolean
  status?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  getAccessToken: () => null,
})

export const useAuth = () => useContext(AuthContext)

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/home",
  "/landingpage",
  "/blog",
  "/destinations",
  "/events",
  "/packages",
  "/business",
  "/privacy",
  "/terms",
]

// List of auth routes that should redirect to home if already authenticated
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth state from cookies and localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prioritize server-side user data from cookies
        const serverUser = await getCurrentUser()
        if (serverUser) {
          // Check if email is verified
          if (serverUser.email_verified === false) {
            console.log("User email not verified, clearing auth state")
            setUser(null)
            if (typeof window !== "undefined") {
              localStorage.removeItem("user")
              localStorage.removeItem("authState")
              localStorage.removeItem("access_token")
              localStorage.removeItem("refresh_token")
            }
            setIsLoading(false)
            return
          }

          console.log("Found user data from server:", serverUser.username)
          // Ensure id is always a string to match local User type
          setUser({
            ...serverUser,
            id: serverUser.id ?? "",
          })

          // Only set localStorage if in browser environment
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(serverUser))
            localStorage.setItem("authState", "authenticated")
          }

          setIsLoading(false)
          return
        }

        // Fallback to localStorage only in browser environment
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser) as User

              // Check if email is verified
              if (userData.email_verified === false) {
                console.log("User email not verified, clearing auth state")
                localStorage.removeItem("user")
                localStorage.removeItem("authState")
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                setUser(null)
              } else {
                console.log("Found user data in localStorage:", userData.username)
                setUser(userData)
              }
            } catch (e) {
              console.error("Error parsing user data from localStorage:", e)
              localStorage.removeItem("user")
              localStorage.removeItem("authState")
              setUser(null)
            }
          } else {
            // Only log in development to avoid console clutter in production
            if (process.env.NODE_ENV === "development") {
              console.log("No user data found in cookies or localStorage")
            }
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setUser(null)
        if (typeof window !== "undefined") {
          localStorage.removeItem("authState")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "authState" || event.key === "user" || event.key === "access_token") {
        checkAuth()
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, []) // Removed pathname dependency to prevent unnecessary checks

  // Handle routing based on authentication state
  useEffect(() => {
    // Skip routing logic during loading or if pathname is undefined
    if (isLoading || !pathname) return

    // Special case for verification page - don't redirect if coming from signup
    if (pathname === "/verify-email" && sessionStorage.getItem("registrationEmail")) {
      return
    }

    // Check if the current route is in the AUTH_ROUTES list
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

    // If user is authenticated and trying to access an auth route, redirect to home
    if (user && isAuthRoute) {
      router.push("/home")
      return
    }

    // Check if the current route is a public route
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // If route requires authentication and user is not authenticated, redirect to login
    if (!isPublicRoute && !user) {
      router.push("/login")
    }
  }, [isLoading, user, pathname, router])

  const login = (userData: User) => {
    // Check if email is verified before allowing login
    if (userData.email_verified === false) {
      console.log("Cannot login: Email not verified for user:", userData.username)
      return
    }

    console.log("Login called with user:", userData.username)
    setUser(userData)

    if (typeof window !== "undefined") {
      localStorage.setItem("authState", "authenticated")
      localStorage.setItem("user", JSON.stringify(userData))
      window.dispatchEvent(new Event("auth-state-changed"))
    }
  }

  const logout = async () => {
    try {
      console.log("Logout called")
      await logoutUser()

      if (typeof window !== "undefined") {
        localStorage.removeItem("authState")
        localStorage.removeItem("user")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }

      setUser(null)

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-state-changed"))
      }

      router.push("/login")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const getAccessToken = (): string | null => {
    if (typeof window !== "undefined") {
      const localStorageToken = localStorage.getItem("access_token")
      if (localStorageToken && localStorageToken !== "undefined" && localStorageToken !== "null") {
        return localStorageToken
      }

      try {
        const cookies = document.cookie.split(";")
        const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("access_token="))
        if (tokenCookie) {
          const token = tokenCookie.split("=")[1].trim()
          if (token && token !== "undefined" && token !== "null") {
            return token
          }
        }
      } catch (error) {
        console.error("Error retrieving access token from cookies:", error)
      }

      if (process.env.NEXT_PUBLIC_JWT_TOKEN) {
        return process.env.NEXT_PUBLIC_JWT_TOKEN
      }
    }
    return null
  }

  return (
    <SessionProvider>
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          isLoading,
          login,
          logout,
          getAccessToken,
        }}
      >
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  )
}

export default AuthProvider
