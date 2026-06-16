import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, IconBox, PetSnehaLogo } from '../../components/ui';

export default function VetLandingPage() {
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="bg-neutral-50 text-neutral-800 font-body min-h-screen">
      {/* SECTION 1: NAVBAR */}
      <header className="navbar bg-white sticky top-0 z-40">
        <div className="w-full h-full flex items-center px-4 lg:px-10 justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
              <span className="text-label-lg font-display text-primary-600 text-lg">PetSneha</span>
            </Link>
          </div>

          {/* Centre: Nav links */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Primary navigation">
            <button
              onClick={() => handleScroll('how-it-works')}
              className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600 focus:outline-none"
            >
              How it works
            </button>
            <button
              onClick={() => handleScroll('benefits')}
              className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600 focus:outline-none"
            >
              Benefits
            </button>
            <button
              onClick={() => handleScroll('faq')}
              className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600 focus:outline-none"
            >
              FAQ
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="font-semibold px-4 py-2 hover:bg-neutral-100"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              className="bg-success hover:bg-success-600 text-white font-bold rounded-full border-none shadow-sm transition"
              onClick={() => navigate('/vet/register')}
            >
              Join as a vet →
            </Button>
          </div>
        </div>
      </header>

      {/* SECTION 2: HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#065F46] via-[#059669] to-[#0046CE] text-white py-20 px-4 sm:px-12 lg:px-20 min-h-[580px] flex items-center">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.15),transparent_25%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_20%)]" />

        <div className="relative w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <span className="inline-flex bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white tracking-wide uppercase">
              🏥 For Veterinary Professionals
            </span>
            
            <h1 className="font-display text-[40px] sm:text-[48px] text-white font-bold leading-[1.1] tracking-[-1.5px]">
              Reach more pet owners <span className="block mt-1">across Nepal</span>
            </h1>
            
            <p className="text-[16px] text-white/80 leading-[1.75] max-w-xl">
              Join PetSneha's verified vet network and grow your practice.
              Get discovered by thousands of pet owners in Kathmandu — manage
              bookings, health records, and client communication all in one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-white text-primary-700 font-bold hover:bg-neutral-50 rounded-2xl px-6 py-3 shadow-md border-none"
                onClick={() => navigate('/vet/register')}
              >
                Get started free →
              </Button>
              <Button
                variant="ghost"
                className="text-white border-2 border-white/40 hover:bg-white/10 rounded-2xl px-6 py-3"
                onClick={() => handleScroll('how-it-works')}
              >
                See how it works
              </Button>
            </div>

            <div className="flex items-center flex-wrap gap-3 mt-4 text-[13px] text-white/75 font-medium">
              <span>50+ Verified vets</span>
              <span>·</span>
              <span>🌟 4.8 avg rating</span>
              <span>·</span>
              <span>1,200+ appointments</span>
            </div>
          </div>

          {/* Right Column - Decorative Card Mockup */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[460px] h-[360px] bg-white/8 border border-white/18 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="font-display text-white font-semibold text-[16px]">🏥 Dr. Anita Rai</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/20 px-2.5 py-1 text-xs font-semibold text-success-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-DEFAULT animate-pulse" />
                  Online
                </span>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white leading-none">12</p>
                  <p className="text-[10px] text-white/75 mt-1">Appointments</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white leading-none">4.8 ★</p>
                  <p className="text-[10px] text-white/75 mt-1">Rating</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white leading-none">89</p>
                  <p className="text-[10px] text-white/75 mt-1">Total Patients</p>
                </div>
              </div>

              {/* Appointment preview */}
              <div className="bg-white/10 rounded-xl p-3 mt-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wider mb-1.5">Next appointment</p>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold">
                      SB
                    </span>
                    <div>
                      <p className="text-[12px] text-white font-medium leading-none">Sachin B. — Buddy</p>
                      <p className="text-[10px] text-white/60 mt-0.5">Labrador Retriever</p>
                    </div>
                    <span className="text-[11px] text-white/70 ml-auto bg-white/10 px-2 py-0.5 rounded">
                      10:00 AM
                    </span>
                  </div>
                </div>
                <button className="w-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold py-2 rounded-lg transition mt-2">
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STATS ROW */}
      <section className="-mt-10 relative z-10 max-w-[1100px] mx-auto px-4 sm:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-white shadow-card border border-neutral-200 text-center">
            <p className="font-display text-[28px] text-success-DEFAULT font-bold">500+</p>
            <p className="text-[13px] text-neutral-500 font-semibold mt-1">Pet owners active</p>
          </Card>
          <Card className="p-6 bg-white shadow-card border border-neutral-200 text-center">
            <p className="font-display text-[28px] text-success-DEFAULT font-bold">50+</p>
            <p className="text-[13px] text-neutral-500 font-semibold mt-1">Verified doctors</p>
          </Card>
          <Card className="p-6 bg-white shadow-card border border-neutral-200 text-center">
            <p className="font-display text-[28px] text-success-DEFAULT font-bold">Rs 0</p>
            <p className="text-[13px] text-neutral-500 font-semibold mt-1">Platform joining fee</p>
          </Card>
          <Card className="p-6 bg-white shadow-card border border-neutral-200 text-center">
            <p className="font-display text-[28px] text-success-DEFAULT font-bold">4.8 ★</p>
            <p className="text-[13px] text-neutral-500 font-semibold mt-1">Average vet rating</p>
          </Card>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-20 px-4 sm:px-10">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-display text-[32px] font-bold text-center text-neutral-900 mb-2">How it works</h2>
          <p className="text-[15px] text-neutral-500 text-center mb-16 max-w-lg mx-auto">
            Get your profile verification and start receiving bookings in 3 simple steps
          </p>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center relative text-center">
              <div className="w-12 h-12 rounded-full bg-success-50 border-2 border-success-DEFAULT text-[20px] font-bold text-success-DEFAULT flex items-center justify-center mb-5 shadow-sm">
                1
              </div>
              <IconBox size="lg" className="bg-primary-50 mb-4 text-primary-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </IconBox>
              <h3 className="text-[18px] font-bold text-neutral-900 mb-2">Register your clinic</h3>
              <p className="text-[13px] text-neutral-500 leading-[1.65] px-4">
                Create your vet profile with your license, specialisation, fees, and availability.
              </p>

              {/* Arrow to Step 2 */}
              <div className="hidden md:block absolute top-6 -right-6 translate-x-1/2 text-neutral-300 text-[28px] font-semibold">
                →
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative text-center">
              <div className="w-12 h-12 rounded-full bg-success-50 border-2 border-success-DEFAULT text-[20px] font-bold text-success-DEFAULT flex items-center justify-center mb-5 shadow-sm">
                2
              </div>
              <IconBox size="lg" className="bg-primary-50 mb-4 text-primary-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </IconBox>
              <h3 className="text-[18px] font-bold text-neutral-900 mb-2">Get verified by admin</h3>
              <p className="text-[13px] text-neutral-500 leading-[1.65] px-4">
                Our team reviews your credentials and verifies your profile — usually within 24 hours.
              </p>

              {/* Arrow to Step 3 */}
              <div className="hidden md:block absolute top-6 -right-6 translate-x-1/2 text-neutral-300 text-[28px] font-semibold">
                →
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-success-50 border-2 border-success-DEFAULT text-[20px] font-bold text-success-DEFAULT flex items-center justify-center mb-5 shadow-sm">
                3
              </div>
              <IconBox size="lg" className="bg-primary-50 mb-4 text-primary-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </IconBox>
              <h3 className="text-[18px] font-bold text-neutral-900 mb-2">Start receiving bookings</h3>
              <p className="text-[13px] text-neutral-500 leading-[1.65] px-4">
                Pet owners can find, book, and pay for appointments with you directly through PetSneha.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: BENEFITS */}
      <section id="benefits" className="bg-neutral-50 py-20 px-4 sm:px-10">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-display text-[32px] font-bold text-center text-neutral-900 mb-2">Why join PetSneha?</h2>
          <p className="text-[15px] text-neutral-500 text-center mb-12">
            Grow your veterinary practice with powerful, built-in digital tools
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between">
              <div>
                <IconBox className="mb-4 bg-primary-50 text-primary-600">
                  <span className="text-xl">🌍</span>
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Get discovered</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Be visible to thousands of pet owners searching for vets in Kathmandu Valley.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between">
              <div>
                <IconBox className="mb-4 bg-primary-50 text-primary-600">
                  <span className="text-xl">📅</span>
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Online bookings</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Manage your appointments digitally — no more phone calls or manual scheduling.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between">
              <div>
                <IconBox className="mb-4 bg-primary-50 text-primary-600">
                  <span className="text-xl">📋</span>
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Digital health records</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Add visit notes and treatment records directly to pet profiles after each appointment.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between">
              <div>
                <IconBox className="mb-4 bg-primary-50 text-primary-600">
                  <span className="text-xl">⭐</span>
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Build your reputation</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Collect verified reviews from pet owners and showcase your credentials.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between">
              <div>
                <IconBox className="mb-4 bg-primary-50 text-primary-600">
                  <span className="text-xl">🔔</span>
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Smart notifications</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Receive instant alerts for new bookings, cancellations, and messages.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between">
              <div>
                <IconBox className="mb-4 bg-primary-50 text-primary-600">
                  <span className="text-xl">Rs</span>
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Transparent fees</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Set your own consultation fee. PetSneha charges no commission per appointment.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIAL */}
      <section className="bg-white py-16 px-4 sm:px-10">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-display text-[26px] font-bold text-center text-neutral-900 mb-10">What our vets say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="text-warning-DEFAULT text-[14px] mb-3 flex gap-0.5">
                  ★★★★★
                </div>
                <p className="text-[14px] text-neutral-600 italic leading-[1.7] mb-6">
                  "PetSneha has completely transformed how I manage my practice. Bookings are so much easier now."
                </p>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <p className="font-bold text-neutral-800 text-sm">— Dr. Anita Rai</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">Gokarna Animal Clinic</p>
              </div>
            </Card>

            <Card className="p-6 bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="text-warning-DEFAULT text-[14px] mb-3 flex gap-0.5">
                  ★★★★★
                </div>
                <p className="text-[14px] text-neutral-600 italic leading-[1.7] mb-6">
                  "Getting verified was quick and my profile was live within a day. I've had 40+ new patients since joining."
                </p>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <p className="font-bold text-neutral-800 text-sm">— Dr. Ramesh Sharma</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">Lalitpur Pet Clinic</p>
              </div>
            </Card>

            <Card className="p-6 bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="text-warning-DEFAULT text-[14px] mb-3 flex gap-0.5">
                  ★★★★★
                </div>
                <p className="text-[14px] text-neutral-600 italic leading-[1.7] mb-6">
                  "The digital health records feature is brilliant — I can update pet records right after the visit."
                </p>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <p className="font-bold text-neutral-800 text-sm">— Dr. Rita Koirala</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">Kapan Vet Centre</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ADDITIONAL SECTION: FAQ Accordion */}
      <section id="faq" className="bg-neutral-50 py-20 px-4 sm:px-10 border-t border-neutral-200">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-display text-[32px] font-bold text-center text-neutral-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-[15px] text-neutral-500 text-center mb-12">
            Everything you need to know about joining Nepal's leading vet platform
          </p>

          <div className="space-y-4">
            <Card className="p-5 bg-white border border-neutral-200">
              <h4 className="font-bold text-[16px] text-neutral-900 mb-2">How long does verification take?</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Our administrator reviews your NMC license registration, clinic details, and identification credentials. The verification process is usually completed within 24 hours.
              </p>
            </Card>

            <Card className="p-5 bg-white border border-neutral-200">
              <h4 className="font-bold text-[16px] text-neutral-900 mb-2">Are there any registration or platform listing fees?</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Joining PetSneha is 100% free for veterinary practitioners. We charge no listing fees, and we do not deduct commissions from your appointment consultation fees.
              </p>
            </Card>

            <Card className="p-5 bg-white border border-neutral-200">
              <h4 className="font-bold text-[16px] text-neutral-900 mb-2">Can I manage my own schedule?</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Yes! You have full control over your active days, open/close operational times, and calendar slot availability directly inside your vet dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA BANNER */}
      <section className="px-4 sm:px-10">
        <div className="max-w-[1100px] mx-auto mb-16 bg-gradient-to-r from-[#065F46] to-[#0046CE] rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="font-display text-[26px] sm:text-[28px] text-white font-bold leading-tight">
              Ready to grow your practice?
            </h3>
            <p className="text-[14px] text-white/80 font-medium">
              Join 50+ verified vets already using PetSneha in Kathmandu.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Button
              className="bg-white text-primary-700 font-bold hover:bg-neutral-50 rounded-2xl px-6 py-4 shadow-md border-none text-sm transition"
              onClick={() => navigate('/vet/register')}
            >
              Get started free →
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 8: FOOTER */}
      <footer className="bg-neutral-900 py-10 px-4 sm:px-10 text-white">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left: Brand logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain brightness-0 invert" />
            <span className="text-label-lg font-display text-white text-lg">PetSneha</span>
          </div>

          {/* Centre: Copy */}
          <p className="text-[12px] text-neutral-500 font-medium text-center">
            © 2026 PetSneha · For Veterinary Professionals
          </p>

          {/* Right: Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[13px] text-neutral-500">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition">Contact</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition">Terms</a>
            <span className="text-neutral-700">|</span>
            <Link to="/" className="text-primary-400 font-semibold hover:text-primary-300 transition">
              Looking for a vet? →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
