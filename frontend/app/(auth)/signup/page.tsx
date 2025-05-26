"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLayout } from "@/components/auth-layout"
import { registerUser } from "@/app/actions/auth-actions"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setGeneralError("")
    setFieldErrors({})

    // Client-side validation
    if (!agreeTerms) {
      setGeneralError("You must agree to the terms and conditions")
      return
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }))
      return
    }

    if (password.length < 8) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }))
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting registration form...")

      const result = await registerUser({
        username,
        email,
        password,
        password2: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        role: "user",
      })

      console.log("Registration result:", result)

      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        } else {
          // Handle general error
          setGeneralError(result.error || "Registration failed. Please try again.")
        }
        setIsLoading(false)
        return
      }

      // Handle successful registration
      console.log("Registration successful!")

      // Store email in session storage for verification page
      sessionStorage.setItem("registrationEmail", email)

      // Show success message
      setRegistrationSuccess(true)

      // Redirect to verification page after a short delay
      setTimeout(() => {
        // Use window.location for a hard redirect to avoid any router interception
        window.location.href = "/verify-email"
      }, 1500)
    } catch (error) {
      console.error("Signup error:", error)
      setGeneralError(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred during registration. Please try again later.",
      )
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <Link href="/" className="text-2xl font-bold text-[#0D2B3E]">
          Ethio<span className="text-[#E91E63]">Travel</span>
        </Link>
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-center">Sign Up</h2>
      <p className="mt-2 text-sm text-muted-foreground text-center">Create your EthioTravel account</p>

      {generalError && (
        <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-600">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-red-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="whitespace-pre-wrap">{generalError}</div>
          </div>
        </div>
      )}

      {registrationSuccess && (
        <div className="mt-4 rounded-md bg-green-50 p-4 border border-green-200 text-sm text-green-600">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-green-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>Registration successful! Redirecting to verification page...</div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className={fieldErrors.first_name ? "border-red-500" : ""}
              />
              {fieldErrors.first_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className={fieldErrors.last_name ? "border-red-500" : ""}
              />
              {fieldErrors.last_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              className={fieldErrors.username ? "border-red-500" : ""}
            />
            {fieldErrors.username && <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={fieldErrors.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className={fieldErrors.confirmPassword || fieldErrors.password2 ? "border-red-500" : ""}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
            {fieldErrors.password2 && <p className="text-xs text-red-500 mt-1">{fieldErrors.password2}</p>}
          </div>

          <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-[#E91E63] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#E91E63] hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-[#E91E63] hover:bg-[#D81B60]"
            disabled={isLoading || !agreeTerms || registrationSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : registrationSuccess ? (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Account Created
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-[#E91E63] hover:text-[#D81B60]">
            Login
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
