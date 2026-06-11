import React from 'react';
import { Card, IconBox } from '../ui';

const iconMap = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3L19 6V11C19 15.42 16.05 19.55 12 21C7.95 19.55 5 15.42 5 11V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 11.5L11.2 13.2L14.7 9.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  records: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M7 4H17V20H7V4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 16H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  emergency: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 4V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  reminder: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 8V13L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 22C16.9706 22 21 17.9706 21 13C21 8.02944 16.9706 4 12 4C7.02944 4 3 8.02944 3 13C3 17.9706 7.02944 22 12 22Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 8H20V20H4V8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 8V6C7 4.34315 8.34315 3 10 3H14C15.6569 3 17 4.34315 17 6V8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  article: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 4H18V20H6V4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

const iconTone = {
  blue: 'bg-primary-50 text-primary-600',
  green: 'bg-success-50 text-success-700',
  red: 'bg-danger-50 text-danger-600',
  amber: 'bg-warning-50 text-warning-700',
  slate: 'bg-neutral-100 text-neutral-600',
};

export default function FeatureCard({ icon, tone = 'blue', title, description }) {
  return (
    <Card className="h-full bg-neutral-50 p-6 shadow-none transition hover:-translate-y-1 hover:shadow-card">
      <div className="space-y-4">
        <IconBox className={iconTone[tone]}>{iconMap[icon] || iconMap.shield}</IconBox>
        <div className="space-y-2">
          <h3 className="text-label-lg font-display text-neutral-900">{title}</h3>
          <p className="text-sm leading-6 text-neutral-600">{description}</p>
        </div>
      </div>
    </Card>
  );
}
