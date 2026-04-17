import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/common.json'
import fa from './locales/fa/common.json'
import zh from './locales/zh/common.json'
import ar from './locales/ar/common.json'
import { languages } from './languages'

const resources = {
  en: { translation: en },
  fa: { translation: fa },
  zh: { translation: zh },
  ar: { translation: ar },
}

i18n
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fa',

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

const setDirection = (lng: string) => {
  const dir = languages[lng as keyof typeof languages]?.dir || 'ltr'

  document.documentElement.dir = dir
  document.documentElement.lang = lng
}

setDirection(i18n.language)

i18n.on('languageChanged', (lng) => {
  setDirection(lng)
})

export default i18n
