"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Container } from "@/components/container"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { registerBusiness, type BusinessData as OriginalBusinessData } from "@/app/actions/business-actions"

interface BusinessData extends OriginalBusinessData {
  termsAccepted: boolean
}
import { Progress } from "@/components/ui/progress"

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

const cities: Record<string, string[]> = {
  "Addis Ababa": ["Addis Ababa"],
  Amhara: ["Bahir Dar", "Gondar", "Lalibela", "Dessie"],
  Tigray: ["Mekelle", "Axum", "Adwa"],
  Oromia: ["Adama", "Jimma", "Nekemte"],
  Sidama: ["Hawassa"],
  "Southern Nations, Nationalities, and Peoples": ["Arba Minch", "Sodo", "Dilla"],
  Somali: ["Jijiga"],
  Afar: ["Semera"],
  "Benishangul-Gumuz": ["Assosa"],
  Gambela: ["Gambela"],
  Harari: ["Harar"],
  "Dire Dawa": ["Dire Dawa"],
}

export default function RegisterBusinessPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryImagesInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<BusinessData>>({
    businessName: "",
    businessType: "",
    description: "",
    region: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    openingHours: "",
    facilities: "",
    services: "",
    team: "",
    latitude: "",
    longitude: "",
    socialMediaLinks: "",
    termsAccepted: false, // Custom field for form
  })

  const handleChange = (field: keyof BusinessData | "termsAccepted", value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    if (field === "region") {
      setSelectedRegion(value as string)
      setFormData((prev) => ({
        ...prev,
        city: "",
      }))
    }
  }

  const generateImagePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      // Show a toast to indicate compression is happening
      toast({
        title: "Processing image",
        description: "Optimizing image for upload...",
      })

      // Import the compression function dynamically to reduce initial load time
      const { compressImage } = await import("@/lib/upload-file")
      const compressedFile = await compressImage(file)

      setMainImage(compressedFile)

      // Generate preview from compressed image
      const preview = await generateImagePreview(compressedFile)
      setMainImagePreview(preview)

      toast({
        title: "Image ready",
        description: `Image optimized from ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)}`,
      })
    } catch (error) {
      console.error("Error processing image:", error)
      // Fall back to original file if compression fails
      setMainImage(file)

      try {
        const preview = await generateImagePreview(file)
        setMainImagePreview(preview)
      } catch (previewError) {
        console.error("Error creating preview:", previewError)
        toast({
          title: "Preview generation failed",
          description: "Could not generate image preview, but upload will still work.",
          variant: "default",
        })
      }
    }
  }

  // Add this helper function for formatting file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Similarly, update the handleGalleryImagesChange function to use compression
  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: File[] = []
    const invalidFiles: string[] = []
    const largeFiles: string[] = []

    // First validate all files
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(file.name)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        largeFiles.push(file.name)
        return
      }

      newFiles.push(file)
    })

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: `${invalidFiles.join(", ")} ${invalidFiles.length > 1 ? "are" : "is"} not an image file.`,
        variant: "destructive",
      })
    }

    if (largeFiles.length > 0) {
      toast({
        title: "Files too large",
        description: `${largeFiles.join(", ")} ${largeFiles.length > 1 ? "are" : "is"} larger than 5MB.`,
        variant: "destructive",
      })
    }

    if (newFiles.length === 0) return

    // Show processing toast
    toast({
      title: "Processing images",
      description: `Optimizing ${newFiles.length} images for upload...`,
    })

    try {
      // Import compression function
      const { compressImage } = await import("@/lib/upload-file")

      // Compress all valid files
      const compressPromises = newFiles.map((file) => compressImage(file))
      const compressedFiles = await Promise.all(compressPromises)

      // Update gallery images state
      const updatedGalleryImages = [...galleryImages, ...compressedFiles].slice(0, 10)
      setGalleryImages(updatedGalleryImages)

      // Generate previews
      const previews = await Promise.all(updatedGalleryImages.map((file) => generateImagePreview(file)))
      setGalleryImagePreviews(previews)

      toast({
        title: "Images ready",
        description: `${compressedFiles.length} images optimized and ready for upload`,
      })
    } catch (error) {
      console.error("Error processing images:", error)

      // Fall back to original files if compression fails
      const updatedGalleryImages = [...galleryImages, ...newFiles].slice(0, 10)
      setGalleryImages(updatedGalleryImages)

      try {
        const previews = await Promise.all(updatedGalleryImages.map((file) => generateImagePreview(file)))
        setGalleryImagePreviews(previews)
      } catch (previewError) {
        console.error("Error creating previews:", previewError)
        toast({
          title: "Preview generation partially failed",
          description: "Some image previews could not be generated, but uploads will still work.",
          variant: "default",
        })
      }
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
    setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.businessName?.trim()) errors.businessName = "Business name is required"
    if (!formData.businessType) errors.businessType = "Business type is required"
    if (!formData.description?.trim()) errors.description = "Description is required"
    if (!formData.region) errors.region = "Region is required"
    if (!formData.city) errors.city = "City is required"
    if (!formData.address?.trim()) errors.address = "Address is required"
    if (!formData.phone?.trim()) errors.phone = "Phone number is required"
    if (!formData.email?.trim()) errors.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format"
    if (!mainImage) errors.mainImage = "Main image is required"
    if (!formData.termsAccepted) errors.termsAccepted = "You must accept the terms and conditions"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Update the handleSubmit function to better handle image validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Form validation failed",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setUploadProgress(10)

      // Show a more detailed toast for the upload process
      const uploadToastId = toast({
        title: "Uploading business data",
        description: "Starting image uploads...",
        duration: 30000, // Longer duration since this is a longer process
      })

      // Create a progress updater function
      const updateProgress = (stage: string, progress: number) => {
        // Map progress to different stages
        let totalProgress = 0
        if (stage === "preparing") {
          totalProgress = 10 + progress * 0.1 // 10-20%
        } else if (stage === "uploading") {
          totalProgress = 20 + progress * 0.6 // 20-80%
        } else if (stage === "finalizing") {
          totalProgress = 80 + progress * 0.2 // 80-100%
        }

        setUploadProgress(Math.round(totalProgress))

        // Update the toast message
        toast({
          title: "Uploading business data",
          description: `${
            stage === "preparing"
              ? "Preparing images..."
              : stage === "uploading"
                ? "Uploading images..."
                : "Finalizing registration..."
          }`,
          duration: 30000,
        })
      }

      // Prepare the business data
      updateProgress("preparing", 50)

      // Ensure we have a valid main image before proceeding
      if (!mainImage) {
        toast({
          title: "Image required",
          description: "Please upload a main image for your business",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const businessData: BusinessData = {
        businessName: formData.businessName!,
        businessType: formData.businessType!,
        description: formData.description!,
        region: formData.region!,
        city: formData.city!,
        address: formData.address!,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        facebook: formData.facebook || undefined,
        instagram: formData.instagram || undefined,
        openingHours: formData.openingHours || undefined,
        facilities: formData.facilities || undefined,
        services: formData.services || undefined,
        team: formData.team || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        socialMediaLinks: [formData.facebook, formData.instagram].filter(Boolean).join(",") || undefined,
        mainImage: mainImage!, // File object
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined, // File[] or undefined
        termsAccepted: formData.termsAccepted ?? false, // Ensure termsAccepted is included
        id: "", // Provide a default or generated value for id
      }

      updateProgress("preparing", 100)
      updateProgress("uploading", 0)

      // Set up progress tracking with periodic updates
      let uploadProgressCounter = 0
      const progressInterval = setInterval(() => {
        uploadProgressCounter += 5
        if (uploadProgressCounter <= 100) {
          updateProgress("uploading", uploadProgressCounter)
        } else {
          clearInterval(progressInterval)
        }
      }, 500)

      console.log("Submitting business data:", businessData)

      // Submit the business data
      const result = await registerBusiness(businessData)

      // Clear the progress interval
      clearInterval(progressInterval)

      // Complete the progress
      updateProgress("finalizing", 100)
      setUploadProgress(100)

      // Dismiss the upload toast
      if (uploadToastId && typeof uploadToastId.dismiss === "function") {
        uploadToastId.dismiss()
      }

      if (result.success) {
        toast({
          title: "Business registered",
          description: "Your business has been registered successfully.",
        })

        // Add a small delay before redirecting to ensure toast is seen
        setTimeout(() => {
          router.push("/business/register/success")
        }, 1500)
      } else {
        console.error("Registration error:", result.error)
        toast({
          title: "Registration failed",
          description: result.error || "Failed to register business. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error registering business:", error)
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "basic") {
      const basicErrors: Record<string, string> = {}
      if (!formData.businessName?.trim()) basicErrors.businessName = "Business name is required"
      if (!formData.businessType) basicErrors.businessType = "Business type is required"
      if (!formData.description?.trim()) basicErrors.description = "Description is required"

      if (Object.keys(basicErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...basicErrors }))
        return
      }
      setActiveTab("contact")
    } else if (activeTab === "contact") {
      const contactErrors: Record<string, string> = {}
      if (!formData.region) contactErrors.region = "Region is required"
      if (!formData.city) contactErrors.city = "City is required"
      if (!formData.address?.trim()) contactErrors.address = "Address is required"
      if (!formData.phone?.trim()) contactErrors.phone = "Phone number is required"
      if (!formData.email?.trim()) contactErrors.email = "Email is required"
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) contactErrors.email = "Invalid email format"

      if (Object.keys(contactErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...contactErrors }))
        return
      }
      setActiveTab("additional")
    }
  }

  const prevTab = () => {
    if (activeTab === "additional") setActiveTab("contact")
    else if (activeTab === "contact") setActiveTab("basic")
  }

  return (
    <Container className="py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Business</h1>
          <p className="text-gray-600">Join our directory and reach thousands of travelers exploring Ethiopia</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Fill out the form below to register your business. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="register-form" onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="contact">Contact & Location</TabsTrigger>
                  <TabsTrigger value="additional">Additional Details</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">
                      Business Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      placeholder="Enter your business name"
                      className={formErrors.businessName ? "border-red-500" : ""}
                    />
                    {formErrors.businessName && <p className="text-sm text-red-500">{formErrors.businessName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">
                      Business Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => handleChange("businessType", value)}
                    >
                      <SelectTrigger id="businessType" className={formErrors.businessType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.businessType && <p className="text-sm text-red-500">{formErrors.businessType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe your business (services, unique features, etc.)"
                      className={`min-h-[120px] ${formErrors.description ? "border-red-500" : ""}`}
                    />
                    {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mainImage">
                      Main Image <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => mainImageInputRef.current?.click()}
                        className={`flex items-center gap-2 ${formErrors.mainImage ? "border-red-500" : ""}`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        id="mainImage"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                      {mainImagePreview && (
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                          <img
                            src={mainImagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMainImage(null)
                              setMainImagePreview(null)
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {formErrors.mainImage && <p className="text-sm text-red-500">{formErrors.mainImage}</p>}
                    <p className="text-xs text-gray-500">Recommended size: 1200x800px, Max size: 5MB</p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">
                        Region <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.region} onValueChange={(value) => handleChange("region", value)}>
                        <SelectTrigger id="region" className={formErrors.region ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.region && <p className="text-sm text-red-500">{formErrors.region}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => handleChange("city", value)}
                        disabled={!selectedRegion}
                      >
                        <SelectTrigger id="city" className={formErrors.city ? "border-red-500" : ""}>
                          <SelectValue placeholder={selectedRegion ? "Select city" : "Select region first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRegion &&
                            cities[selectedRegion]?.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {formErrors.city && <p className="text-sm text-red-500">{formErrors.city}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Street address"
                      className={formErrors.address ? "border-red-500" : ""}
                    />
                    {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => handleChange("latitude", e.target.value)}
                        placeholder="e.g., 9.0222"
                      />
                      <p className="text-xs text-gray-500">Optional - for map location</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => handleChange("longitude", e.target.value)}
                        placeholder="e.g., 38.7468"
                      />
                      <p className="text-xs text-gray-500">Optional - for map location</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="e.g., +251 11 123 4567"
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="e.g., info@yourbusiness.com"
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="e.g., https://www.yourbusiness.com"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab} disabled={isSubmitting}>
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => handleChange("facebook", e.target.value)}
                        placeholder="e.g., https://facebook.com/yourbusiness"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleChange("instagram", e.target.value)}
                        placeholder="e.g., https://instagram.com/yourbusiness"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openingHours">Opening Hours</Label>
                    <Input
                      id="openingHours"
                      value={formData.openingHours}
                      onChange={(e) => handleChange("openingHours", e.target.value)}
                      placeholder="e.g., Monday-Friday: 9AM-5PM, Saturday: 10AM-3PM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facilities">Facilities</Label>
                    <Input
                      id="facilities"
                      value={formData.facilities}
                      onChange={(e) => handleChange("facilities", e.target.value)}
                      placeholder="e.g., Wi-Fi, Parking, Restaurant, Pool"
                    />
                    <p className="text-xs text-gray-500">Separate with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services">Services</Label>
                    <Textarea
                      id="services"
                      value={formData.services}
                      onChange={(e) => handleChange("services", e.target.value)}
                      placeholder="List the services your business offers"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Textarea
                      id="team"
                      value={formData.team}
                      onChange={(e) => handleChange("team", e.target.value)}
                      placeholder="Information about your team (optional)"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="galleryImages">Gallery Images</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => galleryImagesInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Add Gallery Images
                      </Button>
                      <input
                        ref={galleryImagesInputRef}
                        type="file"
                        id="galleryImages"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500">{galleryImages.length}/10 images selected</p>
                    </div>
                    {galleryImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                        {galleryImagePreviews.map((preview, index) => (
                          <div key={index} className="relative h-20 w-full rounded-md overflow-hidden border">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Gallery ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Max 10 images, 5MB each</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleChange("termsAccepted", checked === true)}
                      className={formErrors.termsAccepted ? "border-red-500" : ""}
                    />
                    <label
                      htmlFor="terms"
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        formErrors.termsAccepted ? "text-red-500" : ""
                      }`}
                    >
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        terms and conditions
                      </a>
                    </label>
                  </div>
                  {formErrors.termsAccepted && <p className="text-sm text-red-500">{formErrors.termsAccepted}</p>}

                  {isSubmitting && (
                    <div className="space-y-2">
                      <p className="text-sm">Processing... {uploadProgress}%</p>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab} disabled={isSubmitting}>
                      Previous
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register Business"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
          <CardFooter className="border-t pt-6 flex flex-col space-y-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Note:</span> All businesses will be reviewed before being published in our
              directory. This process typically takes 1-2 business days.
            </p>
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@ethiotravel.com" className="text-primary hover:underline">
                support@ethiotravel.com
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Container>
  )
}
