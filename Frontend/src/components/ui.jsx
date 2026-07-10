import React, { forwardRef, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4 10.5L8.2 14.7L16 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.5L12.76 7.7L18.5 8.54L14.37 12.6L15.34 18.3L10 15.48L4.66 18.3L5.63 12.6L1.5 8.54L7.24 7.7L10 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PawIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.5 9.5C9.60457 9.5 10.5 8.38071 10.5 7C10.5 5.61929 9.60457 4.5 8.5 4.5C7.39543 4.5 6.5 5.61929 6.5 7C6.5 8.38071 7.39543 9.5 8.5 9.5Z"
        fill="currentColor"
      />
      <path
        d="M15.5 9.5C16.6046 9.5 17.5 8.38071 17.5 7C17.5 5.61929 16.6046 4.5 15.5 4.5C14.3954 4.5 13.5 5.61929 13.5 7C13.5 8.38071 14.3954 9.5 15.5 9.5Z"
        fill="currentColor"
      />
      <path
        d="M6 13.25C6 11.7312 7.23122 10.5 8.75 10.5C9.97973 10.5 11.027 11.2786 11.4307 12.3694L11.5 12.55L11.5693 12.3694C11.973 11.2786 13.0203 10.5 14.25 10.5C15.7688 10.5 17 11.7312 17 13.25C17 14.7688 15.7688 16 14.25 16H8.75C7.23122 16 6 14.7688 6 13.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconButtonChevron({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M7.5 5.5L12 10L7.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-6 w-6 border-[3px]',
  };

  return <span className={cn('inline-block animate-spin rounded-full border-current border-r-transparent', sizeClasses[size], className)} aria-hidden="true" />;
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, loading = false, className = '', as: Component = 'button', children, ...props },
  ref,
) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/15 disabled:cursor-not-allowed disabled:opacity-60';
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow-card hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lift',
    secondary: 'border border-neutral-200 bg-white text-neutral-800 shadow-surface hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
    danger: 'bg-danger text-white shadow-card hover:-translate-y-0.5 hover:bg-danger-600',
    white: 'bg-white text-primary-600 hover:bg-neutral-50 hover:-translate-y-0.5 shadow-card hover:shadow-lift'
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs uppercase tracking-wider',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  return (
    <Component
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait opacity-80',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </Component>
  );
});

