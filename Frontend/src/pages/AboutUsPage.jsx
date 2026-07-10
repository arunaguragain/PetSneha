import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import VetLandingNavbar from '../components/landing/VetLandingNavbar';
import VetLandingFooter from '../components/landing/VetLandingFooter';
import { useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function AboutUsPage() {
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
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0046CE] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>About Us</h1>
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
      </main>
      <Foot />
    </div>
  );
}
