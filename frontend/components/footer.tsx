"use client"

import type React from "react"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { Logo } from "@/components/logo"
import { ClientOnly } from "@/components/client-only"

const LinkComponent = ({
  href,
  className,
  children,
}: { href: string; className?: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#FCE4EC] text-gray-700 py-6 pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm">Your ultimate guide to traveling in Ethiopia</p>
            <div className="flex space-x-4 mt-6">
              <LinkComponent href="#" className="text-primary hover:text-primary/80 transition-colors">
                <ClientOnly>
                  <Facebook size={20} />
                </ClientOnly>
              </LinkComponent>
              <LinkComponent href="#" className="text-primary hover:text-primary/80 transition-colors">
                <ClientOnly>
                  <Twitter size={20} />
                </ClientOnly>
              </LinkComponent>
              <LinkComponent href="#" className="text-primary hover:text-primary/80 transition-colors">
                <ClientOnly>
                  <Instagram size={20} />
                </ClientOnly>
              </LinkComponent>
            </div>
          </div>

          
        {/* {part 2} */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <LinkComponent href="/about" className="text-sm hover:text-primary transition-colors">
                  About Us
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/packages" className="text-sm hover:text-primary transition-colors">
                  Tour Packages
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/destinations" className="text-sm hover:text-primary transition-colors">
                  Destinations
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/blog" className="text-sm hover:text-primary transition-colors">
                  Blog
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/events" className="text-sm hover:text-primary transition-colors">
                  Events
                </LinkComponent>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <LinkComponent href="/faq" className="text-sm hover:text-primary transition-colors">
                  FAQ
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/terms" className="text-sm hover:text-primary transition-colors">
                  Terms & Conditions
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/privacy" className="text-sm hover:text-primary transition-colors">
                  Privacy Policy
                </LinkComponent>
              </li>
              <li>
                <LinkComponent href="/contact" className="text-sm hover:text-primary transition-colors">
                  Contact Us
                </LinkComponent>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ClientOnly>
                  <MapPin className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                </ClientOnly>
                <span className="text-sm">123 Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center">
                <ClientOnly>
                  <Phone className="h-5 w-5 mr-2 text-primary shrink-0" />
                </ClientOnly>
                <span className="text-sm">+251 912 345 678</span>
              </li>
              <li className="flex items-center">
                <ClientOnly>
                  <Mail className="h-5 w-5 mr-2 text-primary shrink-0" />
                </ClientOnly>
                <span className="text-sm">info@ethiotravel.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-4">
          <p className="text-center text-sm">© {currentYear} EthioTravel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}