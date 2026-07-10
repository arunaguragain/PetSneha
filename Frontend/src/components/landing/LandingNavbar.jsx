import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  return (
    <header className="navbar bg-white sticky top-0 z-40 border-b border-neutral-100">
      <div className="max-w-[1440px] mx-auto w-full h-full flex items-center px-6 sm:px-12 lg:px-20 justify-between py-4">
        {/* Logo — left */}
        <div className="flex flex-1 items-center">
          <Link to="/" className="cursor-pointer hover:opacity-80 flex items-center gap-3">
            <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
            <span className="text-label-lg font-display text-primary-600 text-lg font-bold">PetSneha</span>
          </Link>
        </div>

        {/* Nav links — absolutely centered */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Primary navigation">
          <Link to="/" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">Home</Link>
          <a href="/#features" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">Features</a>
          <Link to="/about-us" className="text-sm font-semibold text-neutral-600 transition hover:text-primary-600">About</Link>
        </nav>

        {/* Buttons — right */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <Link to="/login" className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50">
            Log in
          </Link>
          <Link to="/register" className="rounded-full border border-red-400 px-5 py-2 text-sm font-medium text-red-600 transition hover:border-red-500 hover:bg-red-50">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
