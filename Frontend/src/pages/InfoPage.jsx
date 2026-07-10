import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { Heart, MapPin, Mail, Phone, Shield, FileText, HelpCircle } from 'lucide-react';

const sectionMap = {
  '/about-us': 'about',
  '/contact': 'contact',
  '/privacy-policy': 'privacy',
  '/terms-of-service': 'terms',
  '/help-center': 'help',
};

export default function InfoPage() {
  const { user } = useAuth();
  const location = useLocation();
  const Nav = user ? Navbar : LandingNavbar;
  const Foot = user ? Footer : LandingFooter;
  const sectionRefs = useRef({});

  useEffect(() => {
    const target = sectionMap[location.pathname];
    if (target && sectionRefs.current[target]) {
      setTimeout(() => {
        sectionRefs.current[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const setRef = (key) => (el) => { sectionRefs.current[key] = el; };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Nav />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full space-y-12">

        {/* ── About Us ── */}
        <section ref={setRef('about')} id="about" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0046CE] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>About Us</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-3 text-[#475569] leading-relaxed">
            <p>
              <strong className="text-[#1E293B]">PetSneha</strong> is Nepal's first integrated pet care platform, connecting pet parents with verified veterinarians, digital health records, a community forum, and a curated pet marketplace — all under one roof.
            </p>
            <p>
              Founded in Kathmandu, we believe every pet in Nepal deserves access to quality healthcare. Our platform helps pet owners find trusted vets, book appointments, track vaccinations, shop for pet essentials, and connect with fellow animal lovers.
            </p>
            <p>
              Every veterinarian on PetSneha is credential-verified. Every article is written by qualified professionals. We're building Nepal's most trusted pet care ecosystem — one paw at a time. 🐾
            </p>
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ── Contact ── */}
        <section ref={setRef('contact')} id="contact" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Contact Us</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <p className="text-[#475569] mb-5">Have questions, feedback, or need support? Reach out to us through any of the channels below.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: MapPin, label: 'Address', value: 'Bagbazar, Kathmandu, Nepal' },
                { icon: Mail, label: 'Email', value: 'support@petsneha.com' },
                { icon: Phone, label: 'Phone', value: '+977-01-XXXXXXX' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <item.icon className="w-5 h-5 text-[#0046CE] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#94A3B8] uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-[#1E293B]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#94A3B8] mt-4">Business hours: Sunday – Friday, 10:00 AM – 5:00 PM NPT</p>
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ── Privacy Policy ── */}
        <section ref={setRef('privacy')} id="privacy" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Privacy Policy</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 text-[#475569] leading-relaxed text-sm">
            <p className="text-base">We respect your privacy. Here's how we handle your data:</p>
            <ul className="space-y-2 list-none">
              {[
                'We collect your name, email, and pet info to provide our services.',
                'Vet credentials are collected and verified to maintain trust.',
                'Your health records are stored securely and only visible to you.',
                'We do not sell your personal data to any third parties.',
                'Passwords are encrypted and never stored in plain text.',
                'You can view, edit, or delete your data anytime from profile settings.',
                'We use essential cookies only — no advertising trackers.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-[#0046CE] mt-0.5">•</span><span>{item}</span></li>
              ))}
            </ul>
            <p className="text-xs text-[#94A3B8]">Last updated: July 2026 · Questions? Email support@petsneha.com</p>
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ── Terms of Service ── */}
        <section ref={setRef('terms')} id="terms" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Terms of Service</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 text-[#475569] leading-relaxed text-sm">
            <p className="text-base">By using PetSneha, you agree to the following terms:</p>
            <ul className="space-y-2 list-none">
              {[
                'You must provide accurate information when creating an account.',
                'You must be at least 16 years old to use PetSneha.',
                'Pet owners must keep appointment commitments or cancel in advance.',
                'Vets must provide valid credentials and maintain professional conduct.',
                'Forum posts must be respectful — harassment and misinformation are prohibited.',
                'Marketplace sellers must list products accurately with correct pricing.',
                'PetSneha facilitates connections but does not provide direct medical care.',
                'We may suspend accounts that violate these terms.',
                'You can delete your account anytime from your profile settings.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-[#0046CE] mt-0.5">•</span><span>{item}</span></li>
              ))}
            </ul>
            <p className="text-xs text-[#94A3B8]">Last updated: July 2026</p>
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ── Help Center ── */}
        <section ref={setRef('help')} id="help" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Help Center</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 text-sm">
            <p className="text-base text-[#475569]">Quick answers to common questions:</p>
            {[
              { q: 'How do I add a pet?', a: 'Go to Dashboard → click "+ Add Pet" → fill details → Save.' },
              { q: 'How do I book a vet appointment?', a: 'Browse Vet Directory → select a vet → click "Book Appointment" → choose date & time.' },
              { q: 'How do I reset my password?', a: 'On the login page, click "Forgot Password?" and enter your email.' },
              { q: 'How do I report a forum post?', a: 'Click the flag icon on any post. Our moderation team will review it.' },
              { q: 'How do I cancel an appointment?', a: 'Go to your appointment details and click "Cancel". Please cancel at least 24h in advance.' },
              { q: 'How do I delete my account?', a: 'Go to Profile Settings → scroll down → click "Delete Account".' },
            ].map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="font-semibold text-[#1E293B] mb-1">{faq.q}</p>
                <p className="text-[#64748B]">{faq.a}</p>
              </div>
            ))}
            <p className="text-[#94A3B8] text-xs mt-2">Still need help? Email us at support@petsneha.com</p>
          </div>
        </section>

      </main>

      <Foot />
    </div>
  );
}
