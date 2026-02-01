'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WhatsAppIcon, InstagramIcon, MenuIcon, CloseIcon } from './icons/Icons'

function NavLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-sm font-medium text-neutral-700 hover:text-brand-500 transition-colors duration-200"
    >
      {children}
    </button>
  )
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="font-serif text-2xl tracking-wide"
            style={{ color: isScrolled ? 'var(--color-brand-primary)' : 'white' }}
          >
            GJ Style
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink onClick={() => scrollToSection('about')}>About</NavLink>
            <NavLink onClick={() => scrollToSection('material')}>Material & Care</NavLink>
            <NavLink onClick={() => scrollToSection('shipping')}>Shipping</NavLink>
            <NavLink onClick={() => scrollToSection('contact')}>Contact</NavLink>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/9611234567?text=Hi%20GJ%20Style,%20I'm%20interested%20in%20your%20collection"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp text-white hover:bg-whatsapp/90 transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span className="text-sm font-medium">WhatsApp</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/gjstyle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-instagram transition-colors"
            >
              <InstagramIcon className="w-6 h-6" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: isScrolled ? 'var(--color-text-primary)' : 'white' }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <button
                onClick={() => scrollToSection('about')}
                className="text-2xl font-serif text-neutral-900 hover:text-brand-500 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('material')}
                className="text-2xl font-serif text-neutral-900 hover:text-brand-500 transition-colors"
              >
                Material & Care
              </button>
              <button
                onClick={() => scrollToSection('shipping')}
                className="text-2xl font-serif text-neutral-900 hover:text-brand-500 transition-colors"
              >
                Shipping
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-2xl font-serif text-neutral-900 hover:text-brand-500 transition-colors"
              >
                Contact
              </button>

              <div className="flex gap-6 mt-8">
                <a
                  href="https://wa.me/9611234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-whatsapp text-white flex items-center justify-center"
                >
                  <WhatsAppIcon className="w-7 h-7" />
                </a>
                <a
                  href="https://instagram.com/gjstyle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-neutral-100 text-instagram flex items-center justify-center"
                >
                  <InstagramIcon className="w-7 h-7" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button (Mobile Only) */}
      <a
        href="https://wa.me/9611234567"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-whatsapp rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <WhatsAppIcon className="w-7 h-7 text-white" />
      </a>
    </>
  )
}
