import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from './ui';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { updateLanguage } from '../api/user.api';
import { getPets } from '../api/pet.api';
import { User, PawPrint, PlusCircle, Globe, LogOut, CheckCircle2, Calendar, LayoutDashboard, BookOpen, ShoppingBag } from 'lucide-react';
import { getPetEmoji } from '../utils/api';

const navItemsByRole = {
  petOwner: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Vets', href: '/vets' },
    { label: 'Records', href: '/records' },
    { label: 'Shop', href: '/shop' },
    { label: 'Articles', href: '/articles' },
  ],
  vet: [
    { label: 'Dashboard', href: '/vet/dashboard' },
    { label: 'Appointments', href: '/vet/appointments' },
    { label: 'Articles', href: '/vet/articles' },
    { label: 'Products', href: '/vet/products' },
  ],
  admin: [{ label: 'Admin', href: '/admin/dashboard' }],
};

const getPhotoUrl = (photoSrc) => {
  if (!photoSrc) return '';
  if (photoSrc.startsWith('http')) return photoSrc;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '');
  // Add cache busting parameter to force fresh image
  const timestamp = Math.floor(Date.now() / 60000); // Changes every minute
  return `${baseUrl}${photoSrc}?t=${timestamp}`;
};

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, role, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [switchingLanguage, setSwitchingLanguage] = useState(false);
  
  const handleLogoClick = () => {
    if (user?.role === 'vet') {
      navigate('/vet/dashboard')
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
  };
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pets, setPets] = useState([]);
  const dropdownRef = useRef(null);

  const currentLanguage = i18n.language === 'ne' ? 'ne' : 'en';
  const navItems = navItemsByRole[role] || navItemsByRole.petOwner;

  useEffect(() => {
    if (user && role === 'petOwner') {
      getPets().then(res => {
        const petsList = res.data?.pets || res.data?.items || (Array.isArray(res.data) ? res.data : res || []);
        setPets(petsList);
      }).catch(err => console.error("Failed to fetch pets for navbar", err));
    }
  }, [user, role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const loginPath = logout();
    addToast('You have been signed out', 'success');
    navigate(loginPath);
  };

  const getSpeciesBadgeClass = (species) => {
    const sp = String(species || '').toLowerCase();
    if (sp === 'dog') return 'bg-[#EFF6FF] text-[#0046CE] border-[#BFDBFE]';
    if (sp === 'cat') return 'bg-[#EFF6FF] text-[#0046CE] border-[#BFDBFE]'; // From screenshot, cat also uses light blue pill
    return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
  };

  return (
    <header className="navbar bg-white border-b border-[#E2E8F0] relative z-50">
      <div className="max-w-[1440px] mx-auto px-8 flex h-full items-center justify-between gap-4">
        {/* Left — Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer shrink-0 hover:opacity-80">
          <img src="/logo.png" alt="PetSneha Logo" className="h-8 w-auto object-contain" />
          <span className="text-[22px] font-bold text-[#0046CE]" style={{ fontFamily: 'Literata, serif' }}>PetSneha</span>
        </button>

        {/* Center — Links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              end
              className={({ isActive }) =>
                `text-sm font-semibold transition-all h-[64px] flex items-center border-b-[3px] ${
                  isActive
                    ? 'text-[#0046CE] border-[#0046CE]'
                    : 'text-[#64748B] border-transparent hover:text-[#0046CE]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right — Language & Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-[#0046CE] rounded-full p-1 cursor-pointer" onClick={handleLanguageToggle}>
            <div className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${currentLanguage === 'ne' ? 'bg-white text-[#0046CE]' : 'text-white/80'}`}>नेप</div>
            <div className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${currentLanguage === 'en' ? 'bg-white text-[#0046CE]' : 'text-white/80'}`}>EN</div>
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F1F5F9] border-2 border-transparent hover:border-[#BFDBFE] transition overflow-hidden"
              >
                {user.photo ? (
                  <img src={getPhotoUrl(user.photo)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-[#475569]">{user.name?.charAt(0)}</span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#E2E8F0] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-[#FAFAFB] px-6 py-5 flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#E2E8F0]">
                        {user.photo ? (
                          <img src={getPhotoUrl(user.photo)} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[#64748B] text-xl">
                            {user.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-[2px]">
                        <CheckCircle2 className="w-5 h-5 text-[#0046CE] fill-[#0046CE] text-white" />
                      </div>
                    </div>
                    <p className="mt-3 font-semibold text-[#1E293B]">{user.name}</p>
                    <p className="text-xs text-[#64748B]">{user.email}</p>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-2">
                    {role === 'vet' ? (
                      <>
                        <button onClick={() => { setIsDropdownOpen(false); navigate('/vet/dashboard'); }} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition">
                          <LayoutDashboard size={18} className="text-[#0046CE]" />
                          My dashboard
                        </button>
                        <button onClick={() => { setIsDropdownOpen(false); navigate('/vet/appointments'); }} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition">
                          <Calendar size={18} className="text-[#0046CE]" />
                          My schedule
                        </button>
                        <button onClick={() => { setIsDropdownOpen(false); navigate('/vet/articles'); }} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition">
                          <BookOpen size={18} className="text-[#0046CE]" />
                          My articles
                        </button>
                        <button onClick={() => { setIsDropdownOpen(false); navigate('/vet/products'); }} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition">
                          <ShoppingBag size={18} className="text-[#0046CE]" />
                          My products
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition">
                          <User size={18} className="text-[#0046CE]" />
                          My profile
                        </button>
                        
                        <div className="w-full px-6 py-2">
                          <div className="flex items-center gap-3 text-sm font-semibold text-[#475569] mb-2">
                            <PawPrint size={18} className="text-[#0046CE]" />
                            My pets
                          </div>
                          <div className="pl-7 space-y-2">
                            {pets.map((pet) => (
                              <div 
                                key={pet._id || pet.id} 
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  navigate(`/pets/${pet._id || pet.id}`);
                                }}
                                className="flex items-center justify-between py-1.5 border border-[#E2E8F0] rounded-xl px-3 cursor-pointer hover:bg-[#F8FAFC]"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#F1F5F9] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {pet.photo ? (
                                      <img src={getPhotoUrl(pet.photo)} alt={pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <PawPrint size={14} className="text-[#0046CE]" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-[#1E293B]">{pet.name}</span>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${getSpeciesBadgeClass(pet.species)}`}>
                                  {pet.species || 'PET'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button onClick={() => navigate('/pets/new')} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition">
                          <PlusCircle size={18} className="text-[#0046CE]" />
                          Add pet
                        </button>
                      </>
                    )}

                    <div className="my-2 border-t border-[#E2E8F0]"></div>

                    <div className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition cursor-pointer" onClick={handleLanguageToggle}>
                      <div className="flex items-center gap-3">
                        <Globe size={18} className="text-[#64748B]" />
                        Language toggle
                      </div>
                      <div className="flex items-center bg-[#0046CE] rounded-full p-1">
                        <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${currentLanguage === 'ne' ? 'bg-white text-[#0046CE]' : 'text-white/80'}`}>नेप</div>
                        <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${currentLanguage === 'en' ? 'bg-white text-[#0046CE]' : 'text-white/80'}`}>EN</div>
                      </div>
                    </div>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[#DC2626] hover:bg-red-50 transition">
                      <LogOut size={18} />
                      Log out
                    </button>
                  </div>

                  <div className="bg-[#FAFAFB] py-4 text-center text-xs font-medium text-[#94A3B8] border-t border-[#E2E8F0]">
                    PetSneha Nepal
                  </div>
                </div>
              )}
            </div>
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
