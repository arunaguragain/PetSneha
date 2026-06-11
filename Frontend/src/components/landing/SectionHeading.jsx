import React from 'react';

export default function SectionHeading({ eyebrow, title, description, align = 'center', className = '' }) {
  return (
    <div className={`space-y-3 ${align === 'left' ? 'text-left' : 'text-center'} ${className}`.trim()}>
      {eyebrow ? <p className="text-label-lg text-primary-600">{eyebrow}</p> : null}
      <h2 className="text-heading-lg font-display text-neutral-900 sm:text-heading-xl">{title}</h2>
      {description ? <p className="mx-auto max-w-3xl text-body-md text-neutral-600">{description}</p> : null}
    </div>
  );
}
