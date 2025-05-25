"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Container } from "@/components/container"
import { HeroSection } from "./components/hero-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MapPin, Phone, Star, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getBusinesses } from "@/app/actions/business-actions"
import type { BusinessData } from "@/app/actions/business-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ApiResponse {
  results: BusinessData[]
  count: number
}

// Business Card Component with React.memo for performance
const BusinessCard = ({ business }: { business: BusinessData }) => {
  return (
    <Card
      key={business.id}
      className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative h-48">
        <Image
          src={
            typeof business.mainImage === "string"
              ? business.mainImage
              : business.mainImage instanceof File
                ? URL.createObjectURL(business.mainImage)
                : "/placeholder.svg?height=300&width=500&text=No+Image"
          }
          alt={business.businessName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=300&width=500&text=Image+Not+Found"
          }}
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center shadow-md">
          <Star className="h-4 w-4 text-primary mr-1" fill="currentColor" />
          <span className="text-sm font-bold">{business.rating || "N/A"}</span>
        </div>
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary hover:bg-primary/90 text-white text-xs font-medium px-2.5 py-1">
            {business.businessType}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900">{business.businessName}</h3>
          {business.verified && (
            <Badge variant="outline" className="bg-white text-primary border-primary flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Verified</span>
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-700">
              {business.city}, {business.region}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <a href={`tel:${business.phone}`} className="text-gray-700 hover:text-amber-600 transition-colors">
              {business.phone || "N/A"}
            </a>
          </div>
        </div>

        <Link href={`/business/${business.id}`}>
          <Button className="w-full rounded-full bg-primary hover:bg-primary/90 transition-colors">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// Skeleton loader for business cards
const BusinessCardSkeleton = () => (
  <Card className="overflow-hidden h-full flex flex-col">
    <div className="relative h-48 bg-gray-200 animate-pulse"></div>
    <CardContent className="p-4 flex-grow">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </CardContent>
  </Card>
)

// Business Grid with Skeleton Loader
const BusinessGrid = ({ businesses, isLoading }: { businesses: BusinessData[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <BusinessCardSkeleton key={index} />
          ))}
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-full shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">No businesses found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  )
}

// Search and Filter Controls Component
const SearchAndFilterControls = ({
  queryParams,
  onSearchChange,
}: {
  queryParams: Record<string, string>
  onSearchChange: (params: Record<string, string>) => void
}) => {
  const handleSearchChange = (value: string) => {
    onSearchChange({ ...queryParams, search: value, page: "1" })
  }

  const handleFilterChange = (key: string, value: string) => {
    onSearchChange({ ...queryParams, [key]: value, page: "1" })
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search businesses..."
              value={queryParams.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select
            value={queryParams.business_type || "all"}
            onValueChange={(value) => handleFilterChange("business_type", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Restaurant">Restaurant</SelectItem>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Tour">Tour</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={queryParams.region || "all"}
            onValueChange={(value) => handleFilterChange("region", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
              <SelectItem value="Oromia">Oromia</SelectItem>
              <SelectItem value="Amhara">Amhara</SelectItem>
              <SelectItem value="Tigray">Tigray</SelectItem>
              <SelectItem value="SNNPR">SNNPR</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={queryParams.order_by || "all"}
            onValueChange={(value) => handleFilterChange("order_by", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Default</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default function BusinessDirectoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<BusinessData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  // Extract all query parameters
  const queryParams = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      business_type: searchParams.get("business_type") || "",
      region: searchParams.get("region") || "",
      city: searchParams.get("city") || "",
      order_by: searchParams.get("order_by") || "",
      page: searchParams.get("page") || "1",
      page_size: searchParams.get("page_size") || "9",
    }),
    [searchParams]
  )

  const handleSearchChange = (newParams: Record<string, string>) => {
    const params = new URLSearchParams()
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    router.push(`/business?${params.toString()}`)
  }

  // Fetch businesses with debounce
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getBusinesses({
          search: queryParams.search,
          business_type: queryParams.business_type,
          region: queryParams.region,
          city: queryParams.city,
          order_by: queryParams.order_by,
          page: queryParams.page,
          page_size: queryParams.page_size,
        })

        if (result && 'results' in result && 'count' in result) {
          const apiResponse = result as ApiResponse
          setBusinesses(apiResponse.results)
          setTotalPages(Math.ceil(apiResponse.count / Number(queryParams.page_size)))
        } else if (Array.isArray(result)) {
          // For mock data
          setBusinesses(result)
          setTotalPages(Math.ceil(result.length / Number(queryParams.page_size)))
        } else {
          console.error("Unexpected response format:", result)
          setError("Invalid response format from server")
        }
      } catch (err) {
        console.error("Error fetching businesses:", err)
        setError("Failed to load businesses. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchData, 300)
    return () => clearTimeout(timeoutId)
  }, [queryParams])

  if (error) {
    return (
      <Container className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.refresh()} className="mt-4">
          Retry
        </Button>
      </Container>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />

        <Container className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Ethiopian Business Directory</h2>
            <Link href="/business/register">
              <Button className="bg-primary rounded-full hover:bg-primary/90">Register Your Business</Button>
            </Link>
          </div>

          <SearchAndFilterControls queryParams={queryParams} onSearchChange={handleSearchChange} />

          <BusinessGrid businesses={businesses} isLoading={isLoading} />

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                disabled={Number(queryParams.page) <= 1}
                onClick={() => handleSearchChange({ ...queryParams, page: String(Number(queryParams.page) - 1) })}
              >
                <span className="sr-only">Previous page</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === Number(queryParams.page) ? "default" : "outline"}
                  className={pageNum === Number(queryParams.page) ? "bg-primary hover:bg-primary/90" : ""}
                  onClick={() => handleSearchChange({ ...queryParams, page: String(pageNum) })}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={Number(queryParams.page) >= totalPages}
                onClick={() => handleSearchChange({ ...queryParams, page: String(Number(queryParams.page) + 1) })}
              >
                <span className="sr-only">Next page</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </nav>
          </div>
        </Container>
      </main>
    </div>
  )
}