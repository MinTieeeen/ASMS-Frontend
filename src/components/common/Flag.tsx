/**
 * @file Round country flags of the supported languages, drawn as SVG because Windows does not render flag emojis.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-10-01
 * @modified 2026-10-01
 */

import { useId } from 'react'

import type { SupportedLanguage } from '@/config/constants'
import { cn } from '@/lib/utils'

interface FlagProps {
  language: SupportedLanguage
  className?: string
}

/** Decorative: the language name or code is always written next to it or in a label. */
export function Flag({ language, className }: FlagProps) {
  // One clip path per instance: the same flag can be on screen twice (trigger and menu)
  const clipId = useId()

  return (
    <svg viewBox="0 0 20 20" className={cn('size-5 shrink-0', className)} aria-hidden>
      <clipPath id={clipId}>
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {language === 'vi' ? <VietnamFlag /> : <UnitedKingdomFlag />}
      </g>
      {/* Inner hairline keeps light flags visible on light backgrounds */}
      <circle cx="10" cy="10" r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.12" />
    </svg>
  )
}

function VietnamFlag() {
  return (
    <>
      <rect width="20" height="20" fill="#da251d" />
      <polygon
        fill="#ffde00"
        points="10,5.2 11.18,8.78 14.95,8.79 11.9,11.02 13.06,14.61 10,12.4 6.94,14.61 8.1,11.02 5.05,8.79 8.82,8.78"
      />
    </>
  )
}

/** The 30x20 Union Jack centered in the circle */
function UnitedKingdomFlag() {
  return (
    <g transform="translate(-5 0)">
      <rect width="30" height="20" fill="#012169" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#ffffff" strokeWidth="4" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#c8102e" strokeWidth="1.5" />
      <path d="M15,0 V20 M0,10 H30" stroke="#ffffff" strokeWidth="6" />
      <path d="M15,0 V20 M0,10 H30" stroke="#c8102e" strokeWidth="3.4" />
    </g>
  )
}
