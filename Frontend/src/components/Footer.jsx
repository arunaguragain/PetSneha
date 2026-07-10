import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0] mt-auto flex-shrink-0">
      <div className="max-w-[1440px] mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left — Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PetSneha Logo" className="h-6 w-auto object-contain" />
            <span className="font-bold text-[#0046CE] text-base" style={{ fontFamily: 'Literata, serif' }}>
              PetSneha
            </span>
          </Link>
        </div>

        {/* Center — Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#475569] font-medium">
          <Link to="/about-us" className="hover:text-[#0046CE] transition-colors">{t('footer.aboutUs', 'About Us')}</Link>
          <Link to="/contact" className="hover:text-[#0046CE] transition-colors">{t('footer.contact', 'Contact')}</Link>
          <Link to="/privacy-policy" className="hover:text-[#0046CE] transition-colors">{t('footer.privacyPolicy', 'Privacy Policy')}</Link>
          <Link to="/terms-of-service" className="hover:text-[#0046CE] transition-colors">{t('footer.termsOfService', 'Terms of Service')}</Link>
          <Link to="/help-center" className="hover:text-[#0046CE] transition-colors">{t('footer.helpCenter', 'Help Center')}</Link>
        </div>

        {/* Right — Copyright */}
        <div className="text-xs text-[#64748B] whitespace-nowrap">
          {t('footer.copyright', '© 2024 PetSneha Nepal. All rights reserved.')}
        </div>
      </div>
    </footer>
  );
}
