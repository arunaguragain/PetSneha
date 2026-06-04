import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth.api';
import { Button, Card, IconBox, Input, InfoBox, PetSnehaLogo } from '../../components/ui';
import { isValidEmail } from '../../utils/helpers';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitRequest = async () => {
    if (!email || !isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch (apiError) {
      setError(typeof apiError === 'string' ? apiError : 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitRequest();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-[420px]">
        <Card className="w-full rounded-2xl p-8 shadow-md">
          <div className="mx-auto flex justify-center">
            <PetSnehaLogo />
          </div>

          {!submitted ? (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <IconBox size="lg" className="mx-auto bg-primary-50 text-primary-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M7 11V8.5C7 5.46243 9.46243 3 12.5 3C15.5376 3 18 5.46243 18 8.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6.5 11H18.5C19.3284 11 20 11.6716 20 12.5V19.5C20 20.3284 19.3284 21 18.5 21H6.5C5.67157 21 5 20.3284 5 19.5V12.5C5 11.6716 5.67157 11 6.5 11Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </IconBox>

              <div className="space-y-2 text-center">
                <h1 className="text-heading-lg font-display text-neutral-900">Forgot your password?</h1>
                <p className="text-body-md text-neutral-400">Enter your email address and we will send you a link to reset your password.</p>
              </div>

              {error ? <InfoBox type="error">{error}</InfoBox> : null}

              <Input label="Email address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" />

              <Button type="submit" fullWidth loading={loading}>
                Send reset link
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-primary-600">
                  ← Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="mt-8 space-y-5 text-center">
              <IconBox size="lg" className="mx-auto bg-success-50 text-success-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M20 7L10 17L4 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBox>

              <div className="space-y-2">
                <h1 className="text-heading-lg font-display text-neutral-900">Check your email</h1>
                <p className="text-body-md text-neutral-400">We sent a password reset link to {email}</p>
              </div>

              <Button type="button" variant="ghost" fullWidth className="text-primary-600" onClick={submitRequest} loading={loading}>
                Didn't receive the email? Resend
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-primary-600">
                  ← Back to login
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
