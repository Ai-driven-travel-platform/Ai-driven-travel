"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/container"
import { HeroSection } from "./components/hero-section"
import { DestinationFilters } from "./components/destination-filters"
import { DestinationGrid } from "./components/destination-grid"
import { TripPlanner } from "./components/trip-planner"
import { ScrollToTop } from "@/components/scroll-to-top"
import { getDestinations, type DestinationData } from "@/app/actions/destination-actions"
import { useToast } from "@/hooks/use-toast"

export default function DestinationsPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [destinations, setDestinations] = useState<DestinationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const categories = ["All", "Historical", "Natural", "Cultural", "Religious", "Adventure", "Beach"]
  const categoryMapping: Record<string, string> = {
    Historical: "historical",
    Natural: "natural",
    Cultural: "cultural",
    Religious: "religious",
    Adventure: "adventure",
    Beach: "beach"
  }

  // Fetch destinations
  useEffect(() => {
    async function fetchDestinations() {
      setIsLoading(true)
      setError(null)

      try {
        // Only pass category if not "All"
        const categoryParam = activeCategory !== "All" ? categoryMapping[activeCategory] : undefined

        const result = await getDestinations(categoryParam)

        if (result.success && result.data) {
          setDestinations(result.data)
        } else {
          setError(result.error || "Failed to load destinations")
          toast({
            title: "Error",
            description: result.error || "Failed to load destinations",
            variant: "destructive",
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDestinations()
  }, [activeCategory, toast])

  // Filter destinations based on search term
  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.address.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Sort destinations
  const sortedDestinations = [...filteredDestinations].sort((a, b) => {
    if (sortBy === "featured") {
      return a.featured === b.featured ? 0 : a.featured ? -1 : 1
    } else if (sortBy === "rating") {
      return Number.parseFloat(b.rating) - Number.parseFloat(a.rating)
    } else if (sortBy === "price-low") {
      // If we had price data, we would sort by price here
      return 0
    } else if (sortBy === "price-high") {
      // If we had price data, we would sort by price here
      return 0
    } else if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow">
        <HeroSection />

        <Container className="py-8">
          <div className="space-y-8">
            <DestinationFilters
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              onSearch={handleSearch}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            <DestinationGrid destinations={sortedDestinations} isLoading={isLoading} error={error || undefined} />

            {/* <TripPlanner /> */}
          </div>
        </Container>
      </main>

      <ScrollToTop />
    </div>
  )
}
