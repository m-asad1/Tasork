import type { Metadata } from 'next';

import { CTA } from '@/components/marketing/cta';
import { FAQ } from '@/components/marketing/faq';
import { Features } from '@/components/marketing/features';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Pricing } from '@/components/marketing/pricing';
import { Statistics } from '@/components/marketing/statistics';
import { Testimonials } from '@/components/marketing/testimonials';

export const metadata: Metadata = {
  title: 'Tasork — Describe it. We\u2019ll solve it.',
  description:
    'Submit your project and get a custom-reviewed solution from a managed team of experts. Transparent pricing, secure payments, real progress tracking.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statistics />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
