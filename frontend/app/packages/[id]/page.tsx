"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Info, MapPin, Calendar, Star, Users, Clock, Share2, Heart, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { getPackageById, getPackageReviews } from "@/app/actions/package-actions"
import { PackageReviewList } from "../components/package-review-list"
import { PackageReviewForm } from "../components/package-review-form"
import type { PackageData, ReviewData } from "@/app/actions/package-actions"

// Import the shared Map component
const Map = dynamic(() => import('@/components/map').then((mod) => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg overflow-hidden">
      <div className="w-full h-full bg-gray-100 animate-pulse" />
    </div>
  ),
})

const startPayment = () => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer CHASECK_TEST-j6crqyUVt6jnIMscbzwTxllMZNnYCi5N");
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    "amount": "10"
  });

  fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: 'POST',
    mode: 'no-cors',
    headers: myHeaders,
    body: raw,
  })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('the error', error));

}
export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [packageDetail, setPackageDetail] = useState<PackageData | null>(null)
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Unwrap params using React.use to resolve the Promise
  const { id: packageId } = React.use(params)

  // Fetch package details
  useEffect(() => {
    if (!packageId) {
      console.warn("No package ID provided in params")
      setLoading(false)
      return
    }

    const fetchPackageDetail = async () => {
      setLoading(true)
      try {
        const [packageData, reviewsData] = await Promise.all([
          getPackageById(packageId),
          getPackageReviews(packageId),
        ])

        if (packageData) {
          setPackageDetail(packageData)
        }

        setReviews(reviewsData || [])
      } catch (error) {
        console.error("Error fetching package details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackageDetail()
  }, [packageId])

  const handleBookNow = () => {
    if (!selectedDate) return

    console.log("Booking submitted:", {
      packageId,
      date: selectedDate,
      adults,
      children,
    })

    startPayment()

    setBookingSuccess(true)

    setTimeout(() => {
      setBookingSuccess(false)
      setSelectedDate(undefined)
      setAdults(2)
      setChildren(0)
    }, 3000)
  }

  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    console.log("Inquiry submitted")

    setInquirySuccess(true)

    setTimeout(() => {
      setInquirySuccess(false)
      e.currentTarget.reset()
    }, 3000)
  }

  const handleShare = () => {
    alert("Share functionality would open here")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleViewLarger = (image: string) => {
    setSelectedImage(image)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E91E63]"></div>
      </div>
    )
  }

  if (!packageDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Package Not Found</h2>
          <p className="text-gray-600 mb-6">The package you're looking for doesn't exist or has been removed.</p>
          <Link href="/packages">
            <Button className="bg-[#E91E63] hover:bg-[#D81B60]">Back to Packages</Button>
          </Link>
        </div>
      </div>
    )
  }

  const displayPrice = packageDetail.discounted_price || packageDetail.price
  const hasDiscount = packageDetail.discounted_price && packageDetail.discounted_price !== packageDetail.price

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `url('${packageDetail.image || "/placeholder.svg?height=600&width=1200&text=Tour+Package"}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/" className="text-white hover:text-[#E91E63] transition-colors">
                Home
              </Link>
              <span className="text-white">/</span>
              <Link href="/packages" className="text-white hover:text-[#E91E63] transition-colors">
                Packages
              </Link>
              <span className="text-white">/</span>
              <span className="text-[#E91E63]">{packageDetail.title}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{packageDetail.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {packageDetail.location}, {packageDetail.region}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{packageDetail.duration}</span>
              </div>
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(Number(packageDetail.rating))
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1">
                  {packageDetail.rating} ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Detail Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="information" className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-auto">
                  <TabsTrigger
                    value="information"
                    className="py-4 data-[state=active]:bg-[#E91E63] data-[state=active]:text-white"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="tourPlan"
                    className="py-4 data-[state=active]:bg-[#E91E63] data-[state=active]:text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Tour Plan
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="py-4 data-[state=active]:bg-[#E91E63] data-[state=active]:text-white"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="py-4 data-[state=active]:bg-[#E91E63] data-[state=active]:text-white"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Gallery
                  </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                  <TabsContent value="information" className="mt-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-2xl font-bold mb-4">Tour Details</h2>
                      <p className="text-gray-700 whitespace-pre-line mb-6">{packageDetail.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Tour Information</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <span className="bg-[#E91E63] p-1 rounded-full text-white mr-2 mt-0.5">
                                <MapPin className="h-4 w-4" />
                              </span>
                              <div>
                                <span className="font-medium">Departure Point:</span>
                                <p className="text-gray-600">{packageDetail.departure}</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-[#E91E63] p-1 rounded-full text-white mr-2 mt-0.5">
                                <Clock className="h-4 w-4" />
                              </span>
                              <div>
                                <span className="font-medium">Departure Time:</span>
                                <p className="text-gray-600">{packageDetail.departure_time}</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-[#E91E63] p-1 rounded-full text-white mr-2 mt-0.5">
                                <Clock className="h-4 w-4" />
                              </span>
                              <div>
                                <span className="font-medium">Return Time:</span>
                                <p className="text-gray-600">{packageDetail.return_time}</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-[#E91E63] p-1 rounded-full text-white mr-2 mt-0.5">
                                <Users className="h-4 w-4" />
                              </span>
                              <div>
                                <span className="font-medium">Tour Guide:</span>
                                <p className="text-gray-600">{packageDetail.tour_guide}</p>
                              </div>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">What's Included</h3>
                          <ul className="space-y-1 mb-4">
                            {packageDetail.included.map((item, index) => (
                              <li key={index} className="flex items-center text-gray-700">
                                <svg
                                  className="h-5 w-5 text-green-500 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>

                          <h3 className="text-lg font-semibold mb-3">Not Included</h3>
                          <ul className="space-y-1">
                            {packageDetail.not_included.map((item, index) => (
                              <li key={index} className="flex items-center text-gray-700">
                                <svg
                                  className="h-5 w-5 text-red-500 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <Button
                          onClick={() => router.push("/packages")}
                          variant="outline"
                          className="border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white"
                        >
                          Back to Packages
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-[#E91E63] hover:bg-[#D81B60]">Send Inquiry</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Send Inquiry</DialogTitle>
                              <DialogDescription>
                                Have questions about this tour? Send us an inquiry and we'll get back to you as soon as
                                possible.
                              </DialogDescription>
                            </DialogHeader>

                            {inquirySuccess ? (
                              <div className="py-6 text-center">
                                <svg
                                  className="mx-auto h-12 w-12 text-green-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">Inquiry Sent!</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  We've received your inquiry and will respond shortly.
                                </p>
                              </div>
                            ) : (
                              <form onSubmit={handleInquirySubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="first-name">First name</Label>
                                    <Input id="first-name" required />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="last-name">Last name</Label>
                                    <Input id="last-name" required />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="message">Your message</Label>
                                  <Textarea id="message" required />
                                </div>
                                <DialogFooter>
                                  <Button type="submit" className="w-full bg-[#E91E63] hover:bg-[#D81B60]">
                                    Send Inquiry
                                  </Button>
                                </DialogFooter>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tourPlan" className="mt-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-2xl font-bold mb-6">Tour Plan</h2>

                      <div className="space-y-8">
                        {packageDetail.itinerary.map((day, index) => (
                          <div key={index} className="relative pl-8 pb-8 border-l-2 border-[#E91E63] last:pb-0">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-[#E91E63]"></div>
                            <div className="mb-2">
                              <span className="inline-block px-3 py-1 bg-[#E91E63] text-white text-sm rounded-full mb-2">
                                Day {index + 1}
                              </span>
                              <h3 className="text-xl font-bold">{day.split(":")[0]}</h3>
                            </div>
                            <p className="text-gray-700">
                              {day.includes(":") ? day.split(":").slice(1).join(":").trim() : day}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-2">Important Notes:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>
                            The tour itinerary may be adjusted due to local conditions, weather, or other factors.
                          </li>
                          <li>Minimum age requirement: {packageDetail.min_age} years</li>
                          <li>Difficulty level: {packageDetail.difficulty}</li>
                          <li>Maximum group size: {packageDetail.max_group_size} people</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="mt-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-2xl font-bold mb-6">Location</h2>

                      <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
                        {packageDetail && (
                          <Map 
                            address={packageDetail.location}
                            location={packageDetail.region}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">About {packageDetail.location}</h3>
                          <p className="text-gray-700 mb-4">{packageDetail.short_description}</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Getting There</h3>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-[#E91E63] mr-2 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <div>
                                <span className="font-medium">Departure Point:</span>
                                <p className="text-gray-600">{packageDetail.departure}</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-[#E91E63] mr-2 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <div>
                                <span className="font-medium">Languages:</span>
                                <p className="text-gray-600">{packageDetail.languages.join(", ")}</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-[#E91E63] mr-2 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <div>
                                <span className="font-medium">Tour Package:</span>
                                <p className="text-gray-600">
                                  This tour includes transportation from {packageDetail.departure}.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          onClick={() =>
                            window.open(
                              `https://maps.google.com/?q=${packageDetail.location},${packageDetail.region}`,
                              "_blank",
                            )
                          }
                          className="bg-[#E91E63] hover:bg-[#D81B60]"
                        >
                          View on Google Maps
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="gallery" className="mt-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-2xl font-bold mb-6">Gallery</h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {packageDetail.gallery_images && packageDetail.gallery_images.length > 0 ? (
                          packageDetail.gallery_images.map((image, index) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                              <Image
                                src={image || "/placeholder.svg"}
                                alt={`Gallery image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-white border-white hover:bg-white hover:text-black"
                                      onClick={() => handleViewLarger(image)}
                                    >
                                      View Larger
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl p-0">
                                    <DialogHeader className="p-4">
                                      <DialogTitle>Gallery Image</DialogTitle>
                                      <DialogDescription>View the full-size image below.</DialogDescription>
                                    </DialogHeader>
                                    <div className="relative w-full h-[60vh]">
                                      <Image
                                        src={selectedImage || "/placeholder.svg"}
                                        alt="Full-size gallery image"
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    <DialogFooter className="p-4">
                                      <DialogClose asChild>
                                        <Button variant="outline">Close</Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 text-center py-10">
                            <p className="text-gray-500">No gallery images available for this package.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Reviews Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                <PackageReviewList reviews={reviews} />

                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                  <PackageReviewForm packageId={packageId} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  {hasDiscount ? (
                    <div>
                      <h3 className="text-2xl font-bold text-[#E91E63]">${packageDetail.discounted_price}</h3>
                      <span className="text-gray-500 line-through">${packageDetail.price}</span>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold text-[#E91E63]">${packageDetail.price}</h3>
                  )}
                  <span className="text-gray-500">/ Per Person</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-300 focus:ring-2 focus:ring-[#E91E63]"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => setSelectedDate(date)}
                          initialFocus
                          disabled={(date) => {
                            // Get today's date at midnight
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            
                            // Disable dates before today
                            return date < today
                          }}
                          fromDate={new Date()} // Set minimum date to today
                          toDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} // Allow booking up to 1 year in advance
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-1">
                        Adults
                      </Label>
                      <div className="flex">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-r-none"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                        >
                          -
                        </Button>
                        <Input
                          id="adults"
                          type="number"
                          min="1"
                          value={adults}
                          onChange={(e) => setAdults(Number.parseInt(e.target.value) || 1)}
                          className="rounded-none text-center w-12 p-0 border-l-0 border-r- SMOOTH0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-l-none"
                          onClick={() => setAdults(adults + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-1">
                        Children
                      </Label>
                      <div className="flex">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-r-none"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                        >
                          -
                        </Button>
                        <Input
                          id="children"
                          type="number"
                          min="0"
                          value={children}
                          onChange={(e) => setChildren(Number.parseInt(e.target.value) || 0)}
                          className="rounded-none text-center w-12 p-0 border-l-0 border-r-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-l-none"
                          onClick={() => setChildren(children + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      Adults ({adults} × ${displayPrice})
                    </span>
                    <span className="font-medium">${adults * Number(displayPrice)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      Children ({children} × ${Number(displayPrice) / 2})
                    </span>
                    <span className="font-medium">${children * (Number(displayPrice) / 2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">$50</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-[#E91E63]">
                    ${adults * Number(displayPrice) + children * (Number(displayPrice) / 2) + 50}
                  </span>
                </div>

                {bookingSuccess ? (
                  <div className="text-center py-4">
                    <svg
                      className="mx-auto h-12 w-12 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Booking Successful!</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your booking has been confirmed. Check your email for details.
                    </p>
                  </div>
                ) : (
                  <div className="w-full bg-[#E91E63] flex items-center justify-center hover:bg-[#D81B60] text-white py-3 rounded-md">
                    <a href="https://checkout.chapa.co/checkout/payment/6o8Oye0nma1ZVxN6eTh1Ve5dn6nZfpRoITvb7nJp6KSZd">Book Now</a>
                 
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-[#E91E63]"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 mr-1 ${isFavorite ? "fill-[#E91E63] text-[#E91E63]" : ""}`} />
                    {isFavorite ? "Saved" : "Save"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-[#E91E63]"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 mr-1" />
                    Share
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-[#E91E63]"
                    onClick={handlePrint}
                  >
                    <Printer className="h-5 w-5 mr-1" />
                    Print
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our travel experts are ready to assist you with any questions about this tour.
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#E91E63] flex items-center justify-center text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Call us at</p>
                    <p className="font-medium">+251 912 345 678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-[#E91E63] flex items-center justify-center text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email us at</p>
                    <p className="font-medium">info@ethiotravel.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tours Section */}
      {/* <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=300&width=400&text=Related+Tour+${id}`}
                    alt={`Related Tour ${id}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 hover:text-[#E91E63] transition-colors">
                    {id === 1
                      ? "Simien Mountains Trek"
                      : id === 2
                        ? "Omo Valley Cultural Tour"
                        : "Danakil Depression Adventure"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {id === 1 ? "Gondar, Amhara" : id === 2 ? "Omo Valley, SNNPR" : "Afar Region"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#E91E63] font-bold">${id === 1 ? "850" : id === 2 ? "750" : "950"}</span>
                    <span className="text-xs text-gray-500">
                      {id === 1 ? "6 days" : id === 2 ? "5 days" : "4 days"}
                    </span>
                  </div>
                  <Link href={`/packages/${id + 10}`} className="block mt-4">
                    <Button className="w-full bg-[#E91E63] hover:bg-[#D81B60]">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  )
}