import type { Metadata } from 'next'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://gjstyle.com'),

  title: {
    default: 'GJ Style | Lebanese Gold-Plated Jewelry Since 2004',
    template: '%s | GJ Style',
  },

  description:
    "Discover GJ Style's exquisite gold-plated jewelry collection. Lebanese craftsmanship since 2004. Rings, necklaces, bracelets & earrings. Worldwide shipping via DHL.",

  keywords: [
    'Lebanese jewelry',
    'gold-plated jewelry',
    'GJ Style',
    'Lebanese craftsmanship',
    'gold jewelry Lebanon',
    'wholesale jewelry',
    'jewelry manufacturer',
    'DHL shipping jewelry',
    'international jewelry shipping',
    'gold plated care',
  ],

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gjstyle.com',
    title: 'GJ Style | Lebanese Gold-Plated Jewelry Since 2004',
    description:
      'Exquisite gold-plated jewelry from Lebanon. 200+ designs, worldwide shipping via DHL.',
    siteName: 'GJ Style',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'GJ Style | Lebanese Gold-Plated Jewelry Since 2004',
    description:
      'Exquisite gold-plated jewelry from Lebanon. 200+ designs, worldwide shipping via DHL.',
    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
