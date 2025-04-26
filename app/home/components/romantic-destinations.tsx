"use client"

import { default as NextImage } from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export const RomanticDestinations = () => {
  const router = useRouter()

  const handleViewPackages = () => {
    router.push("/packages?category=honeymoon")
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 mb-8 md:mb-0 relative"
          >
            <div className="relative">
              <motion.div
                className="w-64 h-64 rounded-full overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <NextImage
                  src="/placeholder.svg?height=400&width=400&text=Waterfall"
                  alt="Waterfall"
                  width={400}
                  height={400}
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full overflow-hidden border-4 border-white"
                initial={{ x: 20, y: 20, opacity: 0 }}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
              >
                <NextImage
                  src="/placeholder.svg?height=100&width=100&text=Flower"
                  alt="Flower"
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-12 left-12 w-32 h-32 rounded-full overflow-hidden border-4 border-white"
                initial={{ x: -20, y: -20, opacity: 0 }}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
              >
                <NextImage
                  src="/placeholder.svg?height=150&width=150&text=Lake"
                  alt="Lake"
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 md:pl-12"
          >
            <div className="text-[#E91E63] text-sm font-medium uppercase mb-2">
              HONEYMOON SPECIALS BY EYOB YOUR GUIDE
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Romantic Tropical Destinations</h2>
            <p className="text-gray-600 mb-6">
              Experience the magic of Ethiopia with your loved one. Our romantic getaways feature stunning landscapes,
              luxurious accommodations, and intimate experiences designed specifically for couples. From serene lakeside
              retreats to breathtaking mountain views, create memories that will last a lifetime.
            </p>
            <motion.button
              className="bg-[#E91E63] text-white px-6 py-3 rounded-full hover:bg-[#D81B60] transform hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewPackages}
            >
              View Packages
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
