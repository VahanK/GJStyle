'use client'

import { FadeInView } from '@/components/animations/FadeInView'
import { CheckIcon } from '@/components/icons/Icons'

function ShippingFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center mt-1">
        <CheckIcon className="w-3 h-3 text-brand-500" />
      </div>
      <div>
        <h4 className="font-medium text-lg mb-1">{title}</h4>
        <p className="text-neutral-600">{description}</p>
      </div>
    </div>
  )
}

export function Shipping() {
  return (
    <section id="shipping" className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeInView>
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-4">
            Worldwide Shipping
          </h2>
          <p className="text-center text-neutral-600 mb-20 max-w-2xl mx-auto">
            We partner with DHL to deliver your jewelry safely, no matter where you are
          </p>
        </FadeInView>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* DHL Visual */}
          <FadeInView direction="left">
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mb-6">
                  <div className="text-6xl font-bold" style={{ color: '#FFCC00' }}>
                    DHL
                  </div>
                </div>
                <p className="text-neutral-600 text-lg">
                  Trusted International Shipping Partner
                </p>
              </div>
            </div>
          </FadeInView>

          {/* Shipping Info */}
          <FadeInView direction="right" delay={0.2}>
            <div className="space-y-6">
              <ShippingFeature
                title="Fast & Reliable"
                description="Express shipping with tracking to most destinations worldwide"
              />
              <ShippingFeature
                title="Secure Packaging"
                description="Each piece is carefully packaged to ensure safe delivery"
              />
              <ShippingFeature
                title="Customs Support"
                description="We handle all necessary documentation for international orders"
              />
              <ShippingFeature
                title="Track Your Order"
                description="Receive a tracking number to monitor your shipment in real-time"
              />

              <p className="text-sm text-neutral-600 pt-6 border-t border-neutral-200">
                Shipping costs and delivery times vary by destination. Contact us for specific quotes.
              </p>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  )
}
