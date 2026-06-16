import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, InfoBox } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { isValidEmail } from '../../utils/helpers';
import { createVetProfile } from '../../api/vet.api';

const benefitsList = [
  {
    icon: '📋',
    text: 'Build your digital clinic profile with credentials and availability'
  },
  {
    icon: '✅',
    text: 'Get verified by PetSneha — trusted by pet owners across Nepal'
  },
  {
    icon: '📅',
    text: 'Manage appointments and patient records digitally'
  },
  {
    icon: '⭐',
    text: 'Receive reviews and grow your reputation online'
  }
];

export default function VetRegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { addToast } = useToast();

  const [formStep, setFormStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [clinicName, setClinicName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialisation, setSpecialisation] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [location, setLocation] = useState('');
  const [availableDays, setAvailableDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('17:00');
  const [is24Hours, setIs24Hours] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleDayToggle = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleStep1Next = () => {
    const nextErrors = {};

    if (!name || name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    if (!email || !isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!phone || phone.trim().length < 7) {
      nextErrors.phone = 'Enter a valid phone number.';
    }

    if (!password || password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setFormStep(2);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!clinicName || clinicName.trim().length < 2) {
      nextErrors.clinicName = 'Clinic name is required.';
    }

    if (!licenseNumber || licenseNumber.trim().length < 2) {
      nextErrors.licenseNumber = 'NMC license number is required.';
    }

    if (!specialisation || specialisation.trim().length < 2) {
      nextErrors.specialisation = 'Specialisation is required.';
    }

    const feeNum = parseFloat(consultationFee);
    if (!consultationFee || isNaN(feeNum) || feeNum <= 0) {
      nextErrors.consultationFee = 'Consultation fee must be a number greater than 0.';
    }

    if (!location || location.trim().length < 2) {
      nextErrors.location = 'Clinic location / address is required.';
    }

    if (!availableDays || availableDays.length === 0) {
      nextErrors.availableDays = 'Please select at least one available day.';
    }

    if (!agreedToTerms) {
      nextErrors.agreedToTerms = 'You must agree to continue.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register user account
      await auth.register(name.trim(), email.trim(), password, confirmPassword, 'vet', phone.trim());

      // Step 2: Create vet profile (token is in localStorage)
      await createVetProfile({
        name: name.trim(),
        clinicName: clinicName.trim(),
        licenseNumber: licenseNumber.trim(),
        specialisation: specialisation.trim(),
        consultationFee: parseInt(consultationFee, 10),
        location: location.trim(),
        availability: {
          days: availableDays,
          openTime: is24Hours ? '00:00' : openTime,
          closeTime: is24Hours ? '23:59' : closeTime,
          is24Hours
        }
      });

      addToast('✓ Registration submitted!', 'success');
      setRegisteredEmail(email.trim());
      // Clear the auto-login session — vet must log in explicitly after admin verifies
      auth.clearSession();
      setShowSuccess(true);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-body">

      {/* ── Verification Success Overlay ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-[fadeInUp_0.3s_ease]">
            {/* Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 font-display">Registration Submitted!</h2>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
              Thank you for joining PetSneha's veterinary network.
            </p>

            {/* Info box */}
            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <span>⏳</span> Account Pending Verification
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your professional credentials and clinic details are being reviewed by our administrators.
                You will receive an email once your profile is verified and live — usually within <strong>24 hours</strong>.
              </p>
            </div>

            {/* What happens next */}
            <div className="mt-5 text-left space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">What happens next</p>
              {[
                'Our team reviews your NMC license & credentials',
                'You receive a verification email once approved',
                'Your profile goes live — pet owners can book you',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#0046CE] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/login', { state: { email: registeredEmail } })}
              className="mt-7 w-full bg-[#0046CE] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Go to Login →
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="navbar bg-white sticky top-0 z-40 border-b border-neutral-200">
        <div className="w-full h-full flex items-center px-6 justify-between">
          <div onClick={() => navigate('/vets-landing')} className="cursor-pointer hover:opacity-80 flex items-center gap-3">
            <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
            <span className="text-label-lg font-display text-primary-600 text-lg">PetSneha</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 hidden sm:inline">Already registered?</span>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full border-neutral-300 font-semibold text-neutral-800"
              onClick={() => navigate('/login')}
            >
              Login →
            </Button>
          </div>
        </div>
      </header>

      {/* SPLIT LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT PANEL */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#065F46] via-[#059669] to-[#0046CE] text-white p-10 lg:p-16 flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_14%)] pointer-events-none" />
          
          <div className="relative space-y-10">
            <div onClick={() => navigate('/vets-landing')} className="cursor-pointer hover:opacity-80 flex items-center gap-3">
              <img src="/logo.png" alt="PetSneha logo" className="h-10 w-10 object-contain brightness-0 invert" />
              <span className="text-[28px] font-display font-semibold leading-none text-white">PetSneha</span>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[34px] font-semibold leading-[1.2] text-white">
                Join Nepal's veterinary network
              </h2>
              <p className="text-[15px] text-white/75 leading-[1.7] max-w-md">
                Create your verified vet profile and start receiving bookings from pet owners across Kathmandu.
              </p>
            </div>

            <div className="space-y-5">
              {benefitsList.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg">
                    {benefit.icon}
                  </span>
                  <p className="text-[14px] text-white/90 leading-relaxed pt-1.5">
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-12 pt-8 border-t border-white/20 text-[13px] text-white/70">
            <span>Already have a PetSneha account? </span>
            <Link to="/login" className="font-semibold text-white underline hover:text-neutral-100 transition ml-1">
              Login instead →
            </Link>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="bg-neutral-50 px-6 py-10 lg:px-16 flex items-center justify-center">
          <div className="w-full max-w-[420px] space-y-6">
            <div>
              <h2 className="font-display text-[26px] text-neutral-900 font-bold mb-1">
                Create your vet account
              </h2>
              <p className="text-[14px] text-neutral-400">
                Fill in your details — our team will verify your credentials within 24 hours.
              </p>
            </div>

            {/* STEP INDICATOR */}
            <div className="flex items-center gap-2 mb-6 bg-neutral-100/80 px-3 py-1.5 rounded-full w-fit">
              <span className="text-xs font-semibold text-neutral-600 font-body leading-none">Step {formStep} of 2</span>
              <div className="flex gap-1.5 ml-2">
                <span className={`w-2 h-2 rounded-full transition-colors duration-250 ${formStep >= 1 ? 'bg-success' : 'bg-neutral-200'}`} />
                <span className={`w-2 h-2 rounded-full transition-colors duration-250 ${formStep === 2 ? 'bg-success' : 'bg-neutral-200'}`} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STEP 1 FIELDS */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    placeholder="Dr. Anita Rai"
                    leftIcon={<img src="/profile.png" alt="profile icon" className="w-4 h-4"/>}
                  />

                  <Input
                    label="Email Address"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="anita.rai@gmail.com"
                    leftIcon={<img src="/mail.png" alt="mail icon" className="w-4 h-3"/>}
                  />

                  <Input
                    label="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="9841234567"
                    leftIcon={
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      placeholder="••••••••"
                      leftIcon={<img src="/lock.png" alt="lock icon" className="w-3 h-4"/>}
                    />
                    <Input
                      label="Confirm"
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      placeholder="••••••••"
                      leftIcon={<img src="/shield.png" alt="shield icon" className="w-4 h-4"/>}
                    />
                  </div>

                  <InfoBox type="info" className="mt-2 text-xs">
                    ℹ️ Use your professional email address — it will be visible on your public profile.
                  </InfoBox>

                  <Button
                    type="button"
                    fullWidth
                    className="justify-center bg-success hover:bg-success-600 text-white font-bold rounded-2xl border-none mt-2"
                    onClick={handleStep1Next}
                  >
                    Continue to clinic details →
                  </Button>

                  <div className="flex items-center gap-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400 my-4">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-neutral-200" />
                  </div>

                  <p className="text-center text-sm text-neutral-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition">
                      Sign In
                    </Link>
                  </p>
                </div>
              )}

              {/* STEP 2 FIELDS */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <button
                    type="button"
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition flex items-center gap-1 focus:outline-none mb-2"
                    onClick={() => setFormStep(1)}
                  >
                    ← Back to account details
                  </button>

                  <Input
                    label="Clinic Name"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    error={errors.clinicName}
                    placeholder="Gokarna Animal Clinic"
                    leftIcon={
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                  />

                  <Input
                    label="NMC License Number"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    error={errors.licenseNumber}
                    placeholder="NMC 1234"
                    leftIcon={
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  />

                  <Input
                    label="Specialisation"
                    required
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    error={errors.specialisation}
                    placeholder="Surgery, Canine Medicine"
                    leftIcon={
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Consultation Fee (Rs)"
                      required
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      error={errors.consultationFee}
                      placeholder="500"
                      leftIcon={<span className="text-[12px] font-bold text-neutral-400">Rs</span>}
                    />
                    <Input
                      label="Location / Address"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      error={errors.location}
                      placeholder="Chabahil, Kathmandu"
                      leftIcon={
                        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    />
                  </div>

                  {/* Available Days */}
                  <div>
                    <label className="block text-label-lg font-bold text-neutral-800 mb-2 mt-1">Available days</label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                        const active = availableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`chip ${
                              active
                                ? '!bg-success !border-success !text-white'
                                : 'border-neutral-200 text-neutral-700 hover:border-success/50 hover:text-success'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {errors.availableDays && <p className="form-error mt-1">{errors.availableDays}</p>}
                  </div>

                  {/* Open/Close Hours */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Input
                      label="Open Time"
                      type="time"
                      value={openTime}
                      disabled={is24Hours}
                      onChange={(e) => setOpenTime(e.target.value)}
                      error={errors.openTime}
                    />
                    <Input
                      label="Close Time"
                      type="time"
                      value={closeTime}
                      disabled={is24Hours}
                      onChange={(e) => setCloseTime(e.target.value)}
                      error={errors.closeTime}
                    />
                  </div>

                  {/* 24 Hours Checkbox */}
                  <label className="flex items-center gap-2 mt-1 select-none">
                    <input
                      type="checkbox"
                      checked={is24Hours}
                      onChange={(e) => setIs24Hours(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-success focus:ring-success/15"
                    />
                    <span className="text-sm font-semibold text-neutral-600">Open 24 hours</span>
                  </label>

                  {/* Terms Checkbox */}
                  <div className="space-y-1">
                    <label className="flex items-start gap-2 mt-3 select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300 text-success focus:ring-success/15"
                      />
                      <span className="text-xs text-neutral-500 leading-tight">
                        I confirm that the information I have provided is accurate and I agree to PetSneha's{' '}
                        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                    {errors.agreedToTerms && <p className="form-error mt-1">{errors.agreedToTerms}</p>}
                  </div>

                  <InfoBox type="info" className="mt-3 text-xs">
                    ⏱ After registration, our admin team will review and verify your credentials.
                    You will receive an email once your profile is live — usually within 24 hours.
                  </InfoBox>

                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="justify-center bg-success hover:bg-success-600 text-white font-bold rounded-2xl border-none mt-4 transition"
                  >
                    Submit for verification
                  </Button>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
