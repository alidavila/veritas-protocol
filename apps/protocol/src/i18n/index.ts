import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import en from './locales/en.json'

i18n
    .use(LanguageDetector)         // Auto-detects browser language
    .use(initReactI18next)          // Connects to React
    .init({
        resources: {
            es: { translation: es },
            en: { translation: en }
        },
        fallbackLng: 'es',             // Default: Spanish
        interpolation: {
            escapeValue: false          // React already handles XSS
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']     // Remember user's choice
        }
    })

export default i18n
