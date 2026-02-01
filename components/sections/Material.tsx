'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FadeInView } from '@/components/animations/FadeInView'

function MaterialCareCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string
  title: string
  description: string
  delay: number
}) {
  return (
    <FadeInView delay={delay}>
      <div className="text-center group bg-white p-8 rounded-xl hover:shadow-lg transition-shadow duration-300">
        <div className="text-5xl md:text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-serif text-xl md:text-2xl mb-4">{title}</h3>
        <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
          {description}
        </p>
      </div>
    </FadeInView>
  )
}

function AvoidanceCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string
  title: string
  description: string
  delay: number
}) {
  return (
    <FadeInView delay={delay}>
      <div className="flex gap-4 items-start">
        <div className="text-3xl flex-shrink-0">{icon}</div>
        <div>
          <h4 className="font-medium text-lg mb-1">{title}</h4>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </FadeInView>
  )
}

export function Material() {
  const [imageError, setImageError] = useState(false)

  return (
    <section id="material" className="py-24 md:py-32 px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <FadeInView>
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Gold-Plated Jewelry
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Understanding your jewelry&apos;s material and how to protect its beauty
            </p>
          </div>
        </FadeInView>

        {/* Split Section: What is Gold-Plating */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-24">
          <FadeInView direction="left">
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-brand-200 to-brand-100">
              {!imageError && (
                <Image
                  src="/material-gold-plating.jpg"
                  alt="Gold-plated jewelry close-up"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              )}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">✨</span>
                </div>
              )}
            </div>
          </FadeInView>

          <FadeInView direction="right" delay={0.2}>
            <div className="space-y-6">
              <h3 className="font-serif text-3xl md:text-4xl mb-6">
                What is Gold-Plating?
              </h3>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  Gold-plating is a process where a thin layer of real gold is applied to
                  a base metal through electroplating. This creates beautiful, luxurious
                  jewelry at an accessible price point.
                </p>
                <p>
                  Our pieces feature a carefully applied gold layer that provides the same
                  elegant appearance as solid gold, while remaining affordable and versatile
                  for everyday wear.
                </p>
                <p className="text-sm text-neutral-600 border-l-4 border-brand-500 pl-4 italic">
                  The quality of gold-plating depends on the thickness of the gold layer
                  and the care taken during the plating process. At GJ Style, we ensure
                  consistent, high-quality plating on every piece.
                </p>
              </div>
            </div>
          </FadeInView>
        </div>

        {/* Care Instructions Grid */}
        <FadeInView>
          <h3 className="font-serif text-3xl md:text-4xl text-center mb-12">
            Caring for Your Gold-Plated Jewelry
          </h3>
        </FadeInView>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-24">
          <MaterialCareCard
            icon="💧"
            title="Avoid Water & Chemicals"
            description="Remove your jewelry before swimming, showering, or applying lotions, perfumes, and cleaning products. Moisture and chemicals can wear down the gold layer over time."
            delay={0}
          />
          <MaterialCareCard
            icon="✨"
            title="Gentle Cleaning"
            description="Clean with a soft, dry cloth after each wear. For deeper cleaning, use lukewarm water and mild soap, then pat dry immediately. Never use abrasive materials or harsh cleaners."
            delay={0.15}
          />
          <MaterialCareCard
            icon="🔒"
            title="Proper Storage"
            description="Store pieces individually in soft pouches or lined jewelry boxes. Keep away from humidity, direct sunlight, and other jewelry to prevent scratching and tarnishing."
            delay={0.3}
          />
        </div>

        {/* What to Avoid - Grid */}
        <div className="bg-white rounded-2xl p-8 md:p-12">
          <FadeInView>
            <h3 className="font-serif text-2xl md:text-3xl text-center mb-8">
              What to Avoid
            </h3>
          </FadeInView>

          <div className="grid md:grid-cols-2 gap-6">
            <AvoidanceCard
              icon="🚿"
              title="Water Exposure"
              description="Remove before bathing, swimming, or exercising"
              delay={0}
            />
            <AvoidanceCard
              icon="🧴"
              title="Beauty Products"
              description="Apply perfume, lotion, and hairspray before putting on jewelry"
              delay={0.1}
            />
            <AvoidanceCard
              icon="💪"
              title="Physical Activities"
              description="Take off jewelry during sports, gym, or manual work"
              delay={0.2}
            />
            <AvoidanceCard
              icon="🌡️"
              title="Extreme Conditions"
              description="Avoid exposure to extreme heat, cold, or humidity"
              delay={0.3}
            />
          </div>
        </div>

        {/* Quality Note */}
        <FadeInView delay={0.4}>
          <div className="mt-16 p-8 bg-brand-50 rounded-lg text-center">
            <p className="text-neutral-700 leading-relaxed">
              <strong className="text-brand-700">Quality Craftsmanship:</strong> Our gold-plating
              process ensures a beautiful, durable finish. With proper care, your jewelry will
              continue to shine and complement your style for years to come.
            </p>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
