"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HeroSection } from "./components/hero-section"
import { TourPlanSection } from "./components/tour-plan-section"
import { TourPackagesSection } from "./components/tour-packages-section"
import { ServicesSection } from "./components/services-section"
import { AITravelSection } from "./components/ai-travel-section"
import { TestimonialsSection } from "./components/testimonials-section"
import { CTASection } from "./components/cta-section"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Redirect to home if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home")
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#E91E63] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading amazing destinations...</h2>
          <p className="text-gray-600 mt-2">Preparing your Ethiopian adventure</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <HeroSection />
      <TourPlanSection />
      <TourPackagesSection />
      <ServicesSection />
      <AITravelSection />
      <TestimonialsSection />
      <CTASection />
    </motion.div>
  )
}
