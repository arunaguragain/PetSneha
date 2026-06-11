import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  return (
    <header className="navbar">
      <div className="w-full h-full flex items-center px-4 lg:px-10">
        {/* Logo — left */}
        <a href="#top" className="flex flex-1 items-center gap-3">
          <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
          <span className="text-label-lg font-display text-primary-600">PetSneha</span>
        </a>

        {/* Nav links — absolutely centered */}
        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary navigation">
          <a href="#top" className="text-sm text-neutral-600 transition hover:text-primary-600">Home</a>
          <a href="#features" className="text-sm text-neutral-600 transition hover:text-primary-600">Features</a>
          <a href="#about" className="text-sm text-neutral-600 transition hover:text-primary-600">About</a>
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
