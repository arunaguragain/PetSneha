import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import VetLandingNavbar from '../components/landing/VetLandingNavbar';
import VetLandingFooter from '../components/landing/VetLandingFooter';
import { useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Terms of Service</h1>
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
          <p className="text-xs text-[#94A3B8] mt-4">Last updated: July 2026</p>
        </div>
      </main>
      <Foot />
    </div>
  );
}
