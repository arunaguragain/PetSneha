import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, InfoBox } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/helpers';
import { EyeIcon, EyeOffIcon, PasswordToggleButton } from '../../components/PasswordToggle';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 11.1h-9.18v2.95h5.27c-.23 1.27-1 2.35-2.08 3.07v2.55h3.36c1.97-1.81 3.11-4.47 3.11-7.57 0-.74-.07-1.43-.18-2z" />
      <path fill="#34A853" d="M12.17 22c2.73 0 5.03-.9 6.7-2.43l-3.36-2.55c-.93.62-2.13.99-3.34.99-2.57 0-4.76-1.73-5.54-4.05H3.18v2.62C4.84 19.53 8.22 22 12.17 22z" />
      <path fill="#FBBC05" d="M6.63 13.96c-.2-.62-.32-1.28-.32-1.96s.12-1.34.32-1.96V7.42H3.18A9.96 9.96 0 0 0 2 12c0 1.62.39 3.15 1.18 4.58l3.45-2.62z" />
      <path fill="#EA4335" d="M12.17 5.88c1.49 0 2.82.51 3.87 1.51l2.9-2.9C17.18 2.9 14.88 2 12.17 2 8.22 2 4.84 4.47 3.18 7.42l3.45 2.62c.78-2.32 2.97-4.16 5.54-4.16z" />
    </svg>
  );
}

export default function LoginPage({ variant = 'owner' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  
  const isVetLogin = variant === 'vet';
  const isAdminLogin = variant === 'admin';
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const themes = {
    vet: {
      panelClass: 'bg-[linear-gradient(135deg,#065F46_0%,#059669_48%,#0046CE_100%)]',
      buttonClass: 'bg-success text-white hover:bg-success-600',
      linkClass: 'text-success hover:text-success-600',
      homePath: '/vets-landing',
      signupPath: '/vet/register',
      headline: 'Grow your veterinary practice across Nepal.',
      copy: 'Access your verified clinic profile, appointments, and patient care tools in one professional workspace.',
      eyebrow: 'VERIFIED CARE, SIMPLE PRACTICE MANAGEMENT',
      title: 'Vet Login',
      subtitle: 'Login to manage appointments, credentials, and your public vet profile.',
      signupText: 'Register as a vet',
      showSignup: true,
      showSocial: true,
    },
    admin: {
      panelClass: 'bg-[linear-gradient(135deg,#2E1065_0%,#6D28D9_55%,#4C1D95_100%)]',
      buttonClass: 'bg-neutral-900 text-white hover:bg-neutral-800',
      linkClass: 'text-violet-700 hover:text-violet-600',
      homePath: '/',
      signupPath: null,
      headline: 'Platform oversight for PetSneha.',
      copy: 'Verify vets and products, moderate community content, and manage accounts from a single control panel.',
      eyebrow: 'RESTRICTED ACCESS · ADMIN ONLY',
      title: 'Admin Login',
      subtitle: 'Sign in with an authorized administrator account.',
      signupText: null,
      showSignup: false,
      showSocial: false,
    },
    owner: {
      panelClass: 'bg-[linear-gradient(135deg,#0046CE_0%,#0037A7_55%,#0052D9_100%)]',
      buttonClass: 'bg-primary-600 text-white hover:bg-primary-700',
      linkClass: 'text-primary-600 hover:text-primary-700',
      homePath: '/',
      signupPath: '/register',
      headline: 'Advancing Pet Care Across Nepal.',
      copy: 'Access elite veterinary experts, digital health records, and premium pet supplies in one professional ecosystem.',
      eyebrow: 'TRUST & PRECISION IN EVERY INTERACTION',
      title: 'Welcome Back',
      subtitle: "Login to manage your pet's health records and appointments.",
      signupText: 'Create an account',
      showSignup: true,
      showSocial: true,
    }
  };

  const theme = themes[variant] || themes.owner;

  const validate = () => {
    const nextErrors = {};

    if (!email || !isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await auth.login(email.trim(), password);
      const savedRedirect = location.state?.redirect;
      const targetPath = savedRedirect
        || {
          petOwner: '/dashboard',
          vet: '/vet/dashboard',
          admin: '/admin/dashboard',
        }[user?.role || auth.role]
        || '/dashboard';

      navigate(targetPath, { replace: true });
    } catch (apiError) {
      setError(typeof apiError === 'string' ? apiError : 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-neutral-50">
      <div className="grid h-full lg:grid-cols-2">
        <section className={`relative flex h-full overflow-hidden px-8 py-8 text-white sm:px-12 lg:px-16 lg:py-10 ${theme.panelClass}`}>
          <div className="absolute inset-0 bg-[url('/decorative-bg.png')] bg-cover bg-center opacity-100 mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.24),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_14%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />

          <div className="relative flex w-full flex-col justify-between">
            <div onClick={() => navigate(theme.homePath)} className="cursor-pointer hover:opacity-80 flex items-center gap-3">
              <img src="/logo.png" alt="PetSneha logo" className="h-10 w-10 object-contain brightness-0 invert" />
              <span className="text-[28px] font-display font-semibold leading-none text-white">PetSneha</span>
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-heading-lg font-display text-white sm:text-[42px] lg:text-[48px]">
                {theme.headline}
              </h1>
              <p className="max-w-lg text-[14px] leading-6 text-white/75">{theme.copy}</p>
            </div>

            <p className="text-caption text-white">{theme.eyebrow}</p>
          </div>
        </section>

        <section className="flex h-full items-center justify-center overflow-hidden bg-neutral-50 px-5 py-6 sm:px-8 lg:px-12 lg:py-0">
          <div className="w-full max-w-[520px] space-y-6">
            <div className="space-y-1">
              <h2 className="text-heading-lg font-display text-neutral-900">{theme.title}</h2>
              <p className="text-sm text-neutral-500">{theme.subtitle}</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldErrors.email}
                placeholder="guragain@gmail.com"
                leftIcon={<img src="/mail.png" alt="mail icon" className="w-4 h-3"/>}
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={fieldErrors.password}
                  placeholder="Password"
                  leftIcon={<img src="/lock.png" alt="lock icon" className="w-4 h-4"/>}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-neutral-500 transition hover:text-neutral-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  }
                />
                {!isAdminLogin && (
                  <div className="flex justify-end">
                    <Link to={isVetLogin ? '/forgot-password?role=vet' : '/forgot-password'} className={`text-xs font-semibold ${theme.linkClass}`}>
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              {error ? <InfoBox type="error">{error}</InfoBox> : null}

              <Button type="submit" fullWidth loading={loading} className={`justify-center ${theme.buttonClass}`}>
                Login to account
              </Button>

              {theme.showSocial && (
                <>
                  <div className="flex items-center gap-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span>or continue with</span>
                    <div className="h-px flex-1 bg-neutral-200" />
                  </div>

                  <Button type="button" variant="secondary" fullWidth className="justify-center border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50">
                    <span className="flex items-center gap-2">
                      <GoogleMark />
                      Continue with Google
                    </span>
                  </Button>
                </>
              )}

              <div className="pt-2 text-center text-sm text-neutral-500">
                {theme.showSignup ? (
                  <>
                    Don't have an account?{' '}
                    <Link to={theme.signupPath} className={`font-semibold ${theme.linkClass}`}>
                      {theme.signupText}
                    </Link>
                  </>
                ) : (
                  <p>Admin accounts are provisioned internally and cannot be self-registered.</p>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
