import { HowItWorksHero } from '@/features/howItWorks/components/HowItWorksHero'
import { LoginGuide } from '@/features/howItWorks/components/LoginGuide'
import { ModuleShowcase } from '@/features/howItWorks/components/ModuleShowcase'
import { SettingsGuide } from '@/features/howItWorks/components/SettingsGuide'
import { StepGuide } from '@/features/howItWorks/components/StepGuide'
import { PlanComparisonStrip } from '@/features/howItWorks/components/PlanComparisonStrip'
import { TipsStrip } from '@/features/howItWorks/components/TipsStrip'

export function HowItWorksPage() {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <HowItWorksHero />
      <LoginGuide />
      <ModuleShowcase />
      <SettingsGuide />
      <StepGuide />
      <PlanComparisonStrip />
      <TipsStrip />
    </div>
  )
}
