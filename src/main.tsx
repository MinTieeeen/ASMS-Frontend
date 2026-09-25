/**
 * @file Application bootstrap.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import '@/styles/globals.css'
import '@/lib/i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
