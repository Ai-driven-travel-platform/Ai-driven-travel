// pages/privacy.tsx (or app/privacy/page.tsx)
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
// import { AuthLayout } from "@/components/auth-layout"

export default function PrivacyPolicyPage() {
  return (
    <div>
      <div className="flex justify-center">
        <Link href="/" className="text-2xl font-bold text-[#0D2B3E]">
          Ethio<span className="text-[#E91E63]">Travel</span>
        </Link>
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-center">Privacy Policy</h2>
      <p className="mt-2 text-sm text-muted-foreground text-center">
        Last updated: May 26, 2025
      </p>

      <div className="mt-8 max-w-3xl mx-auto prose prose-sm prose-headings:font-bold prose-headings:text-[#0D2B3E] prose-a:text-[#E91E63] prose-a:hover:text-[#D81B60]">
        <h3>1. Introduction</h3>
        <p>
          At EthioTravel, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
        </p>

        <h3>2. Information We Collect</h3>
        <div>
          We may collect the following types of information:
          <ul>
            <li>
              <strong>Personal Information:</strong> Name, email address, and phone number provided during account creation or when contacting us.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you interact with our website, such as IP address, browser type, and pages visited.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies to enhance your experience. You can manage cookie preferences through your browser settings.
            </li>
          </ul>
        </div>

        <h3>3. How We Use Your Information</h3>
        <div>
          We use your information to:
          <ul>
            <li>Provide and manage your account.</li>
            <li>Improve our website and services.</li>
            <li>Respond to customer inquiries and provide support.</li>
            <li>Send updates and notifications related to your account.</li>
          </ul>
        </div>

        <h3>4. Sharing Your Information</h3>
        <div>
          We do not sell or share your personal information with third parties, except:
          <ul>
            <li>When required by law or to protect our rights.</li>
            <li>With service providers who assist in operating our website (e.g., hosting providers), under strict confidentiality agreements.</li>
          </ul>
        </div>

        <h3>5. Data Security</h3>
        <p>
          We implement reasonable security measures to protect your data. However, no online system is completely secure, and we cannot guarantee absolute security.
        </p>

        <h3>6. Your Rights</h3>
        <div>
          You have the right to:
          <ul>
            <li>Access, update, or delete your personal information.</li>
            <li>Opt out of marketing communications.</li>
            <li>
              Contact us to exercise these rights at{" "}
              <a href="mailto:info@ethiotravel.com" className="text-[#E91E63] hover:underline">
                info@ethiotravel.com
              </a>.
            </li>
          </ul>
        </div>

        <h3>7. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy periodically. Changes will be posted on this page, and the "Last updated" date will be updated. Continued use of our services after changes constitutes acceptance of the new policy.
        </p>

        <h3>8. Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
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