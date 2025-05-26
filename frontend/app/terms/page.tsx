// pages/terms.tsx (or app/terms/page.tsx)
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
// import { AuthLayout } from "@/components/auth-layout"

export default function TermsOfServicePage() {
  return (
      <div>

      <div className="flex justify-center">
        <Link href="/" className="text-2xl font-bold text-[#0D2B3E]">
          Ethio<span className="text-[#E91E63]">Travel</span>
        </Link>
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-center">Terms of Service</h2>
      <p className="mt-2 text-sm text-muted-foreground text-center">
        Last updated: May 26, 2025
      </p>

      <div className="mt-8 max-w-3xl mx-auto prose prose-sm prose-headings:font-bold prose-headings:text-[#0D2B3E] prose-a:text-[#E91E63] prose-a:hover:text-[#D81B60]">
        <h3>1. Introduction</h3>
        <p>
          Welcome to EthioTravel. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, please do not use our services.
        </p>

        <h3>2. Use of Our Services</h3>
        <p>
          You must be at least 18 years old to use our services. You agree to provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
        </p>

        <h3>3. User Conduct</h3>
        <p>
          You agree not to use our services for any unlawful or prohibited activities. This includes, but is not limited to, uploading harmful content, violating intellectual property rights, or engaging in fraudulent activities.
        </p>

        <h3>4. Limitation of Liability</h3>
        <p>
          EthioTravel is not liable for any damages arising from the use of our services, including but not limited to direct, indirect, incidental, or consequential damages, unless otherwise specified by law.
        </p>

        <h3>5. Changes to These Terms</h3>
        <p>
          We may update these Terms from time to time. Changes will be posted on this page, and the "Last updated" date will be updated. Continued use of our services after changes constitutes acceptance of the new Terms.
        </p>

        <h3>6. Contact Us</h3>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:info@ethiotravel.com" className="text-[#E91E63] hover:underline">
            info@ethiotravel.com
          </a>{" "}
          or call us at +251 912 345 678.
        </p>

        <div className="mt-8">
          <Link href="/signup">
            <Button
              variant="outline"
              className="border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white"
            >
              Back to Signup
            </Button>
          </Link>
        </div>
      </div>
      </div>
   
  )
}