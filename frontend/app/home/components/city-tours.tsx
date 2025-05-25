"use client"

import { default as NextImage } from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export const CityTours = () => {
  const router = useRouter()

  const handleViewPackage = () => {
    router.push("/packages?category=city-tours")
  }

  const cityImages = [
    { label: "NEW", image: "/assets/irrechaa.jpg", name: "Festival" },
    { label: "NEW", image: "/assets/street.jpg", name: "Street" },
    { label: "NEW", image: "/assets/market.jpg", name: "Market" },
    { label: "NEW", image: "/assets/beach.jpg", name: "Beach" },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 mb-8 md:mb-0"
          >
            <div className="text-[#E91E63] text-sm font-medium mb-2">Promotion BY Axumite Tour Guide</div>
            <h2 className="text-3xl font-bold mb-4 text-[#0D2B3E]">We Provide You The Best Ethiopian City Tours</h2>
            <p className="text-gray-600 mb-6">
              Discover the vibrant cities of Ethiopia with our expert guides. From the bustling streets of Addis Ababa
              to the historic wonders of Gondar, our city tours offer an authentic glimpse into Ethiopian urban life,
              culture, and history.
            </p>
            <button
              className="bg-[#E91E63] text-white px-6 py-3 rounded-md hover:bg-[#D81B60] transform hover:scale-105 transition-all duration-300"
              onClick={handleViewPackage}
            >
              View package
            </button>

            <div className="grid grid-cols-2 gap-4 mt-20">
              {cityImages.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-lg overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => router.push(`/packages?search=${item.name}`)}
                >
                  <NextImage
                    src={item.image || "/placeholder.svg"}
                    alt={`Tour ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-auto group-hover:brightness-75 transition-all duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#E91E63] text-white text-xs px-2 py-1 rounded">
                    {item.label}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>




          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 md:pl-12"
          >
            <div className="relative">
              <div className="absolute -left-4 top-1/2 pt-20 pb-20 transform -translate-y-1/2 bg-[#E91E63]  text-white px-2 py-8 rounded-r-md flex flex-col items-center space-y-4 text-xs font-medium z-10">
                {/* <span className="m-1 transform -rotate-90">EVENTS</span>
                <span className=" m-1 transform -rotate-90">HIKING</span> */}
                <span className="transform -rotate-90 ">CITY TOURS</span>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <NextImage
                  src="/assets/sheger_night.jpg"
                  alt="Addis Ababa Night"
                  width={800}
                  height={600}
                  className="rounded-lg shadow-lg"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
