import React from 'react';

export default function HeroShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] rotate-3 sm:max-w-[560px]">
      <div className="absolute -left-2 -top-2 h-10 w-10 rounded-2xl bg-white/20 blur-xl" aria-hidden="true" />
      <div className="absolute -right-3 top-6 z-10 rounded-2xl bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
        <img src="/logo.png" alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_28px_60px_rgba(13,20,27,0.28)] ring-1 ring-white/40">
        <div className="overflow-hidden rounded-[22px] bg-neutral-900">
          <img src="/happy-puppy.png" alt="Happy puppy preview" className="h-[340px] w-full object-cover object-center sm:h-[400px]" />
        </div>

        <div className="rounded-b-[22px] bg-white px-2 pb-2 pt-4 text-neutral-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[18px] font-semibold leading-tight">Milo's Health Record</p>
              <p className="mt-1 text-[12px] text-neutral-600">
                <span className="inline-block h-2 w-2 rounded-full bg-success" />{' '}
                Verified by Kathmandu Vet Clinic
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3">
            <div className="flex items-center justify-between text-[12px] text-neutral-600">
              <span>Next Vaccine</span>
              <span className="text-primary-600">In 3 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
