import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, IconBox } from '../../components/ui';
import { Hospital, Star, Stethoscope, Globe, CalendarDays, ClipboardList, Bell, Wallet } from 'lucide-react';

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
      <header className="navbar bg-white sticky top-0 z-40 border-b border-neutral-100">
        {/* Adjusted padding to perfectly match the hero section alignment */}
        <div className="max-w-[1440px] mx-auto w-full h-full flex items-center px-6 sm:px-12 lg:px-20 justify-between py-4">
          {/* Left: Logo */}
          <div className="flex items-center">
            <div onClick={() => navigate('/vets-landing')} className="cursor-pointer hover:opacity-80 flex items-center gap-3">
              <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
              <span className="text-label-lg font-display text-primary-600 text-lg font-bold">PetSneha</span>
            </div>
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
              className="font-semibold px-4 py-2 hover:bg-neutral-100 text-sm text-neutral-700"
              onClick={() => navigate('/vet/login')}
            >
              Login
            </Button>
            <Button
              className="bg-success hover:bg-success-600 text-white font-bold rounded-full border-none shadow-sm transition text-sm px-5 py-2.5"
              onClick={() => navigate('/vet/register')}
            >
              Join as a vet →
            </Button>
          </div>
        </div>
      </header>

      {/* SECTION 2: HERO */}
      {/* Rebalanced padding structure so it starts left beautifully without clipping edges */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#065F46] via-[#059669] to-[#0046CE] text-white py-16 md:py-24 px-6 sm:px-12 lg:px-20 min-h-[634px] flex items-center">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_20%)]" />

        {/* Outer wrapper max-width matches navbar limits for clean grid alignment */}
        <div className="relative w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Content) - Takes up 7/12 columns on large screens for a balanced look */}
          <div className="space-y-6 text-left flex flex-col items-start lg:col-span-7 z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
              <Hospital className="w-3.5 h-3.5" /> For Veterinary Professionals
            </span>
            
            <h1 className="font-display text-[36px] sm:text-[48px] lg:text-[54px] text-white font-bold leading-[1.15] tracking-tight">
              Reach more pet owners <span className="block mt-1">across Nepal</span>
            </h1>
            
            <p className="text-[15px] sm:text-[16px] text-white/85 leading-relaxed max-w-xl">
              Join PetSneha's verified vet network and grow your practice.
              Get discovered by thousands of pet owners in Kathmandu, manage
              bookings, health records, and client communication all in one place.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="white"
                className="!rounded-full !text-emerald-800 font-bold px-6 py-3 shadow-md border-none text-sm"
                onClick={() => navigate('/vet/register')}
              >
                Get started free →
              </Button>
              <Button
                variant="ghost"
                className="!rounded-full text-white border border-white/30 hover:bg-white/10 px-6 py-3 text-sm font-semibold transition"
                onClick={() => handleScroll('how-it-works')}
              >
                See how it works
              </Button>
            </div>
          </div>

          {/* Right Column (Card Mockup) - Takes up 5/12 columns on large screens */}
          <div className="w-full flex justify-center lg:justify-end lg:col-span-5 z-10">
            <div className="w-full max-w-[460px] bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-display text-white font-semibold text-[15px] flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" /> Dr. Anita Rai
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-white leading-none">12</p>
                  <p className="text-[10px] text-white/70 mt-1 font-medium">Appointments</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-white leading-none flex items-center justify-center gap-0.5">
                    4.8 <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
                  </p>
                  <p className="text-[10px] text-white/70 mt-1 font-medium">Rating</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-white leading-none">89</p>
                  <p className="text-[10px] text-white/70 mt-1 font-medium">Total Patients</p>
                </div>
              </div>

              {/* Appointment list content container */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">SB</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-white font-semibold truncate">Sachin B. — Buddy</p>
                    <p className="text-[10px] text-white/60 mt-0.5 truncate">Labrador Retriever</p>
                  </div>
                  <span className="text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-md font-medium flex-shrink-0">10:00 AM</span>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">AG</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-white font-semibold truncate">Aruna G. — Mimi</p>
                    <p className="text-[10px] text-white/60 mt-0.5 truncate">Cat</p>
                  </div>
                  <span className="text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-md font-medium flex-shrink-0">12:00 PM</span>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">SB</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-white font-semibold truncate">Sachin B. — Buddy</p>
                    <p className="text-[10px] text-white/60 mt-0.5 truncate">Labrador Retriever</p>
                  </div>
                  <span className="text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-md font-medium flex-shrink-0">10:00 AM</span>
                </div>
              </div>

              <button className="w-full bg-white text-emerald-900 hover:bg-neutral-50 text-[12px] font-bold py-2.5 rounded-xl transition shadow-sm mt-1">
                Confirm Booking
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-display text-[32px] font-bold text-center text-neutral-900 mb-2">How it works</h2>
          <p className="text-[15px] text-neutral-500 text-center mb-16 max-w-lg mx-auto">
            Get your profile verification and start receiving bookings in 3 simple steps
          </p>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center relative text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 text-[20px] font-bold text-emerald-600 flex items-center justify-center mb-5 shadow-sm">
                1
              </div>
              <IconBox size="lg" className="bg-emerald-50 mb-4 text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </IconBox>
              <h3 className="text-[18px] font-bold text-neutral-900 mb-2">Register your clinic</h3>
              <p className="text-[13px] text-neutral-500 leading-[1.65] px-4">
                Create your vet profile with your license, specialisation, fees, and availability.
              </p>
              <div className="hidden md:block absolute top-6 -right-6 translate-x-1/2 text-neutral-300 text-[28px] font-semibold">
                →
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 text-[20px] font-bold text-emerald-600 flex items-center justify-center mb-5 shadow-sm">
                2
              </div>
              <IconBox size="lg" className="bg-emerald-50 mb-4 text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </IconBox>
              <h3 className="text-[18px] font-bold text-neutral-900 mb-2">Get verified by admin</h3>
              <p className="text-[13px] text-neutral-500 leading-[1.65] px-4">
                Our team reviews your credentials and verifies your profile — usually within 24 hours.
              </p>
              <div className="hidden md:block absolute top-6 -right-6 translate-x-1/2 text-neutral-300 text-[28px] font-semibold">
                →
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 text-[20px] font-bold text-emerald-600 flex items-center justify-center mb-5 shadow-sm">
                3
              </div>
              <IconBox size="lg" className="bg-emerald-50 mb-4 text-emerald-600">
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
      <section id="benefits" className="bg-neutral-50 py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-display text-[32px] font-bold text-center text-neutral-900 mb-2">Why join PetSneha?</h2>
          <p className="text-[15px] text-neutral-500 text-center mb-12">
            Grow your veterinary practice with powerful, built-in digital tools
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between rounded-xl">
              <div>
                <IconBox className="mb-4 bg-emerald-50 text-emerald-600">
                  <Globe className="w-5 h-5" />
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Get discovered</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Be visible to thousands of pet owners searching for vets in Kathmandu Valley.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between rounded-xl">
              <div>
                <IconBox className="mb-4 bg-emerald-50 text-emerald-600">
                  <CalendarDays className="w-5 h-5" />
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Online bookings</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Manage your appointments digitally — no more phone calls or manual scheduling.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between rounded-xl">
              <div>
                <IconBox className="mb-4 bg-emerald-50 text-emerald-600">
                  <ClipboardList className="w-5 h-5" />
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Digital health records</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Add visit notes and treatment records directly to pet profiles after each appointment.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between rounded-xl">
              <div>
                <IconBox className="mb-4 bg-emerald-50 text-emerald-600">
                  <Star className="w-5 h-5" />
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Build your reputation</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Collect verified reviews from pet owners and showcase your credentials.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between rounded-xl">
              <div>
                <IconBox className="mb-4 bg-emerald-50 text-emerald-600">
                  <Bell className="w-5 h-5" />
                </IconBox>
                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Smart notifications</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.65]">
                  Receive instant alerts for new bookings, cancellations, and messages.
                </p>
              </div>
            </Card>

            <Card hover className="p-6 bg-white border border-neutral-200 flex flex-col justify-between rounded-xl">
              <div>
                <IconBox className="mb-4 bg-emerald-50 text-emerald-600">
                  <Wallet className="w-5 h-5" />
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

      {/* SECTION 6: FAQ */}
      <section id="faq" className="bg-white py-20 px-6 sm:px-12 lg:px-20 border-t border-neutral-100">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-display text-[32px] font-bold text-center text-neutral-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-[15px] text-neutral-500 text-center mb-12">
            Everything you need to know about joining Nepal's leading vet platform
          </p>

          <div className="space-y-4">
            <Card className="p-5 bg-white border border-neutral-200 rounded-xl">
              <h4 className="font-bold text-[16px] text-neutral-900 mb-2">How long does verification take?</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Our administrator reviews your NMC license registration, clinic details, and identification credentials. The verification process is usually completed within 24 hours.
              </p>
            </Card>

            <Card className="p-5 bg-white border border-neutral-200 rounded-xl">
              <h4 className="font-bold text-[16px] text-neutral-900 mb-2">Are there any registration or platform listing fees?</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Joining PetSneha is 100% free for veterinary practitioners. We charge no listing fees, and we do not deduct commissions from your appointment consultation fees.
              </p>
            </Card>

            <Card className="p-5 bg-white border border-neutral-200 rounded-xl">
              <h4 className="font-bold text-[16px] text-neutral-900 mb-2">Can I manage my own schedule?</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Yes! You have full control over your active days, open/close operational times, and calendar slot availability directly inside your vet dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA BANNER */}
      <section className="bg-white px-6 sm:px-12 lg:px-20 pb-16 pt-4">
        <div className="max-w-[1280px] mx-auto bg-gradient-to-r from-[#065F46] to-[#0046CE] rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="font-display text-[26px] sm:text-[28px] text-white font-bold leading-tight">
              Ready to grow your practice?
            </h3>
            <p className="text-[14px] text-white/80 font-medium">
              Join verified vets already using PetSneha in Kathmandu.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Button
              variant="white"
              className="!rounded-full !text-emerald-900 font-bold px-6 py-3.5 shadow-md border-none text-sm"
              onClick={() => navigate('/vet/register')}
            >
              Get started free →
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 8: FOOTER */}
      <footer className="bg-neutral-900 py-10 px-6 sm:px-12 lg:px-20 text-white border-t border-neutral-800">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left: Brand logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain brightness-0 invert" />
            <span className="text-label-lg font-display text-white text-lg font-bold">PetSneha</span>
          </div>

          {/* Centre: Copy */}
          <p className="text-[12px] text-neutral-500 font-medium text-center">
            © 2026 PetSneha · For Veterinary Professionals
          </p>

          {/* Right: Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-neutral-400">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition">Contact</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition">Terms</a>
            <span className="text-neutral-700">|</span>
            <Link to="/" className="text-emerald-400 font-semibold hover:text-emerald-300 transition">
              Looking for a vet? →
            </Link>
            <span className="text-neutral-700">|</span>
            <Link to="/admin/login" className="text-neutral-500 font-semibold hover:text-white transition">
              Admin Panel
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
