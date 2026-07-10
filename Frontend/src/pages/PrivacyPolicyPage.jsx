import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import VetLandingNavbar from '../components/landing/VetLandingNavbar';
import VetLandingFooter from '../components/landing/VetLandingFooter';
import { useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isVet = location.pathname.startsWith('/vet') || location.state?.fromVet === true;

  const Nav = isVet ? VetLandingNavbar : (user ? Navbar : LandingNavbar);
  const Foot = isVet ? VetLandingFooter : (user ? Footer : LandingFooter);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Nav />
      <main className="flex-1 max-w-[1440px] mx-auto px-8 py-10 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Privacy Policy</h1>
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
          <p className="text-xs text-[#94A3B8] mt-4">Last updated: July 2026 · Questions? Email support@petsneha.com</p>
        </div>
      </main>
      <Foot />
    </div>
  );
}
