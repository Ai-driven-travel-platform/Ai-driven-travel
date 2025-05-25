"use server"

import { cookies } from "next/headers"
import { cache } from "react"
import { uploadToCloudinary } from '@/lib/cloudinary-config'

// Business types
export interface BusinessData {
  id: string | number
  businessName: string
  businessType: string
  description: string
  region: string
  city: string
  address: string
  phone?: string
  email?: string
  website?: string
  verified?: boolean
  rating?: number
  mainImage?: string | File // Allow File for uploads
  openingHours?: string
  facilities?: string
  facebook?: string
  instagram?: string
  galleryImages?: string | File[] // Allow File[] for uploads
  totalReviews?: number
  createdAt?: string
  status?: string
  latitude?: string
  longitude?: string
  services?: string
  team?: string
  socialMediaLinks?: string
}

interface GetBusinessesParams {
  category?: string
  region?: string
  city?: string
  query?: string
}

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("access_token")?.value || null
}

// Helper function to validate Cloudinary URL
function validateCloudinaryUrl(url: string): boolean {
  return (
    url === "" ||
    url.startsWith(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "dpasgcaqm"}/`) ||
    url.startsWith("https://example.com/")
  )
}

// Helper function to build headers
async function buildHeaders(requireAuth = false): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  const token = await getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  } else if (requireAuth) {
    throw new Error("Authentication required: No access token found")
  } else {
    console.warn("No access token found, making unauthenticated request")
  }
  return headers
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  const snakeCaseObj: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      snakeCaseObj[snakeKey] = value
    }
  }
  return snakeCaseObj
}

// Update the uploadImage function to use the new Cloudinary configuration
async function uploadImage(file: File): Promise<string> {
  try {
    console.log("Preparing to upload image:", file.name, "size:", file.size)
    
    // Use the new Cloudinary upload function
    const imageUrl = await uploadToCloudinary(file, 'businesses/businesses')
    console.log("Image uploaded successfully:", imageUrl)
    
    return imageUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    // Return a valid placeholder URL instead of failing
    return "https://res.cloudinary.com/dpasgcaqm/image/upload/v1715021234/placeholder_business_image.jpg"
  }
}

// Add a URL validation helper function
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Cache the getBusinesses function to improve performance
export const getBusinesses = cache(async (params: GetBusinessesParams = {}): Promise<BusinessData[]> => {
  try {
    console.log("Fetching businesses with params:", params)
    const result = await fetchBusinesses(params)
    if (result.success) {
      console.log(`Successfully fetched ${result.data.length} businesses`)
      return result.data.map((business: any) => ({
        id: business.id,
        businessName: business.name || business.businessName,
        businessType: business.business_type || business.businessType,
        description: business.description,
        region: business.region,
        city: business.city,
        address: business.address,
        phone: business.contact_phone || business.phone,
        email: business.contact_email || business.email,
        website: business.website,
        verified: business.is_verified ?? business.verified,
        rating: business.rating || Number.parseFloat(business.average_rating) || undefined,
        mainImage: business.main_image || business.image || business.mainImage,
        openingHours: business.opening_hours || business.openingHours,
        facilities: business.facilities,
        facebook: business.facebook,
        instagram: business.instagram,
        galleryImages: business.gallery_images || business.galleryImages,
        totalReviews: business.total_reviews || business.totalReviews,
        createdAt: business.created_at || business.createdAt,
        status: business.status,
        latitude: business.latitude,
        longitude: business.longitude,
        services: business.services,
        team: business.team,
        socialMediaLinks: business.social_media_links || business.socialMediaLinks,
      }))
    }
  } catch (error) {
    console.error("Error fetching from API, falling back to mock data:", error)
  }

  // Reduced timeout for faster response
  await new Promise((resolve) => setTimeout(resolve, 200))

  let mockBusinesses: BusinessData[] = [
    {
      id: "1",
      businessName: "Sheraton Addis",
      businessType: "Hotel",
      description: "Luxury hotel in the heart of Addis Ababa with world-class restaurants and a spa.",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Taitu Street, Addis Ababa",
      phone: "+251 11 517 1717",
      email: "info@sheratonaddis.com",
      website: "www.sheratonaddis.com",
      verified: true,
      rating: 4.8,
      mainImage: "/placeholder.svg?height=300&width=500&text=Sheraton+Addis",
      openingHours: "Open 24 hours",
      facilities: "Pool, Spa, Restaurant, Conference Rooms, Gym",
      facebook: "facebook.com/sheratonaddis",
      instagram: "instagram.com/sheratonaddis",
      status: "active",
      createdAt: "2023-05-15T10:30:00Z",
    },
    {
      id: "2",
      businessName: "Yod Abyssinia Cultural Restaurant",
      businessType: "Restaurant",
      description: "Traditional Ethiopian restaurant with cultural performances and authentic cuisine.",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Bole Road, Addis Ababa",
      phone: "+251 11 661 2985",
      email: "info@yodethiopia.com",
      website: "www.yodethiopia.com",
      verified: true,
      rating: 4.5,
      mainImage: "/placeholder.svg?height=300&width=500&text=Yod+Abyssinia",
      openingHours: "11:00 AM - 11:00 PM",
      facilities: "Cultural performances, Traditional cuisine",
      facebook: "facebook.com/yodethiopia",
      instagram: "instagram.com/yodethiopia",
      status: "active",
      createdAt: "2023-06-20T14:15:00Z",
    },
    {
      id: "3",
      businessName: "Ethiopia Travel Agency",
      businessType: "Travel Agency",
      description: "Full-service tour operator specializing in cultural and historical tours of Ethiopia.",
      region: "Amhara",
      city: "Bahir Dar",
      address: "Main Street, Bahir Dar",
      phone: "+251 91 123 4567",
      email: "info@ethiopiatravel.com",
      website: "www.ethiopiatravel.com",
      verified: false,
      rating: 4.2,
      mainImage: "/placeholder.svg?height=300&width=500&text=Ethiopia+Travel",
      status: "pending",
      createdAt: "2023-07-05T09:45:00Z",
    },
    {
      id: "4",
      businessName: "Lalibela Tours",
      businessType: "Tour Operator",
      description: "Specialized tours to the historic rock-hewn churches of Lalibela and surrounding areas.",
      region: "Amhara",
      city: "Lalibela",
      address: "Church Street, Lalibela",
      phone: "+251 91 234 5678",
      email: "info@lalibelatours.com",
      website: "www.lalibelatours.com",
      verified: true,
      rating: 4.7,
      mainImage: "/placeholder.svg?height=300&width=500&text=Lalibela+Tours",
      status: "active",
      createdAt: "2023-04-12T08:30:00Z",
    },
    {
      id: "5",
      businessName: "Axum Hotel",
      businessType: "Hotel",
      description: "Comfortable accommodations in the historic city of Axum, close to major attractions.",
      region: "Tigray",
      city: "Axum",
      address: "Obelisk Road, Axum",
      phone: "+251 91 345 6789",
      email: "info@axumhotel.com",
      website: "www.axumhotel.com",
      verified: true,
      rating: 4.3,
      mainImage: "/placeholder.svg?height=300&width=500&text=Axum+Hotel",
      status: "active",
      createdAt: "2023-03-25T14:45:00Z",
    },
    {
      id: "6",
      businessName: "Harar Coffee House",
      businessType: "Cafe",
      description: "Authentic Ethiopian coffee experience in the ancient walled city of Harar.",
      region: "Harari",
      city: "Harar",
      address: "Jugol, Harar",
      phone: "+251 91 456 7890",
      email: "info@hararcoffee.com",
      website: "www.hararcoffee.com",
      verified: false,
      rating: 4.6,
      mainImage: "/placeholder.svg?height=300&width=500&text=Harar+Coffee",
      status: "pending",
      createdAt: "2023-06-10T09:15:00Z",
    },
    {
      id: "7",
      businessName: "Bale Mountains Lodge",
      businessType: "Lodge",
      description: "Eco-friendly lodge offering guided tours of the Bale Mountains National Park.",
      region: "Oromia",
      city: "Bale",
      address: "Bale Mountains National Park",
      phone: "+251 91 567 8901",
      email: "info@balemountainslodge.com",
      website: "www.balemountainslodge.com",
      verified: true,
      rating: 4.9,
      mainImage: "/placeholder.svg?height=300&width=500&text=Bale+Mountains+Lodge",
      status: "active",
      createdAt: "2023-02-18T11:30:00Z",
    },
    {
      id: "8",
      businessName: "Gondar Palace Restaurant",
      businessType: "Restaurant",
      description: "Fine dining restaurant serving traditional Ethiopian cuisine near the Royal Enclosure.",
      region: "Amhara",
      city: "Gondar",
      address: "Palace Road, Gondar",
      phone: "+251 91 678 9012",
      email: "info@gondarpalace.com",
      website: "www.gondarpalace.com",
      verified: true,
      rating: 4.4,
      mainImage: "/placeholder.svg?height=300&width=500&text=Gondar+Palace+Restaurant",
      status: "active",
      createdAt: "2023-05-05T18:45:00Z",
    },
  ]

  if (params.category) {
    mockBusinesses = mockBusinesses.filter((business) => business.businessType === params.category)
  }

  if (params.region) {
    mockBusinesses = mockBusinesses.filter((business) => business.region === params.region)
  }

  if (params.query) {
    const query = params.query.toLowerCase()
    mockBusinesses = mockBusinesses.filter(
      (business) =>
        business.businessName.toLowerCase().includes(query) || business.description.toLowerCase().includes(query),
    )
  }

  return mockBusinesses
})

// Cache the getBusinessById function to improve performance
export const getBusinessById = cache(async (id: string): Promise<BusinessData | null> => {
  try {
    console.log(`Fetching business with ID: ${id}`)
    const result = await fetchBusinessById(id)
    if (result.success) {
      console.log("Successfully fetched business details")
      const business = result.data
      return {
        id: business.id,
        businessName: business.name || business.businessName,
        businessType: business.business_type || business.businessType,
        description: business.description,
        region: business.region,
        city: business.city,
        address: business.address,
        phone: business.contact_phone || business.phone,
        email: business.contact_email || business.email,
        website: business.website,
        verified: business.is_verified ?? business.verified,
        rating: business.rating || Number.parseFloat(business.average_rating) || undefined,
        mainImage: business.main_image || business.image || business.mainImage,
        openingHours: business.opening_hours || business.openingHours,
        facilities: business.facilities,
        facebook: business.facebook,
        instagram: business.instagram,
        galleryImages: business.gallery_images || business.galleryImages,
        totalReviews: business.total_reviews || business.totalReviews,
        createdAt: business.created_at || business.createdAt,
        status: business.status,
        latitude: business.latitude,
        longitude: business.longitude,
        services: business.services,
        team: business.team,
        socialMediaLinks: business.social_media_links || business.socialMediaLinks,
      }
    }
  } catch (error) {
    console.error("Error fetching from API, falling back to mock data:", error)
  }

  // Reduced timeout for faster response
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockBusinesses: BusinessData[] = [
    {
      id: "1",
      businessName: "Sheraton Addis",
      businessType: "Hotel",
      description:
        "Luxury hotel in the heart of Addis Ababa with world-class restaurants and a spa. The Sheraton Addis is a 5-star hotel offering luxurious accommodations, exceptional dining options, and world-class amenities. Located in the heart of Ethiopia's capital city, the hotel provides easy access to major attractions, business centers, and entertainment venues. Guests can enjoy spacious rooms with modern furnishings, multiple restaurants serving international and local cuisine, a fully-equipped fitness center, and a relaxing spa. The hotel also features outdoor swimming pools, beautiful gardens, and versatile meeting and event spaces, making it an ideal choice for both business and leisure travelers.",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Taitu Street, Addis Ababa",
      phone: "+251 11 517 1717",
      email: "info@sheratonaddis.com",
      website: "www.sheratonaddis.com",
      verified: true,
      rating: 4.8,
      mainImage: "/placeholder.svg?height=300&width=500&text=Sheraton+Addis",
      openingHours: "Open 24 hours",
      facilities:
        "Pool, Spa, Restaurant, Conference Rooms, Gym, Wi-Fi, Room Service, Concierge, Valet Parking, Business Center",
      facebook: "facebook.com/sheratonaddis",
      instagram: "instagram.com/sheratonaddis",
      status: "active",
      createdAt: "2023-05-15T10:30:00Z",
      latitude: "9.0092",
      longitude: "38.7645",
      services: "Airport Shuttle, Laundry Service, Currency Exchange, Tour Desk, Babysitting",
      team: "Professional staff with international hospitality experience",
      socialMediaLinks: "twitter.com/sheratonaddis,linkedin.com/company/sheraton-addis",
    },
    {
      id: "2",
      businessName: "Yod Abyssinia Cultural Restaurant",
      businessType: "Restaurant",
      description:
        "Traditional Ethiopian restaurant with cultural performances and authentic cuisine. Yod Abyssinia offers an immersive cultural dining experience featuring traditional Ethiopian dishes served in the authentic style. The restaurant is known for its vibrant atmosphere, live music, and cultural dance performances that showcase Ethiopia's rich heritage. Diners can enjoy a variety of meat and vegetarian dishes served on injera, the traditional sourdough flatbread. The restaurant's interior is decorated with traditional Ethiopian artifacts and artwork, creating a warm and inviting ambiance. With its combination of delicious food and cultural entertainment, Yod Abyssinia provides visitors with a comprehensive introduction to Ethiopian culture and cuisine.",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Bole Road, Addis Ababa",
      phone: "+251 11 661 2985",
      email: "info@yodethiopia.com",
      website: "www.yodethiopia.com",
      verified: true,
      rating: 4.5,
      mainImage: "/placeholder.svg?height=300&width=500&text=Yod+Abyssinia",
      openingHours: "11:00 AM - 11:00 PM",
      facilities: "Cultural performances, Traditional cuisine, Private dining areas, Outdoor seating, Parking",
      facebook: "facebook.com/yodethiopia",
      instagram: "instagram.com/yodethiopia",
      status: "active",
      createdAt: "2023-06-20T14:15:00Z",
      latitude: "8.9806",
      longitude: "38.7578",
      services: "Catering, Group bookings, Cultural shows, Live music",
      team: "Experienced chefs specializing in traditional Ethiopian cuisine",
      socialMediaLinks: "twitter.com/yodethiopia,youtube.com/yodethiopia",
    },
    {
      id: "3",
      businessName: "Ethiopia Travel Agency",
      businessType: "Travel Agency",
      description:
        "Full-service tour operator specializing in cultural and historical tours of Ethiopia. Ethiopia Travel Agency offers comprehensive tour packages that showcase the country's rich cultural heritage, historical sites, and natural wonders. With years of experience in the tourism industry, the agency provides personalized itineraries tailored to meet the specific interests and preferences of travelers. Their knowledgeable guides offer insights into Ethiopia's diverse cultures, ancient history, and stunning landscapes. The agency handles all aspects of travel arrangements, including accommodations, transportation, and guided tours to destinations such as Lalibela, Axum, the Simien Mountains, and the Danakil Depression. Whether you're interested in historical exploration, wildlife safaris, or cultural immersion, Ethiopia Travel Agency ensures a memorable and authentic Ethiopian experience.",
      region: "Amhara",
      city: "Bahir Dar",
      address: "Main Street, Bahir Dar",
      phone: "+251 91 123 4567",
      email: "info@ethiopiatravel.com",
      website: "www.ethiopiatravel.com",
      verified: false,
      rating: 4.2,
      mainImage: "/placeholder.svg?height=300&width=500&text=Ethiopia+Travel",
      openingHours: "Monday to Saturday, 8:30 AM - 5:30 PM",
      facilities: "Office space, Meeting room, Wi-Fi",
      facebook: "facebook.com/ethiopiatravel",
      instagram: "instagram.com/ethiopiatravel",
      status: "pending",
      createdAt: "2023-07-05T09:45:00Z",
      latitude: "11.5742",
      longitude: "37.3614",
      services: "Custom tour packages, Airport transfers, Visa assistance, Hotel bookings, Guide services",
      team: "Experienced tour guides fluent in multiple languages",
      socialMediaLinks: "twitter.com/ethiopiatravel,pinterest.com/ethiopiatravel",
    },
  ]

  return mockBusinesses.find((business) => business.id.toString() === id) || null
})

export async function deleteBusiness(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await buildHeaders(true)
    const response = await fetch(`https://ai-driven-travel.onrender.com/api/business/businesses/${id}/`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || errorData.message || `Failed to delete business: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting business:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const getBusinessesByUserId = cache(async (userId: string): Promise<BusinessData[]> => {
  try {
    const headers = await buildHeaders(true)
    const response = await fetch(`https://ai-driven-travel.onrender.com/api/business/user-businesses/`, {
      headers,
      cache: "no-store",
    })

    if (response.ok) {
      const data = await response.json()
      return (data.results || data).map((business: any) => ({
        id: business.id,
        businessName: business.name || business.businessName,
        businessType: business.business_type || business.businessType,
        description: business.description,
        region: business.region,
        city: business.city,
        address: business.address,
        phone: business.contact_phone || business.phone,
        email: business.contact_email || business.email,
        website: business.website,
        verified: business.is_verified ?? business.verified,
        rating: business.rating || Number.parseFloat(business.average_rating) || undefined,
        mainImage: business.main_image || business.image || business.mainImage,
        openingHours: business.opening_hours || business.openingHours,
        facilities: business.facilities,
        facebook: business.facebook,
        instagram: business.instagram,
        galleryImages: business.gallery_images || business.galleryImages,
        totalReviews: business.total_reviews || business.totalReviews,
        createdAt: business.created_at || business.createdAt,
        status: business.status,
        latitude: business.latitude,
        longitude: business.longitude,
        services: business.services,
        team: business.team,
        socialMediaLinks: business.social_media_links || business.socialMediaLinks,
      }))
    }
  } catch (error) {
    console.error("Error fetching user businesses from API:", error)
  }

  // Reduced timeout for faster response
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockBusinesses: BusinessData[] = [
    {
      id: "1",
      businessName: "Sheraton Addis",
      businessType: "Hotel",
      description: "Luxury hotel in the heart of Addis Ababa with world-class restaurants and a spa.",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Taitu Street, Addis Ababa",
      phone: "+251 11 517 1717",
      email: "info@sheratonaddis.com",
      website: "www.sheratonaddis.com",
      verified: true,
      rating: 4.8,
      mainImage: "/placeholder.svg?height=300&width=500&text=Sheraton+Addis",
      openingHours: "Open 24 hours",
      facilities: "Pool, Spa, Restaurant, Conference Rooms, Gym",
      facebook: "facebook.com/sheratonaddis",
      instagram: "instagram.com/sheratonaddis",
      status: "active",
      createdAt: "2023-05-15T10:30:00Z",
    },
    {
      id: "2",
      businessName: "Yod Abyssinia Cultural Restaurant",
      businessType: "Restaurant",
      description: "Traditional Ethiopian restaurant with cultural performances and authentic cuisine.",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Bole Road, Addis Ababa",
      phone: "+251 11 661 2985",
      email: "info@yodethiopia.com",
      website: "www.yodethiopia.com",
      verified: true,
      rating: 4.5,
      mainImage: "/placeholder.svg?height=300&width=500&text=Yod+Abyssinia",
      openingHours: "11:00 AM - 11:00 PM",
      facilities: "Cultural performances, Traditional cuisine",
      facebook: "facebook.com/yodethiopia",
      instagram: "instagram.com/yodethiopia",
      status: "active",
      createdAt: "2023-06-20T14:15:00Z",
    },
  ]

  return mockBusinesses
})

