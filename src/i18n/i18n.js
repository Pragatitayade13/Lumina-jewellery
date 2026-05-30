import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import namespaced files
import enCommon from '../locales/en/common.json';
import enClient from '../locales/en/client.json';
import enAdmin from '../locales/en/admin.json';

import hiCommon from '../locales/hi/common.json';
import hiClient from '../locales/hi/client.json';
import hiAdmin from '../locales/hi/admin.json';

import mrCommon from '../locales/mr/common.json';
import mrClient from '../locales/mr/client.json';
import mrAdmin from '../locales/mr/admin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        client: enClient,
        admin: enAdmin,
      },
      hi: {
        common: hiCommon,
        client: hiClient,
        admin: hiAdmin,
      },
      mr: {
        common: mrCommon,
        client: mrClient,
        admin: mrAdmin,
      },
    },
    defaultNS: 'common',
    ns: ['common', 'client', 'admin'],
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'app_ui_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
  });

export default i18n;
