import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import es from './locales/es';

// Importing this file is what triggers i18n initialization (side-effect import).
// Add `import '@/lib/i18n';` to your root _layout.tsx before any component renders.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    // React already escapes values — no need for i18next to do it too.
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
