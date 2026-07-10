import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import VetLandingNavbar from '../components/landing/VetLandingNavbar';
import VetLandingFooter from '../components/landing/VetLandingFooter';
import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function HelpCenterPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isVet = location.pathname.startsWith('/vet') || location.state?.fromVet === true;

  const Nav = user ? Navbar : (isVet ? VetLandingNavbar : LandingNavbar);
  const Foot = user ? Footer : (isVet ? VetLandingFooter : LandingFooter);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Nav />
      <main className="flex-1 max-w-[1440px] mx-auto px-8 py-10 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Help Center</h1>
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
      </main>
      <Foot />
    </div>
  );
}
