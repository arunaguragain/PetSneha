import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, InfoBox } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { isValidEmail, validatePassword } from '../../utils/helpers';
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

function FieldIcon({ src, alt }) {
  return <img src={src} alt={alt} className="h-5 w-5 object-contain" />;
}

const featureItems = [
  {
    icon: '/icon_register.png',
    title: 'Expert Vet Network',
    description: "Connect with Nepal's top licensed veterinarians instantly.",
  },
  {
    icon: '/icon_register1.png',
    title: 'Digital Health Records',
    description: 'Keep all vaccinations, prescriptions, and history in one secure place.',
  },
  {
    icon: '/icon_register2.png',
    title: 'Smart Reminders',
    description: 'Never miss a deworming or a check-up ever again.',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!name || name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    if (!email || !isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      nextErrors.password = passwordValidation.errors[0];
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agree) {
      nextErrors.agree = 'You must agree to continue.';
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
      await auth.register(name.trim(), email.trim(), password, confirmPassword, 'petOwner');
      // Clear the auto-login session — user must log in explicitly
      auth.clearSession();
      navigate('/login', { replace: true, state: { email: email.trim() } });
    } catch (apiError) {
      const message = apiError?.response?.data?.message || apiError?.message || 'Registration failed. Please try again.';
      setError(message);
      addToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-neutral-50 lg:h-screen">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
        <section className="relative flex h-full overflow-hidden bg-[linear-gradient(135deg,#0046CE_0%,#0037A7_55%,#0052D9_100%)] px-8 py-8 text-white sm:px-12 lg:px-16 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_14%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />

          <div className="relative flex w-full flex-col gap-20">
            <div onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 flex items-center gap-3">
              <img src="/logo.png" alt="PetSneha logo" className="h-10 w-10 object-contain brightness-0 invert" />
              <span className="text-[28px] font-display font-semibold leading-none text-white">PetSneha</span>
            </div>

            <div className="max-w-xl space-y-8 py-8 lg:py-0">
              <div className="space-y-4">
                <h1 
                  className="text-[48px] font-display  text-white"
                  style={{
                    fontWeight: 700,                         
                    fontVariationSettings: '"opsz" 48',      
                  }}
                >
                  Care for your pet,
                  <span 
                    className="block italic"
                    style={{
                      fontWeight: 700,
                      fontVariationSettings: '"opsz" 48',
                    }}
                  >
                    the right way.</span>
                </h1>
              </div>

              

              <div className="space-y-5">
                {featureItems.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/14">
                      <FieldIcon src={item.icon} alt={item.title} />
                    </span>
                    <div>
                      <p className="text-label-lg text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/60">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex h-full items-center justify-center overflow-hidden bg-neutral-50 px-5 py-6 sm:px-8 lg:px-12 lg:py-0">
          <div className="w-full max-w-[520px] space-y-6">
            <div className="space-y-1">
              <h2 className="text-heading-lg font-display text-neutral-900">Create your account</h2>
              <p className="text-sm text-neutral-500">Join the community of dedicated pet parents in Nepal.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={fieldErrors.name}
                placeholder="Aruna Guragain"
                leftIcon={<img src="/profile.png" alt="profile icon" className="w-4 h-4"/>}
              />

              <Input
                label="Email Address"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldErrors.email}
                placeholder="guragain@gmail.com"
                leftIcon={<img src="/mail.png" alt="mail icon" className="w-4 h-3"/>}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={fieldErrors.password}
                  placeholder="••••••••"
                  leftIcon={<img src="/lock.png" alt="lock icon" className="w-3 h-4"/>}
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
                <Input
                  label="Confirm"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={fieldErrors.confirmPassword}
                  placeholder="••••••••"
                  leftIcon={<img src="/shield.png" alt="shield icon" className="w-4 h-4"/>}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="text-neutral-500 transition hover:text-neutral-700"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2 text-sm text-neutral-600">
                  <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600/15" />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="text-primary-600">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {fieldErrors.agree ? <p className="form-error">{fieldErrors.agree}</p> : null}
              </div>

              {error ? <InfoBox type="error">{error}</InfoBox> : null}

              <Button type="submit" fullWidth loading={loading} className="justify-center bg-primary-600 text-white hover:bg-primary-700">
                Create Account →
              </Button>

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

              <p className="pt-2 text-center text-sm text-neutral-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
