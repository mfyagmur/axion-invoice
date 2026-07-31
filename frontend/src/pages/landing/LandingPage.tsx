import { CTASection } from '@/features/landing/components/CTASection'
import { Features } from '@/features/landing/components/Features'
import { Hero } from '@/features/landing/components/Hero'
import { Pricing } from '@/features/landing/components/Pricing'

export function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <CTASection />
    </>
  )
}
