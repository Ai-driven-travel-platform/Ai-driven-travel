"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"

export function CTASection() {
  const router = useRouter()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const handleSignUp = () => {
    router.push("/signup")
  }

  const handleExploreHomepage = () => {
    router.push("/home")
  }

  return (
    <motion.section
      className="py-16 bg-gray-50"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl font-bold mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ready to start your Ethiopian adventure?
        </motion.h2>
        <motion.p
          className="text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Sign up now to access exclusive deals, personalized recommendations, and start planning your dream trip to
          Ethiopia.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button onClick={handleSignUp} className="bg-[#E91E63] hover:bg-[#D81B60] text-white px-8 py-6 rounded-full">
            Sign Up Now
          </Button>
          {/* <Button
            onClick={handleExploreHomepage}
            variant="outline"
            className="border border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white px-8 py-6 rounded-full transition-colors"
          >
            Explore Homepage
          </Button> */}
        </motion.div>
      </div>
    </motion.section>
  )
}
