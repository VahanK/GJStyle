'use client'

import { FadeInView } from '@/components/animations/FadeInView'

export function Introduction() {
  return (
    <section id="introduction" className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <FadeInView>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 text-neutral-900">
            GJ Style
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <div className="text-lg md:text-xl text-neutral-700 leading-relaxed space-y-6">
            <p>
              For over 20 years, GJ Style has been creating beautiful gold-plated jewelry
              from our workshop in Lebanon.
            </p>
            <p>
              Each piece reflects our commitment to quality craftsmanship and timeless design.
              With over 200 designs in our collection, we work closely with clients around
              the world to meet their jewelry needs.
            </p>
            <p className="font-medium text-neutral-900">
              Contact us to view our complete catalog and discuss your requirements.
            </p>
            <p className="text-sm text-neutral-600 italic">
              International shipping available via DHL
            </p>
          </div>
        </FadeInView>

        {/* Stats Row */}
        <FadeInView delay={0.4}>
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-16 pt-16 border-t border-neutral-200">
            <div>
              <p className="text-4xl md:text-5xl font-serif text-brand-500 mb-2">20+</p>
              <p className="text-sm md:text-base text-neutral-600 uppercase tracking-wide">Years</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-serif text-brand-500 mb-2">200+</p>
              <p className="text-sm md:text-base text-neutral-600 uppercase tracking-wide">Designs</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-serif text-brand-500 mb-2">DHL</p>
              <p className="text-sm md:text-base text-neutral-600 uppercase tracking-wide">Worldwide</p>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
