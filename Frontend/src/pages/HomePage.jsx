import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LandingCTA from '../components/landing/LandingCTA';
import { Button } from '../components/ui';
import FeatureCard from '../components/landing/FeatureCard';
import HeroShowcase from '../components/landing/HeroShowcase';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNavbar from '../components/landing/LandingNavbar';

const highlights = ['Find vet', 'Track health', 'Shop for pet'];

const features = [
  {
    icon: 'shield',
    tone: 'blue',
    title: 'Find verified vets',
    description: 'Browse licensed veterinary doctors near you with transparent fees, credentials, and real reviews.',
  },
  {
    icon: 'records',
    tone: 'green',
    title: 'Health records',
    description: 'Keep all vaccinations, check-ups, and treatment history in one organised digital profile per pet.',
  },
  {
    icon: 'emergency',
    tone: 'red',
    title: 'Emergency finder',
    description: 'Find the nearest open clinic instantly and call them with one tap - no searching under pressure.',
  },
  {
    icon: 'reminder',
    tone: 'blue',
    title: 'Smart reminders',
    description: 'Never miss a vaccination or check-up; get notified before your pet’s next due date.',
  },
  {
    icon: 'store',
    tone: 'amber',
    title: 'Pet marketplace',
    description: 'Shop for pet food and accessories from verified Nepal-based sellers with home delivery.',
  },
  {
    icon: 'article',
    tone: 'slate',
    title: 'Local articles',
    description: 'Read Nepal-specific pet care guides written by verified local veterinary professionals.',
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div id="top" className="bg-neutral-50 text-neutral-900">
      <LandingNavbar />

      <main>
        <section className="relative overflow-hidden bg-primary-600 text-white">
          <img src="/decorative-bg.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_25%)]" />

          <div className="w-full relative pt-8 pb-16 lg:pt-10 lg:pb-20 pl-20 pr-16 lg:pr-16">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
              <div className="max-w-2xl space-y-10">
                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm text-white/90 shadow-sm backdrop-blur">
                  {t('home.tagline', "Nepal's all-in-one pet health platform")}
                </span>

                <div className="space-y-3">
                  <h1 className="max-w-xl font-display text-4xl leading-tight text-white sm:text-5xl lg:text-[58px]">
                    {t('home.heroTitle', 'Your pet deserves better care')}
                  </h1>
                  <p className="max-w-xl text-[17px] leading-8 text-white/80">
                    {t('home.heroDesc', "Connect with verified vets, track health records, and shop for your pet's needs - all in one place built specifically for Nepal.")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button as={Link} to="/register" variant="white" size="lg" className="!rounded-full px-6 py-3 text-base font-semibold">
                    {t('home.getStarted', 'Get started')} →
                  </Button>
                  <Button as={Link} to="/login" size="lg" className="!rounded-full border border-white/30 bg-transparent px-6 py-3 text-base font-semibold text-white hover:bg-white/10 !shadow-none">
                    {t('home.learnMore', 'Learn more')}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-white/75">
                  {highlights.map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <span className="text-white">✓</span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <HeroShowcase />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative overflow-hidden bg-[rgba(247,249,251,1)] py-20 text-black">
          <div className="container-app relative">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl text-black sm:text-4xl">{t('home.featuresTitle', 'Everything your pet needs')}</h2>
              <p className="mt-4 text-base leading-7 text-black/55">{t('home.featuresDesc', 'From emergency vet finds to health records - PetSneha keeps it all organised.')}</p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
