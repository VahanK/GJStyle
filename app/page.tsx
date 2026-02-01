import { Navigation } from '@/components/Navigation'
import { Hero, Introduction, OurStory, Material, Shipping, Contact } from '@/components/sections'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Introduction />
      <OurStory />
      <Material />
      <Shipping />
      <Contact />
      <Footer />
    </main>
  )
}
