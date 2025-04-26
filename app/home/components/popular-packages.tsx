"use client"

import { useState } from "react"
import { default as NextImage } from "next/image"
import { PackageCard } from "./package-card"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export const PopularPackages = () => {
  const router = useRouter()
  const [packages, setPackages] = useState([
    {
      id: "mekele-package",
      title: "Mekele Package",
      location: "Tigray, Northern Ethiopia",
      price: "1,000 $",
      image: "/placeholder.svg?height=300&width=400&text=Lake+View",
      days: 7,
      people: 10,
      description:
        "Experience the rich culture and stunning landscapes of Tigray. Visit ancient rock-hewn churches, hike through dramatic mountains, and enjoy authentic local cuisine.",
    },
    {
      id: "semen-mountain-hiking",
      title: "Semen mountain hiking",
      location: "Amhara, Northern Ethiopia",
      price: "1,233 $",
      image: "/placeholder.svg?height=300&width=400&text=Mountain+Hiking",
      days: 5,
      people: 15,
      description:
        "Trek through the breathtaking Simien Mountains National Park, home to endemic wildlife like the Gelada baboon and Walia ibex. Experience stunning vistas and dramatic escarpments.",
    },
    {
      id: "axumi-package",
      title: "Axumi package",
      location: "Tigray, Northern Ethiopia",
      price: "1,233 $",
      image: "/placeholder.svg?height=300&width=400&text=Ancient+Ruins",
      days: 6,
      people: 10,
      description:
        "Discover the ancient Kingdom of Axum with its mysterious stelae, royal tombs, and historical palaces. Learn about Ethiopia's rich history and archaeological treasures.",
    },
  ])

  const handleReadMore = () => {
    router.push("/destinations/danakil-depression")
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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {packages.map((pkg, index) => (
            <motion.div key={pkg.id} variants={item}>
              <PackageCard {...pkg} />
            </motion.div>
          ))}
        </motion.div>

        {/* Trendy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 relative border-t border-b py-8"
        >
          <div className="absolute -left-4 bottom-0">
            <NextImage
              src="/placeholder.svg?height=100&width=100&text=Shell"
              alt="Shell Decoration"
              width={100}
              height={100}
            />
          </div>

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
                src="/placeholder.svg?height=150&width=150&text=Photos"
                alt="Travel Photos"
                width={150}
                height={150}
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
          <h2 className="text-2xl font-bold mb-4 text-[#0D2B3E]">
            Want to build your package?
            <br />
            but don't know how use our special
          </h2>

          <button
            className="mt-4 bg-[#E91E63] text-white px-6 py-3 rounded-full hover:bg-[#D81B60] transform hover:scale-105 transition-all duration-300"
            onClick={handleCreateTrip}
          >
            Create a new trip with AI
          </button>
        </motion.div>
      </div>
    </section>
  )
}
