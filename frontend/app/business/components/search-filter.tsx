import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Business types and regions data
const businessTypes = [
  "Hotel",
  "Restaurant",
  "Travel Agency",
  "Resort",
  "Lodge",
  "Tour Guide",
  "Souvenir Shop",
  "Transportation",
  "Cafe",
  "Other",
]

const regions = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "Southern Nations, Nationalities, and Peoples",
  "Tigray",
]

export const BusinessSearchFilter = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [selectedType, setSelectedType] = useState(searchParams.get("business_type") || "")
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "")
  const [selectedOrder, setSelectedOrder] = useState(searchParams.get("order_by") || "")

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams()
    
    if (searchQuery) params.set("query", searchQuery)
    if (selectedType) params.set("business_type", selectedType)
    if (selectedRegion) params.set("region", selectedRegion)
    if (selectedOrder) params.set("order_by", selectedOrder)
    
    router.push(`/business?${params.toString()}`)
  }, [searchQuery, selectedType, selectedRegion, selectedOrder, router])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value)
  }, [])

  const handleRegionChange = useCallback((value: string) => {
    setSelectedRegion(value)
  }, [])

  const handleOrderChange = useCallback((value: string) => {
    setSelectedOrder(value)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && updateFilters()}
          />
        </div>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Business Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {businessTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase()}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedRegion} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region.toLowerCase()}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedOrder} onValueChange={handleOrderChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="date">Newest</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={updateFilters} className="bg-primary hover:bg-primary/90">
          Apply Filters
        </Button>
      </div>
    </div>
  )
} 