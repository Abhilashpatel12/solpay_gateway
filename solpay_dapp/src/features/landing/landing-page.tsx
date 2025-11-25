"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMerchant } from '@/features/merchant/hooks/use-merchant'
import { CtaSection } from './components/cta-section';
import { ComparisonSection } from './components/comparison-section';
import { FeaturesSection } from './components/features-section';
import { HeroSection } from './components/hero-section';
import { IntelligenceSection } from './components/intelligence-section';
import { LogosMarquee } from './components/logos-marquee';
import { StatsSection } from './components/stats-section';
import { TestimonialsSection } from './components/testimonials-section';
import { TimelineSection } from './components/timeline-section';

export function LandingPage() {
  const router = useRouter()
  const wallet = useWallet()
  const { data: merchant, isLoading: isMerchantLoading } = useMerchant()

  useEffect(() => {
    // If the user is connected and already has a merchant registration, navigate them
    // straight to the merchant dashboard instead of showing the public landing page.
    if (wallet.connected && merchant) {
      router.push('/merchant')
    }
  }, [wallet.connected, merchant, router])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent text-white">
      <HeroSection />
      <StatsSection />
      <LogosMarquee />
      <FeaturesSection />
      <IntelligenceSection />
      <TimelineSection />
      <ComparisonSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}

