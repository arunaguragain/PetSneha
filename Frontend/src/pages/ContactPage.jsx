import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import VetLandingNavbar from '../components/landing/VetLandingNavbar';
import VetLandingFooter from '../components/landing/VetLandingFooter';
import { useLocation } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
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
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Contact Us</h1>
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
      </main>
      <Foot />
    </div>
  );
}
