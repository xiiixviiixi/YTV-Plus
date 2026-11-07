import i18n from 'i18next';
import resources from './i18nResources.js';

import { configRead } from '../config.js';
InitI18next(configRead('forcedLanguage') || 'en'); // mod UI follows the chosen app language

function InitI18next(lng) {
  i18n
    .init({
      lng,
      fallbackLng: 'en',
      resources,
      debug: false,
      interpolation: {
        escapeValue: false,
      }
    });
}
export default i18n;