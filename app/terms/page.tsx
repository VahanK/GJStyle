import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for GJ Style website',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl mb-8">Terms of Use</h1>

        <div className="prose prose-lg text-neutral-700 space-y-6">
          <p>
            Welcome to GJ Style. By accessing and using our website, you agree to comply
            with and be bound by the following terms and conditions.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Use of Website</h2>
          <p>
            This website is for informational purposes only. The content displayed,
            including images and text, is the property of GJ Style and may not be
            reproduced without written permission.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Product Information</h2>
          <p>
            Product images and descriptions are provided for general reference.
            Actual products may vary slightly. For detailed product information
            and specifications, please contact us directly.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Contact & Inquiries</h2>
          <p>
            For any questions regarding our products, shipping, or services, please
            contact us via WhatsApp or email. All inquiries are handled confidentially.
          </p>

          <h2 className="font-serif text-2xl mt-8 mb-4">Changes to Terms</h2>
          <p>
            GJ Style reserves the right to modify these terms at any time. Continued
            use of the website constitutes acceptance of any changes.
          </p>

          <p className="text-sm text-neutral-500 mt-12">
            Last updated: {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  )
}
