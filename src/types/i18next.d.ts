/**
 * @file Type-safe translation keys for i18next.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import 'i18next'

import type { resources } from '@/lib/i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: (typeof resources)['vi']
  }
}
