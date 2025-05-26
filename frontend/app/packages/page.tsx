"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PackageCard } from "./components/package-card"
import { FilterBar } from "./components/filter-bar"
import { SidebarFilter } from "./components/sidebar-filter"
import { getPackages } from "@/app/actions/package-actions"
import type { PackageData } from "@/app/actions/package-actions"

export default function PackagesPage() {
  const router = useRouter()

  // State for packages and filters
  const [packages, setPackages] = useState<PackageData[]>([])
  const [filteredPackages, setFilteredPackages] = useState<PackageData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortOption, setSortOption] = useState<"date" | "priceLowToHigh" | "priceHighToLow" | "nameAZ">("date")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true)
      try {
        const data = await getPackages()
        setPackages(data)
        setFilteredPackages(data)
      } catch (error) {
        console.error("Error fetching packages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackages()
  }, [])

  // Filter and sort packages
  useEffect(() => {
    let result = [...packages]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply price range filter
    result = result.filter((pkg) => Number(pkg.price) >= priceRange[0] && Number(pkg.price) <= priceRange[1])

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((pkg) => pkg.category.some((cat) => selectedCategories.includes(cat)))
    }

    // Apply region filter
    if (selectedRegions.length > 0) {
      result = result.filter((pkg) => selectedRegions.includes(pkg.region))
    }

    // Apply duration filter
    if (selectedDurations.length > 0) {
      result = result.filter((pkg) => {
        const days = pkg.duration_in_days || Number.parseInt(pkg.duration.split(" ")[0])

        return selectedDurations.some((duration) => {
          if (duration === "1-3 days" && days >= 1 && days <= 3) return true
          if (duration === "4-6 days" && days >= 4 && days <= 6) return true
          if (duration === "7-9 days" && days >= 7 && days <= 9) return true
          if (duration === "10+ days" && days >= 10) return true
          return false
        })
      })
    }

    // Apply sorting
    switch (sortOption) {
      case "date":
        // For API data, we'll just keep the original order
        break
      case "priceLowToHigh":
        result.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case "priceHighToLow":
        result.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case "nameAZ":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredPackages(result)
  }, [packages, searchTerm, priceRange, sortOption, selectedCategories, selectedRegions, selectedDurations])

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Handle region selection
  const handleRegionChange = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  // Handle duration selection
  const handleDurationChange = (duration: string) => {
    setSelectedDurations((prev) => (prev.includes(duration) ? prev.filter((d) => d !== duration) : [...prev, duration]))
  }

  // Handle search button click
  const handleSearchClick = () => {
    // In a real app, this might trigger an API call
    console.log("Search clicked with term:", searchTerm)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/travel1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white italic mb-8">Travel With Us</h1>
            {/* <button
              onClick={handleSearchClick}
              className="bg-[#E91E63] text-white px-6 py-2 rounded-full hover:bg-[#D81B60] transition-all duration-300"
            >
              SEARCH TOUR
            </button> */}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <FilterBar sortOption={sortOption} setSortOption={setSortOption} />

      {/* Packages Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="col-span-1 order-2 md:order-1">
              <SidebarFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                selectedDurations={selectedDurations}
                onDurationChange={handleDurationChange}
                selectedRegions={selectedRegions}
                onRegionChange={handleRegionChange}
              />
            </div>

            {/* Packages */}
            <div className="col-span-2 order-1 md:order-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E91E63]"></div>
                </div>
              ) : filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      id={pkg.id}
                      title={pkg.title}
                      location={pkg.location}
                      region={pkg.region}
                      price={pkg.price}
                      discounted_price={pkg.discounted_price}
                      duration={pkg.duration}
                      image={pkg.image}
                      description={pkg.short_description}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold mb-2">No packages found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters to find what you're looking for.</p>
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setPriceRange([0, 5000])
                      setSelectedCategories([])
                      setSelectedRegions([])
                      setSelectedDurations([])
                    }}
                    className="bg-[#E91E63] text-white px-6 py-2 rounded-md hover:bg-[#D81B60]"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
