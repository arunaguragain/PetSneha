import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, IconBox, Input, InfoBox, PetSnehaLogo } from '../../components/ui';
import { resetPassword } from '../../api/auth.api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(token, { password, confirmPassword });
      setSubmitted(true);
    } catch (apiError) {
      setError(typeof apiError === 'string' ? apiError : 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[420px] items-center">
        <Card className="w-full p-8 shadow-md">
          <div className="mx-auto flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PetSneha logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-[22px] font-display font-semibold leading-none  text-primary-600">
              PetSneha
            </span>
          </div>

          {!submitted ? (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="flex justify-center">
                <IconBox size="lg" className="mx-auto bg-primary-50 text-primary-600">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                    <path d="M7 11V8.5C7 5.46243 9.46243 3 12.5 3C15.5376 3 18 5.46243 18 8.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6.5 11H18.5C19.3284 11 20 11.6716 20 12.5V19.5C20 20.3284 19.3284 21 18.5 21H6.5C5.67157 21 5 20.3284 5 19.5V12.5C5 11.6716 5.67157 11 6.5 11Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </IconBox>
              </div>

              <div className="space-y-2 text-center">
                <h1 className="text-heading-lg font-display text-neutral-900">Reset your password</h1>
                <p className="text-body-md text-neutral-400">Create a new password for your PetSneha account.</p>
              </div>

              {error ? <InfoBox type="error">{error}</InfoBox> : null}

              <Input label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a new password" />
              <Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your password" />

              <Button type="submit" fullWidth loading={loading}>
                Reset password
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
                <h1 className="text-heading-lg font-display text-neutral-900">Password updated</h1>
                <p className="text-body-md text-neutral-400">You can now sign in with your new password.</p>
              </div>
              <Button onClick={() => navigate('/login')} fullWidth>
                Back to login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
