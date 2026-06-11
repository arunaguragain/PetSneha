import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PetSnehaLogo, Avatar } from './ui';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { updateLanguage } from '../api/user.api';

const navItemsByRole = {
  petOwner: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pets', href: '/dashboard' },
    { label: 'Vets', href: '/vets' },
    { label: 'Articles', href: '/articles' },
    { label: 'Forum', href: '/forum' },
    { label: 'Shop', href: '/shop' },
  ],
  vet: [
    { label: 'Dashboard', href: '/vet/dashboard' },
    { label: 'Appointments', href: '/vet/appointments' },
    { label: 'Articles', href: '/vet/articles' },
  ],
  admin: [{ label: 'Admin', href: '/admin/dashboard' }],
};

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, role, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [switchingLanguage, setSwitchingLanguage] = useState(false);

  const currentLanguage = i18n.language === 'ne' ? 'ne' : 'en';
  const navItems = navItemsByRole[role] || navItemsByRole.petOwner;

  const handleLanguageToggle = async () => {
    const nextLanguage = currentLanguage === 'en' ? 'ne' : 'en';

    try {
      setSwitchingLanguage(true);
      await updateLanguage(nextLanguage);
      localStorage.setItem('petsneha_lang', nextLanguage);
      await i18n.changeLanguage(nextLanguage);
      document.documentElement.lang = nextLanguage;
      addToast(nextLanguage === 'en' ? 'Language switched to English' : 'भाषा नेपालीमा परिवर्तन भयो', 'success');
      window.location.reload();
    } catch (error) {
      addToast(typeof error === 'string' ? error : 'Could not change language', 'danger');
    } finally {
      setSwitchingLanguage(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been signed out', 'success');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container-app flex h-full items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <PetSnehaLogo />
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="rounded-full px-4 py-2 text-label-lg text-white/80 transition hover:bg-white/20 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" loading={switchingLanguage} onClick={handleLanguageToggle} className="hidden sm:inline-flex text-white/80 hover:bg-white/20">
            {t('nav.language')}: {currentLanguage.toUpperCase()}
          </Button>
          {user ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <Avatar name={user.name || 'User'} size="sm" />
                <div className="leading-tight">
                  <p className="text-label-lg text-neutral-900">{user.name}</p>
                  <p className="text-caption text-neutral-500">{role}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout} className="text-white/80 hover:bg-white/20">
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
