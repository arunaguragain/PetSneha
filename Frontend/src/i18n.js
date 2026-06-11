import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        pets: 'Pets',
        vets: 'Vets',
        shop: 'Shop',
        articles: 'Articles',
        forum: 'Forum',
        admin: 'Admin',
        language: 'Language',
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        loading: 'Loading...',
        view: 'View',
        book: 'Book',
      },
    },
  },
  ne: {
    translation: {
      nav: {
        dashboard: 'ड्यासबोर्ड',
        pets: 'पाल्तुहरू',
        vets: 'भेट्स',
        shop: 'शप',
        articles: 'लेखहरू',
        forum: 'फोरम',
        admin: 'एडमिन',
        language: 'भाषा',
      },
      common: {
        save: 'सेभ',
        cancel: 'रद्द',
        loading: 'लोड हुँदै...',
        view: 'हेर्नुहोस्',
        book: 'बुक',
      },
    },
  },
};

const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem('petsneha_lang') || 'en' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: storedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = storedLanguage;
}

export default i18n;