import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, VerifiedBadge } from '../ui';

export default function LandingHero({ puppySrc, badgeSrc, backdropSrc }) {
  const quickPoints = ['Find vet', 'Track health', 'Shop for pet'];

  return (
    <section className="bg-primary-600 text-white">
      <div className="container-app grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            Nepal's all-in-one pet health platform
          </div>

          <div className="space-y-5">
            <h1 className="max-w-lg text-display-lg font-display text-white sm:text-[4.25rem]">
              Your pet deserves better care
            </h1>
            <p className="max-w-xl text-body-lg text-white/85">
              Connect with verified vets, track health records, and shop for your pet's needs, all in one place built specifically for Nepal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/register">
              <Button className="bg-white text-primary-600 hover:bg-neutral-50">Get started →</Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" className="border border-white/30 bg-transparent text-white hover:bg-white/10">
                Learn more
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-white/75">
            {quickPoints.map((point) => (
              <span key={point} className="flex items-center gap-2">
                <span className="text-white/90">✓</span>
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[520px]">
            <div className="absolute inset-0 -z-10 translate-x-8 translate-y-8 rounded-[2rem] bg-black/15 blur-2xl" />
            <Card className="relative overflow-hidden rounded-[2rem] border-8 border-white/95 bg-white p-3 shadow-lift">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-neutral-800">
                <img src={backdropSrc} alt="Pet care background" className="absolute inset-0 h-full w-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.32),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.18))]" />
                <img src={puppySrc} alt="Happy puppy" className="relative z-10 h-full w-full object-cover" />
              </div>

              <div className="space-y-3 px-4 pb-3 pt-4 text-neutral-900">
                <div>
                      <p className="text-heading-lg font-display text-neutral-900">Milo's Health Record</p>
                      <div className="mt-1 text-[12px] text-neutral-600">
                        <span className="inline-block h-2 w-2 rounded-full bg-success-DEFAULT" />{' '}
                        Verified by Kathmandu Vet Clinic
                      </div>
                </div>

                <div className="space-y-2 rounded-2xl bg-neutral-50 p-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Next Vaccine</span>
                    <span className="text-primary-600">In 3 days</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200">
                    <div className="h-2 w-3/5 rounded-full bg-primary-600" />
                  </div>
                </div>
              </div>
            </Card>

            <div className="absolute -right-2 top-8 rounded-2xl bg-white p-3 shadow-lift">
              <img src={badgeSrc} alt="PetSneha mark" className="h-10 w-10 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
