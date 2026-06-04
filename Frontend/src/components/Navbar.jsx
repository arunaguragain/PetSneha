import React from 'react';
import { Button, PetSnehaLogo } from './ui';

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pets', href: '#pets' },
  { label: 'Appointments', href: '#appointments' },
  { label: 'Store', href: '#store' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container-app flex h-full items-center justify-between gap-4">
        <a href="#top" className="shrink-0">
          <PetSnehaLogo />
        </a>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="rounded-full px-4 py-2 text-label-lg text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button size="sm">Book care</Button>
        </div>
      </div>
    </header>
  );
}