export const Modal = ({ open = false, onClose, size = 'md', title, children, className = '' }) => {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E293B]/60 px-4 backdrop-blur-sm transition-all duration-200">
      <div className={cn('relative w-full rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto', sizeClasses[size] || sizeClasses.md, className)}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-[#94A3B8] transition hover:text-[#475569]" aria-label="Close dialog">
          <XIcon className="h-5 w-5" />
        </button>
        {title ? (
          <div className="px-6 pt-6 pb-2">
            <h3 className="pr-10 text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{title}</h3>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};

export const ConfirmationOverlay = ({
  open = false,
  icon,
  title,
  description,
  children,
  actions,
  primaryAction, // { label, onClick, loading }
  secondaryAction, // { label, onClick, loading }
  className = '',
}) => {
  if (!open) return null;

  const renderActions = () => {
    if (primaryAction || secondaryAction) {
      return (
        <div className="mt-6 flex flex-col gap-3">
          {primaryAction ? (
            <Button type="button" variant="primary" fullWidth onClick={primaryAction.onClick} loading={primaryAction.loading} className={cn(primaryAction.className || '', 'rounded-full py-3')}>
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button type="button" variant="secondary" fullWidth onClick={secondaryAction.onClick} loading={secondaryAction.loading} className={cn(secondaryAction.className || '', 'rounded-full py-3')}>
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      );
    }

    if (actions) return <div className="mt-6 flex flex-col gap-3">{actions}</div>;
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className={cn('w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200', className)}>
        {icon ? <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0046CE]">{icon}</div> : null}
        {title ? <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Literata, serif' }}>{title}</h2> : null}
        {description ? <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p> : null}
        {children}
        {renderActions()}
      </div>
    </div>
  );
};

export const Input = forwardRef(function Input({ label, hint, error, id, className = '', required = false, leftIcon, rightIcon, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="form-group">
      {label ? (
        <label htmlFor={inputId} className={cn('form-label', required && 'form-label-required')}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-500">{leftIcon}</span> : null}
        {rightIcon ? <span className="absolute inset-y-0 right-4 flex items-center text-neutral-500">{rightIcon}</span> : null}
        <input ref={ref} id={inputId} className={cn('input', leftIcon && 'pl-11', rightIcon && 'pr-11', error && 'input-error', className)} required={required} {...props} />
      </div>
      {error ? <p className="form-error">{error}</p> : hint ? <p className="form-hint">{hint}</p> : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, id, className = '', required = false, rows = 4, ...props }, ref) {
  const autoId = useId();
  const textareaId = id || autoId;

  return (
    <div className="form-group">
      {label ? (
        <label htmlFor={textareaId} className={cn('form-label', required && 'form-label-required')}>
          {label}
        </label>
      ) : null}
      <textarea ref={ref} id={textareaId} rows={rows} className={cn('textarea', error && 'textarea-error', className)} required={required} {...props} />
      {error ? <p className="form-error">{error}</p> : hint ? <p className="form-hint">{hint}</p> : null}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, id, className = '', required = false, children, ...props }, ref) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className="form-group">
      {label ? (
        <label htmlFor={selectId} className={cn('form-label', required && 'form-label-required')}>
          {label}
        </label>
      ) : null}
      <select ref={ref} id={selectId} className={cn('select', error && 'select-error', className)} required={required} {...props}>
        {children}
      </select>
      {error ? <p className="form-error">{error}</p> : hint ? <p className="form-hint">{hint}</p> : null}
    </div>
  );
});

export const Badge = ({ variant = 'neutral', children, className = '' }) => <span className={cn('badge', `badge-${variant}`, className)}>{children}</span>;

export const Chip = ({ active = false, variant = 'neutral', as: Component = 'button', className = '', type = 'button', children, ...props }) => (
  <Component className={cn('chip', active && 'chip-active', variant === 'primary' && 'chip-primary', className)} type={Component === 'button' ? type : undefined} {...props}>
    {children}
  </Component>
);

export const Card = ({ hover = false, interactive = false, className = '', children, ...props }) => (
  <div className={cn('card', hover && 'card-hover', interactive && 'card-interactive', className)} {...props}>
    {children}
  </div>
);

export const Avatar = ({ src, alt = '', name = '', size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '');
  const initials =
    cleanName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || alt.slice(0, 2).toUpperCase() || 'P';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-xl',
  };

  return (
    <span className={cn('relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-[#EFF6FF] text-[#0046CE] font-semibold border border-[#BFDBFE]', sizeClasses[size] || sizeClasses.md, className)}>
      {src && !imgError ? (
        <img src={src} alt={alt || name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
      ) : (
        initials
      )}
    </span>
  );
};

export const IconBox = ({ size = 'md', className = '', children }) => (
  <span className={cn('icon-box', size === 'lg' ? 'icon-box-lg' : 'icon-box-sm', className)}>{children}</span>
);

export const VerifiedBadge = ({ className = '' }) => {
  const { t } = useTranslation();
  return (
    <span className={cn('verified-badge', className)}>
      <CheckIcon className="h-3.5 w-3.5" />
      {t('status.verified', 'Verified')}
    </span>
  );
};

export const StarRating = ({ rating = 0, onChange, className = '' }) => (
  <div className={cn('inline-flex items-center gap-1', className)}>
    {Array.from({ length: 5 }, (_, index) => {
      const value = index + 1;
      const active = value <= rating;

      const star = (
        <span className={cn('inline-flex items-center justify-center rounded-full p-1', active ? 'text-warning' : 'text-neutral-300')}>
          <StarIcon className="h-5 w-5" />
        </span>
      );

      if (!onChange) {
        return <span key={value}>{star}</span>;
      }

      return (
        <button key={value} type="button" onClick={() => onChange(value)} aria-label={`Rate ${value} stars`} className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/15">
          {star}
        </button>
      );
    })}
  </div>
);

export const Tabs = ({ items = [], activeId, onChange, className = '' }) => (
  <div className={cn('tab-bar', className)} role="tablist" aria-label="Tabs">
    {items.map((item) => (
      <button key={item.id} type="button" role="tab" aria-selected={activeId === item.id} className={cn('tab', activeId === item.id && 'tab-active')} onClick={() => onChange?.(item.id)}>
        {item.label}
      </button>
    ))}
  </div>
);

export const Stepper = ({ steps = [], activeStep = 0, className = '' }) => (
  <div className={cn('stepper', className)}>
    {steps.map((step, index) => {
      const done = index < activeStep;
      const active = index === activeStep;
      return (
        <div key={step.title ?? index} className="stepper-step">
          <div className="flex flex-col items-center gap-2">
            <span className={cn('stepper-circle', done && 'stepper-circle-done', active && 'stepper-circle-active', !done && !active && 'stepper-circle-pending')}>
              {done ? <CheckIcon className="h-4 w-4" /> : index + 1}
            </span>
            {index < steps.length - 1 ? <span className={cn('stepper-line', done && 'stepper-line-done')} /> : null}
          </div>
          <div className="pt-1">
            <p className="text-label-lg text-neutral-900">{step.title}</p>
            {step.description ? <p className="mt-1 text-body-md text-neutral-600">{step.description}</p> : null}
          </div>
        </div>
      );
    })}
  </div>
);

export const Toast = ({ title, message, type = 'info', onClose, className = '' }) => {
  const toneClasses = {
    info: 'border-primary-200 bg-primary-50 text-primary-700',
    success: 'border-success-200 bg-success-50 text-success-700',
    warning: 'border-warning-200 bg-warning-50 text-warning-700',
    danger: 'border-danger-200 bg-danger-50 text-danger-700',
  };

  return (
    <div className={cn('toast', toneClasses[type], className)} role="status">
      <div className="flex items-start justify-between gap-3">
        <div>
          {title ? <p className="text-label-lg">{title}</p> : null}
          {message ? <p className="mt-1 text-body-md text-neutral-600">{message}</p> : null}
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded-full p-1 text-neutral-500 transition hover:bg-white/70 hover:text-neutral-900" aria-label="Close toast">
            <IconButtonChevron className="h-4 w-4 rotate-[-90deg]" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export const Skeleton = ({ className = '' }) => <div className={cn('skeleton', className)} />;

export const Divider = ({ dashed = false, className = '' }) => <div className={cn(dashed ? 'divider-dashed' : 'divider', className)} />;

export const PageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
    <div className="max-w-2xl space-y-3">
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
  </div>
);

export const InfoBox = ({ type = 'info', title, children, className = '' }) => {
  const boxClass = {
    error: 'error-box',
    success: 'success-box',
    info: 'info-box',
  }[type];

  return (
    <div className={cn(boxClass, className)}>
      {title ? <p className="text-label-lg">{title}</p> : null}
      {children ? <div className={cn(title && 'mt-2', 'text-body-md')}>{children}</div> : null}
    </div>
  );
};

export const PetSnehaLogo = ({ className = '' }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span className="icon-box icon-box-sm bg-primary-600 text-white">
      <PawIcon className="h-4 w-4" />
    </span>
    <div>
      <p className="text-label-lg leading-none text-neutral-900">PetSneha</p>
      <p className="mt-1 text-caption text-neutral-500 normal-case">Care, designed simply</p>
    </div>
  </div>
);

export {
  CheckIcon,
  PawIcon,
  StarIcon,
  XIcon,
};