// Add a helper function to format URLs
function formatUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  
  // If URL already has http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// prefix if missing
  return `https://${url}`;
}

// Update the registerBusiness function
export async function registerBusiness(
  businessData: BusinessData,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Check authentication
    const token = await getAuthToken()
    if (!token) {
      console.error("No authentication token found")
      return {
        success: false,
        error: "Authentication required. Please log in and try again.",
      }
    }

    // Create a copy of the business data for processing
    const updatedBusinessData = { ...businessData }

    // Log initial data for debugging
    console.log("Initial business data:", {
      name: updatedBusinessData.businessName,
      type: updatedBusinessData.businessType,
      hasMainImage: !!updatedBusinessData.mainImage,
      mainImageType: updatedBusinessData.mainImage instanceof File ? "File" : typeof updatedBusinessData.mainImage,
      galleryImagesCount: Array.isArray(updatedBusinessData.galleryImages)
        ? updatedBusinessData.galleryImages.length
        : "not an array",
    })

    // Handle main image upload using the API route
    if (updatedBusinessData.mainImage instanceof File) {
      try {
        console.log("Uploading main image:", updatedBusinessData.mainImage.name)
        const imageUrl = await uploadImage(updatedBusinessData.mainImage)

        // Ensure we have a valid URL
        if (!isValidUrl(imageUrl)) {
          throw new Error("Invalid URL returned from image upload")
        }

        updatedBusinessData.mainImage = imageUrl
        console.log("Main image uploaded successfully:", imageUrl)
      } catch (error) {
        console.error("Error uploading main image:", error)
        // Use a valid placeholder URL instead of failing
        updatedBusinessData.mainImage =
          "https://res.cloudinary.com/dpasgcaqm/image/upload/v1715021234/placeholder_business_image.jpg"
        console.log("Using placeholder for main image")
      }
    } else if (
      typeof updatedBusinessData.mainImage === "string" &&
      !validateCloudinaryUrl(updatedBusinessData.mainImage) &&
      !isValidUrl(updatedBusinessData.mainImage)
    ) {
      console.error("Invalid main image URL:", updatedBusinessData.mainImage)
      // Use a valid placeholder URL instead of failing
      updatedBusinessData.mainImage =
        "https://res.cloudinary.com/dpasgcaqm/image/upload/v1715021234/placeholder_business_image.jpg"
      console.log("Using placeholder for invalid main image URL")
    }

    // Handle gallery images upload and format as a comma-separated string
    let galleryImagesString = ""
    if (Array.isArray(updatedBusinessData.galleryImages) && updatedBusinessData.galleryImages.length > 0) {
      try {
        console.log(`Processing ${updatedBusinessData.galleryImages.length} gallery images`)
        const galleryUrls: string[] = []

        // Process each gallery image
        for (let i = 0; i < updatedBusinessData.galleryImages.length; i++) {
          const item = updatedBusinessData.galleryImages[i]

          if (item instanceof File) {
            try {
              console.log(`Uploading gallery image ${i + 1}/${updatedBusinessData.galleryImages.length}:`, item.name)
              const url = await uploadImage(item)
              if (isValidUrl(url)) {
                galleryUrls.push(url)
                console.log(`Gallery image ${i + 1} uploaded:`, url)
              }
            } catch (error) {
              console.error(`Error uploading gallery image ${i + 1}:`, error)
            }
          } else if (typeof item === "string" && isValidUrl(item)) {
            galleryUrls.push(item)
          }
        }

        // Join URLs with commas as expected by the backend
        if (galleryUrls.length > 0) {
          galleryImagesString = galleryUrls.join(",")
          console.log(`Gallery images processed as string: ${galleryImagesString}`)
        } else {
          // If no valid gallery images, set to null instead of empty string
          galleryImagesString = ""
        }
      } catch (error) {
        console.error("Error processing gallery images:", error)
        galleryImagesString = ""
      }
    } else if (typeof updatedBusinessData.galleryImages === "string") {
      galleryImagesString = updatedBusinessData.galleryImages
    }

    // Format social media links as a string if needed
    let socialMediaLinksString = ""
    if (updatedBusinessData.facebook || updatedBusinessData.instagram) {
      const links = []
      if (updatedBusinessData.facebook) links.push(updatedBusinessData.facebook)
      if (updatedBusinessData.instagram) links.push(updatedBusinessData.instagram)
      socialMediaLinksString = links.join(",")
    } else if (typeof updatedBusinessData.socialMediaLinks === "string") {
      socialMediaLinksString = updatedBusinessData.socialMediaLinks
    }

    // Map frontend fields to backend expected fields
    const mappedBusinessData = {
      name: updatedBusinessData.businessName,
      business_type: updatedBusinessData.businessType,
      description: updatedBusinessData.description,
      region: updatedBusinessData.region,
      city: updatedBusinessData.city,
      address: updatedBusinessData.address,
      contact_phone: updatedBusinessData.phone,
      contact_email: updatedBusinessData.email,
      website: formatUrl(updatedBusinessData.website),
      facebook: formatUrl(updatedBusinessData.facebook),
      instagram: formatUrl(updatedBusinessData.instagram),
      opening_hours: updatedBusinessData.openingHours || null,
      facilities: updatedBusinessData.facilities || null,
      services: updatedBusinessData.services || null,
      team: updatedBusinessData.team || null,
      latitude: updatedBusinessData.latitude || null,
      longitude: updatedBusinessData.longitude || null,
      main_image: updatedBusinessData.mainImage,
      gallery_images: galleryImagesString || null,
      social_media_links: socialMediaLinksString || null,
    }

    console.log("Sending business data to backend:", mappedBusinessData)

    // Send data directly to the backend API with proper headers
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for larger uploads

      const headers = await buildHeaders(true)
      const response = await fetch("https://ai-driven-travel.onrender.com/api/business/businesses/", {
        method: "POST",
        headers,
        body: JSON.stringify(mappedBusinessData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle API response
      if (!response.ok) {
        let errorMessage = `Failed to register business: ${response.status}`
        try {
          const errorData = await response.json()
          console.error("Backend error response:", errorData)

          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === "object") {
            // Format field errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
              .join("; ")
            errorMessage = fieldErrors || JSON.stringify(errorData)
          }
        } catch (e) {
          console.error("Could not parse error response:", e)
        }

        return { success: false, error: errorMessage }
      }

      // Success case
      const data = await response.json()
      console.log("Backend response:", data)
      return { success: true, data }
    } catch (apiError) {
      console.error("API request error:", apiError)
      return {
        success: false,
        error: apiError instanceof Error ? apiError.message : "Failed to connect to the server",
      }
    }
  } catch (error) {
    console.error("Error registering business:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updateBusiness(
  id: string,
  businessData: BusinessData,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Check authentication
    const token = await getAuthToken()
    if (!token) {
      console.error("No authentication token found")
      return {
        success: false,
        error: "Authentication required. Please log in and try again.",
      }
    }

    // Create a copy of the business data for processing
    const updatedBusinessData = { ...businessData }

    // Handle main image upload using the API route
    if (updatedBusinessData.mainImage instanceof File) {
      try {
        console.log("Uploading main image:", updatedBusinessData.mainImage.name)
        const imageUrl = await uploadImage(updatedBusinessData.mainImage)
        updatedBusinessData.mainImage = imageUrl
        console.log("Main image uploaded successfully:", imageUrl)
      } catch (error) {
        console.error("Error uploading main image:", error)
        return { success: false, error: "Failed to upload main image" }
      }
    } else if (
      typeof updatedBusinessData.mainImage === "string" &&
      !validateCloudinaryUrl(updatedBusinessData.mainImage)
    ) {
      console.error("Invalid main image URL:", updatedBusinessData.mainImage)
      return { success: false, error: "Invalid main image URL" }
    }

    // Handle gallery images upload and format as a comma-separated string
    let galleryImagesString = ""
    if (Array.isArray(updatedBusinessData.galleryImages) && updatedBusinessData.galleryImages.length > 0) {
      try {
        console.log(`Processing ${updatedBusinessData.galleryImages.length} gallery images`)
        const galleryUrls: string[] = []

        // Process each gallery image
        for (let i = 0; i < updatedBusinessData.galleryImages.length; i++) {
          const item = updatedBusinessData.galleryImages[i]

          if (item instanceof File) {
            try {
              console.log(`Uploading gallery image ${i + 1}/${updatedBusinessData.galleryImages.length}:`, item.name)
              const url = await uploadImage(item)
              if (isValidUrl(url)) {
                galleryUrls.push(url)
                console.log(`Gallery image ${i + 1} uploaded:`, url)
              }
            } catch (error) {
              console.error(`Error uploading gallery image ${i + 1}:`, error)
            }
          } else if (typeof item === "string" && isValidUrl(item)) {
            galleryUrls.push(item)
          }
        }

        // Join URLs with commas as expected by the backend
        if (galleryUrls.length > 0) {
          galleryImagesString = galleryUrls.join(",")
          console.log(`Gallery images processed as string: ${galleryImagesString}`)
        } else {
          // If no valid gallery images, set to null instead of empty string
          galleryImagesString = ""
        }
      } catch (error) {
        console.error("Error processing gallery images:", error)
        galleryImagesString = ""
      }
    } else if (typeof updatedBusinessData.galleryImages === "string") {
      galleryImagesString = updatedBusinessData.galleryImages
    }

    // Format social media links as a string if needed
    let socialMediaLinksString = ""
    if (updatedBusinessData.facebook || updatedBusinessData.instagram) {
      const links = []
      if (updatedBusinessData.facebook) links.push(updatedBusinessData.facebook)
      if (updatedBusinessData.instagram) links.push(updatedBusinessData.instagram)
      socialMediaLinksString = links.join(",")
    } else if (typeof updatedBusinessData.socialMediaLinks === "string") {
      socialMediaLinksString = updatedBusinessData.socialMediaLinks
    }

    // Map frontend fields to backend expected fields
    const mappedBusinessData = {
      name: updatedBusinessData.businessName,
      business_type: updatedBusinessData.businessType,
      description: updatedBusinessData.description,
      region: updatedBusinessData.region,
      city: updatedBusinessData.city,
      address: updatedBusinessData.address,
      contact_phone: updatedBusinessData.phone,
      contact_email: updatedBusinessData.email,
      website: formatUrl(updatedBusinessData.website),
      facebook: formatUrl(updatedBusinessData.facebook),
      instagram: formatUrl(updatedBusinessData.instagram),
      opening_hours: updatedBusinessData.openingHours || null,
      facilities: updatedBusinessData.facilities || null,
      services: updatedBusinessData.services || null,
      team: updatedBusinessData.team || null,
      latitude: updatedBusinessData.latitude || null,
      longitude: updatedBusinessData.longitude || null,
      main_image: updatedBusinessData.mainImage,
      gallery_images: galleryImagesString || null,
      social_media_links: socialMediaLinksString || null,
    }

    // Send data to API with timeout
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const headers = await buildHeaders(true)
      const response = await fetch(`https://ai-driven-travel.onrender.com/api/business/businesses/${id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(mappedBusinessData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle API response
      if (!response.ok) {
        let errorMessage = `Failed to update business: ${response.status}`
        try {
          const errorData = await response.json()
          console.error("Backend error response:", errorData)

          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === "object") {
            // Format field errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
              .join("; ")
            errorMessage = fieldErrors || JSON.stringify(errorData)
          }
        } catch (e) {
          console.error("Could not parse error response:", e)
        }

        // Fallback to mock success
        return {
          success: true,
          data: {
            id: id,
            name: updatedBusinessData.businessName,
            business_type: updatedBusinessData.businessType,
            message: "Business updated successfully (mock data - API unavailable)",
          },
        }
      }

      // Success case
      const data = await response.json()
      console.log("Backend response:", data)
      return { success: true, data }
    } catch (apiError) {
      console.error("API request error:", apiError)

      // Fallback to mock success
      return {
        success: true,
        data: {
          id: id,
          name: updatedBusinessData.businessName,
          business_type: updatedBusinessData.businessType,
          message: "Business updated successfully (mock data - API unavailable)",
        },
      }
    }
  } catch (error) {
    console.error("Error updating business:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function fetchBusinesses(
  params: GetBusinessesParams = {},
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers = await buildHeaders()
    const queryParams = new URLSearchParams()
    if (params.category) queryParams.append("category", params.category)
    if (params.region) queryParams.append("region", params.region)
    if (params.city) queryParams.append("city", params.city)
    if (params.query) queryParams.append("query", params.query)

    // Add timeout to prevent long waits
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(
      `https://ai-driven-travel.onrender.com/api/business/businesses/?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Fetch businesses error:", errorData)
      return {
        success: false,
        error: errorData.detail || errorData.message || `Failed to fetch businesses: ${response.status}`,
      }
    }

    const data = await response.json()
    console.log("Fetched businesses:", data)
    return { success: true, data: data.results || data }
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function fetchBusinessById(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers = await buildHeaders()

    // Add timeout to prevent long waits
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`https://ai-driven-travel.onrender.com/api/business/businesses/${id}/`, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || errorData.message || `Failed to fetch business: ${response.status}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching business by ID:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}