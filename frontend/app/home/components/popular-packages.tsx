"use client"

import { useEffect, useState } from "react"
import { default as NextImage } from "next/image"
import { PackageCard } from "./package-card"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getPackages, type PackageData } from "@/app/actions/package-actions"

export const PopularPackages = () => {
  const router = useRouter()
  const [packages, setPackages] = useState<PackageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true)
      try {
        // Fetch featured packages from the backend
        const data = await getPackages({ featured: true })
        setPackages(data.slice(0, 3)) // Get the first 3 packages
      } catch (error) {
        console.error("Error fetching packages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const handleReadMore = () => {
    router.push("/blog")
  }

  const handleCreateTrip = () => {
    router.push("/trip-planner")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Transform backend package data to match the format expected by PackageCard
  const transformedPackages = packages.map((pkg) => ({
    id: pkg.id.toString(),
    title: pkg.title,
    location: `${pkg.location}, ${pkg.region}`,
    price: pkg.price,
    image: pkg.image || "/placeholder.svg?height=300&width=400&text=Package+Image",
    days: pkg.duration_in_days,
    people: pkg.max_group_size,
    description: pkg.short_description,
  }))

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-8 text-[#0D2B3E]">Popular package</h2>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="rounded-lg bg-gray-100 animate-pulse h-[400px]"></div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {transformedPackages.length > 0 ? (
              transformedPackages.map((pkg, index) => (
                <motion.div key={pkg.id} variants={item}>
                  <PackageCard {...pkg} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No featured packages available at the moment.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Trendy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 relative border-t border-b py-8"
        >
          {/* <div className="absolute -left-4 ml-10  bottom-0">
            <NextImage src="/assets/ethio_shell.jpg" alt="Shell Decoration" width={100} height={100} />
          </div> */}

          <div className="border-2 border-dashed border-[#E91E63] rounded-lg p-8 text-center max-w-3xl mx-auto relative hover:border-solid transition-all duration-300">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-white px-4">
                <span className="text-[#E91E63] text-sm font-medium uppercase">TRENDY</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-[#0D2B3E]">
              Do You know Danakil Depression is the lowest place in Africa?
            </h2>

            <div className="absolute -right-4 -top-8">
              <NextImage
                src="/assets/travel4.jpg"
                alt="Travel Photos"
                width={100}
                height={100}
                className="transform hover:rotate-3 transition-transform duration-300"
              />
            </div>

            <button
              className="mt-4 border-2 border-[#E91E63] text-[#E91E63] px-6 py-2 rounded-full hover:bg-[#E91E63] hover:text-white transition-colors"
              onClick={handleReadMore}
            >
              Read More
            </button>
          </div>
        </motion.div>

        {/* Build Package Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          {/* <h2 className="text-2xl font-bold mb-4 text-[#0D2B3E]">
            Want to build your package?
            <br />
            but don't know how use our special
          </h2> */}

          {/* <button
            className="mt-4 bg-[#E91E63] text-white px-6 py-3 rounded-full hover:bg-[#D81B60] transform hover:scale-105 transition-all duration-300"
            onClick={handleCreateTrip}
          >
            Create a new trip with AI
          </button> */}
        </motion.div>
      </div>
    </section>
  )
}
