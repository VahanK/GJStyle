import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for GJ Style website',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl mb-8">Privacy Policy</h1>

        <div className="prose prose-lg text-neutral-700 space-y-6">
          <p>
            GJ Style is committed to protecting your privacy. This policy outlines
            how we handle any information you may share with us.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Information We Collect</h2>
          <p>
            We only collect information that you voluntarily provide when contacting
            us via WhatsApp, email, or other communication channels. This may include
            your name, contact information, and inquiry details.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">How We Use Your Information</h2>
          <p>
            Information provided is used solely to respond to your inquiries, process
            orders, and communicate about our products and services. We do not sell
            or share your personal information with third parties.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Website Analytics</h2>
          <p>
            We may use analytics tools to understand how visitors interact with our
            website. This data is anonymous and used only to improve user experience.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our privacy practices, please contact us
            via WhatsApp or email.
          </p>

          <p className="text-sm text-neutral-500 mt-12">
            Last updated: {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  )
}
