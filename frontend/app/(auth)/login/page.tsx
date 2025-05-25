// app/login/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth-layout";
import { loginUser } from "@/app/actions/auth-actions";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/home";
  const errorParam = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(redirect);
    }
  }, [status, router, redirect]);

  // Update error state if error query param changes
  useEffect(() => {
    if (errorParam) {
      setError(
        errorParam === "Callback"
          ? "Failed to sign in with Google. Please try again or contact support."
          : errorParam
      );
    }
  }, [errorParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginUser({
        email,
        password,
      });

      if (!result.success) {
        setError(result.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result.data?.user) {
        login(result.data.user);
        router.push(redirect);
      } else {
        setError("Login successful but user data is missing");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: redirect,
      });

      if (result?.error) {
        setError(`Failed to sign in with Google: ${result.error}`);
        setIsLoading(false);
        return;
      }
      // Redirect is handled by useSession useEffect
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <Link href="/" className="text-2xl font-bold text-[#0D2B3E]">
          Ethio<span className="text-[#E91E63]">Travel</span>
        </Link>
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-center">Login</h2>
      <p className="mt-2 text-sm text-muted-foreground text-center">
        Login to access your EthioTravel account
      </p>

      {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <div className="mt-8">
        <div className="mt-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </Label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-[#E91E63] hover:text-[#D81B60]">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full rounded-full bg-[#E91E63] hover:bg-[#D81B60]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">Or sign in with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                )}
                Sign in with Google
              </Button>
            </div>

            
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#E91E63] hover:text-[#D81B60]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}