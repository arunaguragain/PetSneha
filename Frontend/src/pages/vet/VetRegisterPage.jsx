import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileBadge,
  Hospital,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  Wallet,
} from 'lucide-react';
import { Button, Input, InfoBox } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { isValidEmail } from '../../utils/helpers';
import { createVetProfile } from '../../api/vet.api';

const benefitsList = [
  {
    Icon: ClipboardList,
    text: 'Build your digital clinic profile with credentials and availability'
  },
  {
    Icon: CheckCircle2,
    text: 'Get verified by PetSneha - trusted by pet owners across Nepal'
  },
  {
    Icon: CalendarDays,
    text: 'Manage appointments and patient records digitally'
  },
  {
    Icon: Star,
    text: 'Receive reviews and grow your reputation online'
  }
];

const inputIconClass = 'h-4 w-4 text-neutral-400';
const compactInputClass = 'h-9 rounded-xl py-1.5 text-sm';

export default function VetRegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { addToast } = useToast();

  const [formStep, setFormStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      await auth.register(name.trim(), email.trim(), password, confirmPassword, 'vet', phone.trim());

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

      addToast('Registration submitted!', 'success');
      setRegisteredEmail(email.trim());
      // Clear the auto-login session; vet must log in explicitly after admin verifies.
      auth.clearSession();
      setShowSuccess(true);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-neutral-50 font-body">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-[fadeInUp_0.3s_ease]">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2.4} />
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 font-display">Registration Submitted!</h2>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
              Thank you for joining PetSneha's veterinary network.
            </p>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Account Pending Verification
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your professional credentials and clinic details are being reviewed by our administrators.
                You will receive an email once your profile is verified and live, usually within <strong>24 hours</strong>.
              </p>
            </div>

            <div className="mt-4 text-left space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">What happens next</p>
              {[
                'Our team reviews your NMC license & credentials',
                'You receive a verification email once approved',
                'Your profile goes live and pet owners can book you',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#0046CE] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/vet/login', { state: { email: registeredEmail } })}
              className="mt-6 w-full bg-[#0046CE] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm inline-flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="h-screen grid grid-cols-1 xl:grid-cols-[0.58fr_1.22fr] overflow-hidden">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#065F46] via-[#059669] to-[#0046CE] text-white p-8 xl:p-9 2xl:p-12 xl:flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_14%)] pointer-events-none" />

          <div className="relative space-y-5">
            <div onClick={() => navigate('/vets-landing')} className="cursor-pointer hover:opacity-80 flex items-center gap-3">
              <img src="/logo.png" alt="PetSneha logo" className="h-9 w-9 object-contain brightness-0 invert" />
              <span className="text-[24px] font-display font-semibold leading-none text-white">PetSneha</span>
            </div>

            <div className="space-y-2.5">
              <h2 className="font-display text-[26px] 2xl:text-[34px] font-semibold leading-[1.15] text-white">
                Join Nepal's veterinary network
              </h2>
              <p className="text-[14px] text-white/75 leading-[1.6] max-w-md">
                Create your verified vet profile and start receiving bookings from pet owners across Kathmandu.
              </p>
            </div>

            <div className="space-y-3">
              {benefitsList.map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <p className="text-[14px] text-white/90 leading-relaxed pt-1.5">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-5 pt-4 border-t border-white/20 text-[13px] text-white/70">
            <span>Already have a PetSneha account? </span>
            <Link to="/vet/login" className="font-semibold text-white underline hover:text-neutral-100 transition ml-1 inline-flex items-center gap-1">
              Login instead <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="bg-neutral-50 px-4 py-3 sm:px-8 lg:px-10 xl:px-12 2xl:px-16 flex items-start justify-center overflow-hidden">
          <div className={`w-full pt-9 2xl:pt-12 ${formStep === 1 ? 'max-w-[620px]' : 'max-w-[900px]'}`}>
            <div className="mb-3">
              <h2 className="font-display text-[24px] sm:text-[26px] text-neutral-900 font-bold mb-0.5">
                Create your vet account
              </h2>
              <p className="text-[13px] text-neutral-400">
                Fill in your details. Our team will verify your credentials within 24 hours.
              </p>
            </div>

            <div className="mb-3 flex items-center gap-2 bg-neutral-100/80 px-3 py-1.5 rounded-full w-fit">
              <span className="text-xs font-semibold text-neutral-600 font-body leading-none">Step {formStep} of 2</span>
              <div className="flex gap-1.5 ml-2">
                <span className={`w-2 h-2 rounded-full transition-colors duration-250 ${formStep >= 1 ? 'bg-success' : 'bg-neutral-200'}`} />
                <span className={`w-2 h-2 rounded-full transition-colors duration-250 ${formStep === 2 ? 'bg-success' : 'bg-neutral-200'}`} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`[&_.form-group]:space-y-1.5 [&_.form-label]:text-[13px] [&_.form-label]:font-bold ${formStep === 1 ? 'space-y-3' : 'space-y-2'}`}
            >
              {formStep === 1 && (
                <div className="space-y-3">
                  <Input
                    label="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    placeholder="Dr. Anita Rai"
                    className={compactInputClass}
                    leftIcon={<User className={inputIconClass} />}
                  />

                  <Input
                    label="Email Address"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="anita.rai@gmail.com"
                    className={compactInputClass}
                    leftIcon={<Mail className={inputIconClass} />}
                  />

                  <Input
                    label="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="9841234567"
                    className={compactInputClass}
                    leftIcon={<Phone className={inputIconClass} />}
                  />

                  <Input
                    label="Password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    placeholder="Password"
                    className={compactInputClass}
                    leftIcon={<Lock className={inputIconClass} />}
                  />

                  <Input
                    label="Confirm"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    placeholder="Confirm"
                    className={compactInputClass}
                    leftIcon={<ShieldCheck className={inputIconClass} />}
                  />

                  <InfoBox type="info" className="rounded-xl p-2.5 text-xs">
                    <span className="inline-flex items-center gap-2">
                      <Info className="h-4 w-4 shrink-0" />
                      Use your professional email address.
                    </span>
                  </InfoBox>

                  <Button
                    type="button"
                    fullWidth
                    className="justify-center bg-success hover:bg-success-600 text-white font-bold rounded-xl border-none !py-2.5 mt-1"
                    onClick={handleStep1Next}
                  >
                    Continue to clinic details <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-sm text-neutral-500 pt-1">
                    Already have an account?{' '}
                    <Link to="/vet/login" className="font-semibold text-primary-600 hover:text-primary-700 transition">
                      Sign In
                    </Link>
                  </p>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition flex items-center gap-1 focus:outline-none"
                    onClick={() => setFormStep(1)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to account details
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <Input
                      label="Clinic Name"
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      error={errors.clinicName}
                      placeholder="Gokarna Animal Clinic"
                      className={compactInputClass}
                      leftIcon={<Hospital className={inputIconClass} />}
                    />

                    <Input
                      label="NMC License Number"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      error={errors.licenseNumber}
                      placeholder="NMC 1234"
                      className={compactInputClass}
                      leftIcon={<FileBadge className={inputIconClass} />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <Input
                      label="Specialisation"
                      required
                      value={specialisation}
                      onChange={(e) => setSpecialisation(e.target.value)}
                      error={errors.specialisation}
                      placeholder="Surgery, Canine Medicine"
                      className={compactInputClass}
                      leftIcon={<Stethoscope className={inputIconClass} />}
                    />
                    <Input
                      label="Consultation Fee (Rs)"
                      required
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      error={errors.consultationFee}
                      placeholder="500"
                      className={compactInputClass}
                      leftIcon={<Wallet className={inputIconClass} />}
                    />
                  </div>

                  <Input
                    label="Location / Address"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    error={errors.location}
                    placeholder="Chabahil, Kathmandu"
                    className={compactInputClass}
                    leftIcon={<MapPin className={inputIconClass} />}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-label-lg font-bold text-neutral-800">Available days</label>
                    <div className="grid grid-cols-7 gap-2.5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                      const active = availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`chip h-7 w-full justify-center rounded-xl px-0 py-0 text-xs ${
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <Input
                        label="Open Time"
                        type="time"
                        value={openTime}
                        disabled={is24Hours}
                        onChange={(e) => setOpenTime(e.target.value)}
                        error={errors.openTime}
                        className={compactInputClass}
                      />
                      <Input
                        label="Close Time"
                        type="time"
                        value={closeTime}
                        disabled={is24Hours}
                        onChange={(e) => setCloseTime(e.target.value)}
                        error={errors.closeTime}
                        className={compactInputClass}
                      />
                  </div>

                  <label className="flex items-center gap-2 select-none pt-0.5">
                    <input
                      type="checkbox"
                      checked={is24Hours}
                      onChange={(e) => setIs24Hours(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-success focus:ring-success/15"
                    />
                    <span className="text-sm font-semibold text-neutral-600">Open 24 hours</span>
                  </label>

                  <div className="space-y-1">
                    <label className="flex items-start gap-2 select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300 text-success focus:ring-success/15"
                      />
                      <span className="text-xs text-neutral-500 leading-snug">
                        I confirm that the information I have provided is accurate and I agree to PetSneha's{' '}
                        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                    {errors.agreedToTerms && <p className="form-error mt-1">{errors.agreedToTerms}</p>}
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs leading-5 text-primary-700">
                    <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Admin review usually finishes within 24 hours, and you will receive an email when your profile is live.</span>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="justify-center bg-success hover:bg-success-600 text-white font-bold rounded-xl border-none !py-2.5 mt-1 transition"
                  >
                    Submit for verification <ShieldCheck className="h-4 w-4" />
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
