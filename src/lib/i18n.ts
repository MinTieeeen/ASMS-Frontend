/**
 * @file i18next setup (NFR14): Vietnamese by default.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/config/constants'
import enAdmin from '@/locales/en/admin.json'
import enAuth from '@/locales/en/auth.json'
import enCommon from '@/locales/en/common.json'
import viAdmin from '@/locales/vi/admin.json'
import viAuth from '@/locales/vi/auth.json'
import viCommon from '@/locales/vi/common.json'

/**
 * Each namespace is one JSON file in locales/{lang}/. To add a namespace, create it for both vi and en and
 * register it here.
 */
export const resources = {
  vi: { common: viCommon, auth: viAuth, admin: viAdmin },
  en: { common: enCommon, auth: enAuth, admin: enAdmin },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'auth', 'admin'],
    interpolation: { escapeValue: false },
    // Only remember the user's explicit choice; ignore the browser language so Vietnamese stays the default
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  })

// Screen readers and the browser read the page language from <html lang>
const syncHtmlLang = (language: string) => document.documentElement.setAttribute('lang', language)
syncHtmlLang(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE)
i18n.on('languageChanged', syncHtmlLang)

/**
 * Translates a dynamic key (e.g. a zod error message such as "auth:validation.x").
 * Use only when the key is unknown at compile time; otherwise use t() from useTranslation for type safety.
 */
export function translateKey(key: string): string {
  return i18n.exists(key) ? (i18n.t as (k: string) => string)(key) : key
}

export default i18n
