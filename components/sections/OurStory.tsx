'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { FadeInView } from '@/components/animations/FadeInView'

export function OurStory() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const [imageError, setImageError] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="about" ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" />
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-neutral-900 to-neutral-800" />
        {!imageError && (
          <Image
            src="/workshop-background.jpg"
            alt="GJ Style Workshop"
            fill
            className="object-cover"
            quality={85}
            onError={() => setImageError(true)}
          />
        )}
      </motion.div>

      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center text-white">
        <FadeInView>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8">
            Twenty Years of Craftsmanship
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <div className="text-lg md:text-xl leading-relaxed space-y-6 text-white/90">
            <p>
              Since 2004, GJ Style has been dedicated to creating exceptional gold-plated
              jewelry that combines traditional Lebanese craftsmanship with contemporary design.
            </p>
            <p>
              From our workshop in Lebanon, we have built a collection of over 200 unique designs,
              each piece reflecting our commitment to quality materials and meticulous attention
              to detail.
            </p>
            <p>
              Today, we are proud to serve clients worldwide, delivering our jewelry through
              trusted DHL shipping to ensure your pieces arrive safely, no matter where you are.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.4}>
          <button
            onClick={() => scrollToSection('contact')}
            className="mt-12 px-8 py-4 bg-white text-black font-medium uppercase text-sm tracking-wide hover:bg-brand-500 hover:text-white transition-colors duration-300"
          >
            Get in Touch
          </button>
        </FadeInView>
      </div>
    </section>
  )
}
