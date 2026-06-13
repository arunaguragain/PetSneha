import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0] mt-auto">
      <div className="max-w-[1440px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left — Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PetSneha Logo" className="h-7 w-auto object-contain" />
            <span className="font-bold text-[#0046CE] text-lg" style={{ fontFamily: 'Literata, serif' }}>
              PetSneha
            </span>
          </Link>
        </div>

        {/* Center — Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#475569] font-medium">
          <Link to="/about-us" className="hover:text-[#0046CE] transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-[#0046CE] transition-colors">Contact</Link>
          <Link to="/privacy-policy" className="hover:text-[#0046CE] transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-[#0046CE] transition-colors">Terms of Service</Link>
          <Link to="/help-center" className="hover:text-[#0046CE] transition-colors">Help Center</Link>
        </div>

        {/* Right — Copyright */}
        <div className="text-sm text-[#64748B] whitespace-nowrap">
          © 2024 PetSneha Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
