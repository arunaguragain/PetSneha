import React from 'react';

export default function BrandMark({ className = '', textClassName = 'text-neutral-900', subtitleClassName = 'text-neutral-500' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo.png" alt="PetSneha logo" className="h-9 w-9 object-contain" />
      <div>
        <p className={`font-display text-lg font-semibold leading-none ${textClassName}`}>PetSneha</p>
        <p className={`mt-1 text-caption normal-case ${subtitleClassName}`}>Nepal's all-in-one pet health platform</p>
      </div>
    </div>
  );
}
