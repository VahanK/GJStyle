'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { FadeInView } from '@/components/animations/FadeInView'
import { WhatsAppIcon, EmailIcon, InstagramIcon } from '@/components/icons/Icons'

export function Contact() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const [imageError, setImageError] = useState(false)

  return (
    <section id="contact" ref={ref} className="relative py-32 md:py-40 px-6 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60 z-10" />
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-brand-900 to-neutral-900" />
        {!imageError && (
          <Image
            src="/contact-background.jpg"
            alt="Contact GJ Style"
            fill
            className="object-cover"
            quality={85}
            onError={() => setImageError(true)}
          />
        )}
      </motion.div>

      <div className="relative z-20 max-w-4xl mx-auto text-center text-white">
        <FadeInView>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8">
            Let&apos;s Connect
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-xl md:text-2xl mb-16 text-white/90 max-w-2xl mx-auto">
            Whether you have questions about our collection or want to discuss an order,
            we&apos;d love to hear from you
          </p>
        </FadeInView>

        {/* Contact Buttons */}
        <FadeInView delay={0.4}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* WhatsApp - Primary */}
            <a
              href="https://wa.me/9611234567?text=Hi%20GJ%20Style,%20I'm%20interested%20in%20your%20collection"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 bg-whatsapp hover:bg-whatsapp/90 text-white font-medium rounded-lg transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <WhatsAppIcon className="w-6 h-6" />
              <span>Chat on WhatsApp</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>

            {/* Email */}
            <a
              href="mailto:info@gjstyle.com"
              className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg border border-white/30 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <EmailIcon className="w-6 h-6" />
              <span>Send Email</span>
            </a>
          </div>
        </FadeInView>

        {/* Contact Info */}
        <FadeInView delay={0.6}>
          <div className="mt-16 pt-16 border-t border-white/20">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <p className="text-white/60 uppercase text-xs tracking-widest mb-2">WhatsApp</p>
                <p className="text-white">+961 1 234 567</p>
              </div>
              <div>
                <p className="text-white/60 uppercase text-xs tracking-widest mb-2">Email</p>
                <p className="text-white">info@gjstyle.com</p>
              </div>
              <div>
                <p className="text-white/60 uppercase text-xs tracking-widest mb-2">Follow Us</p>
                <a
                  href="https://instagram.com/gjstyle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-instagram transition-colors inline-flex items-center gap-2"
                >
                  <InstagramIcon className="w-5 h-5" />
                  <span>@gjstyle</span>
                </a>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
