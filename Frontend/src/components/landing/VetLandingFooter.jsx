import React from 'react';
import { Link } from 'react-router-dom';

export default function VetLandingFooter() {
  return (
    <footer className="bg-neutral-900 py-10 px-6 sm:px-12 lg:px-20 text-white border-t border-neutral-800 mt-auto">
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
          <Link to="/vet/privacy-policy" state={{ fromVet: true }} className="hover:text-white transition">Privacy Policy</Link>
          <span>·</span>
          <Link to="/vet/contact" state={{ fromVet: true }} className="hover:text-white transition">Contact</Link>
          <span>·</span>
          <Link to="/vet/terms-of-service" state={{ fromVet: true }} className="hover:text-white transition">Terms</Link>
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
  );
}
