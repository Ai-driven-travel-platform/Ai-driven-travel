import { Container } from "@/components/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative w-full h-[300px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image src="/assets/bishoftu.jpg" alt="Ethiopian Businesses" fill className="object-cover" priority />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiPjwvcmVjdD4KPC9zdmc+')] opacity-10" />
      </div>

      <Container className="relative h-full flex flex-col justify-center items-center text-center z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg max-w-3xl">
          Discover Ethiopian Businesses
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl drop-shadow">
          Find the best local businesses, restaurants, hotels, and services across Ethiopia
        </p>
      
      </Container>
    </div>
  )
}
