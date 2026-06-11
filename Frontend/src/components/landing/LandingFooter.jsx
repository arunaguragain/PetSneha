import React from 'react';

const footerLinks = ['Privacy Policy', 'Terms of Service', 'Contact Us', 'About Us'];

export default function LandingFooter({ logoSrc }) {
  return (
    <footer className="mt-10 bg-neutral-900 text-white">
      <div className="container-app py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PetSneha logo" className="h-8 w-8 object-contain" />
            <span className="text-label-lg font-display text-white">PetSneha</span>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-white/70">
            {footerLinks.map((link) => (
              <a key={link} href="#top" className="transition hover:text-white">
                {link}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © 2024 PetSneha. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
