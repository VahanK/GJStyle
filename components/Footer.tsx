'use client'

import Link from 'next/link'
import { InstagramIcon, WhatsAppIcon } from './icons/Icons'

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-3xl mb-4 text-brand-500">
              GJ Style
            </h3>
            <p className="text-white/70 mb-6 max-w-md">
              Crafting exceptional gold-plated jewelry since 2004.
              From our workshop in Lebanon to clients worldwide.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/gjstyle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/9611234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4 uppercase text-sm tracking-widest">Navigate</h4>
            <ul className="space-y-3 text-white/70">
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('material')} className="hover:text-white transition-colors">
                  Material & Care
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('shipping')} className="hover:text-white transition-colors">
                  Shipping
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium mb-4 uppercase text-sm tracking-widest">Contact</h4>
            <ul className="space-y-3 text-white/70 text-sm">
              <li>WhatsApp: +961 1 234 567</li>
              <li>Email: info@gjstyle.com</li>
              <li>Lebanon</li>
              <li className="pt-2">
                <span className="text-xs">Shipping worldwide via DHL</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>
              © {new Date().getFullYear()} GJ Style. All rights reserved. Established 2004.
            </p>

            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          <p className="text-xs text-white/40 mt-6 text-center md:text-left">
            All photography, designs, and content on this website are the property of GJ Style
            and may not be reproduced without written permission.
          </p>
        </div>
      </div>
    </footer>
  )
}
