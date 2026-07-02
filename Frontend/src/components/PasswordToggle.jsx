export function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M2 12C3.8 7 7.7 4 12 4C16.3 4 20.2 7 22 12C20.2 17 16.3 20 12 20C7.7 20 3.8 17 2 12Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 12C3.8 7 7.7 4 12 4C16.3 4 20.2 7 22 12C21.4 13.6 20.5 15 19.4 16.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 10.5C10.2 10.9 10 11.4 10 12C10 13.1 10.9 14 12 14C12.6 14 13.1 13.8 13.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PasswordToggleButton({ isVisible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-neutral-500 transition hover:text-neutral-700"
      aria-label={isVisible ? 'Hide password' : 'Show password'}
    >
      {isVisible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}
