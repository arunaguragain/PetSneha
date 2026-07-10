import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui';

export default function VetLandingNavbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar bg-white sticky top-0 z-40 border-b border-neutral-100">
      <div className="max-w-[1440px] mx-auto w-full h-full flex items-center px-6 sm:px-12 lg:px-20 justify-between py-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/vets-landing" className="cursor-pointer hover:opacity-80 flex items-center gap-3">
            <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
            <span className="text-label-lg font-display text-primary-600 text-lg font-bold">PetSneha</span>
          </Link>
        </div>

        {/* Centre: Nav links */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Primary navigation">
          <Link to="/vets-landing" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">
            Home
          </Link>
          <Link to="/vets-landing#how-it-works" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">
            How it works
          </Link>
          <Link to="/vets-landing#benefits" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">
            Benefits
          </Link>
          <Link to="/vets-landing#faq" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">
            FAQ
          </Link>
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
  );
}
