/**
 * @file ASMS logo: the mark (a to-do list with the first item highlighted) plus the product name.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-27
 * @modified 2026-09-27
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

/**
 * Variants of the ASMS Design System (component Logo):
 * - `full`: full name, Auth screens on desktop/tablet
 * - `stacked`: ASMS with the full name small below, Auth screens on phones
 * - `auto`: `full`, switching to `stacked` below 480 px
 * - `short`: ASMS only
 * - `expand`: ASMS, revealing the full name on hover or keyboard focus (app header)
 * - `mark`: the mark alone
 */
export type LogoVariant = 'full' | 'stacked' | 'auto' | 'short' | 'expand' | 'mark'

interface LogoProps {
  variant?: LogoVariant
  /** Side of the mark in px; the words scale with it (ASMS = 62 %, full name = 56 %) */
  size?: number
  /** Turns the logo into a link, e.g. to the home page */
  href?: string
  className?: string
}

export function Logo({ variant = 'short', size = 32, href, className }: LogoProps) {
  const { t } = useTranslation()
  const shortName = t('app.name')
  const fullName = t('app.fullName')
  const label = t('app.logoLabel')
  const isExpand = variant === 'expand'

  const content = (
    <>
      <LogoMark size={size} />
      <LogoWords variant={variant} size={size} shortName={shortName} fullName={fullName} />
    </>
  )
  const classes = cn(
    'group/logo inline-flex items-center gap-2.5 rounded-md text-foreground no-underline outline-none focus-visible:shadow-focus',
    className,
  )

  if (href) {
    return (
      <Link
        to={href}
        aria-label={label}
        title={isExpand ? fullName : undefined}
        className={classes}
      >
        {content}
      </Link>
    )
  }
  return (
    <span
      role="img"
      aria-label={label}
      title={isExpand ? fullName : undefined}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users can reveal the full name (design system rule)
      tabIndex={isExpand ? 0 : undefined}
      className={classes}
    >
      {content}
    </span>
  )
}

interface LogoWordsProps {
  variant: LogoVariant
  size: number
  shortName: string
  fullName: string
}

function LogoWords({ variant, size, shortName, fullName }: LogoWordsProps) {
  const wordSize = { fontSize: Math.round(size * 0.62) }
  const nameSize = { fontSize: Math.round(size * 0.56) }
  const word = (
    <span
      aria-hidden
      className="font-heading leading-none font-bold tracking-[0.02em]"
      style={wordSize}
    >
      {shortName}
    </span>
  )
  const name = (
    <span
      aria-hidden
      className="font-heading leading-tight font-semibold tracking-[-0.01em] whitespace-nowrap"
      style={nameSize}
    >
      {fullName}
    </span>
  )
  const stacked = (
    <span aria-hidden className="inline-flex flex-col gap-1">
      {word}
      <span className="text-[11px] leading-tight font-medium tracking-[0.01em] whitespace-nowrap text-muted-foreground">
        {fullName}
      </span>
    </span>
  )

  switch (variant) {
    case 'mark':
      return null
    case 'full':
      return name
    case 'stacked':
      return stacked
    case 'auto':
      return (
        <>
          <span className="hidden min-[480px]:inline-flex">{name}</span>
          <span className="inline-flex min-[480px]:hidden">{stacked}</span>
        </>
      )
    case 'expand':
      return (
        <span aria-hidden className="inline-flex items-center whitespace-nowrap">
          <span
            className="inline-block max-w-[120px] overflow-hidden font-heading leading-none font-bold tracking-[0.02em] opacity-100 transition-all duration-300 group-hover/logo:max-w-0 group-hover/logo:opacity-0 group-focus-visible/logo:max-w-0 group-focus-visible/logo:opacity-0"
            style={wordSize}
          >
            {shortName}
          </span>
          <span
            className="inline-block max-w-0 overflow-hidden font-heading leading-tight font-semibold tracking-[-0.01em] opacity-0 transition-all duration-300 group-hover/logo:max-w-[320px] group-hover/logo:opacity-100 group-focus-visible/logo:max-w-[320px] group-focus-visible/logo:opacity-100"
            style={nameSize}
          >
            {fullName}
          </span>
        </span>
      )
    default:
      return word
  }
}

/** The mark keeps its brand colors in both themes (design system, "Logo"). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className={cn('block shrink-0', className)}
    >
      <rect width="64" height="64" rx="16" className="fill-brand" />
      <rect x="14" y="16" width="8" height="8" rx="2" className="fill-highlight" />
      <path
        d="M15.9 20.2l1.6 1.6 3-3.3"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-brand"
      />
      <rect
        x="28"
        y="18"
        width="23"
        height="4"
        rx="2"
        className="fill-brand-foreground opacity-55"
      />
      <rect
        x="15"
        y="29"
        width="6"
        height="6"
        rx="1.5"
        fill="none"
        strokeWidth="2"
        className="stroke-brand-foreground"
      />
      <rect x="28" y="30" width="18" height="4" rx="2" className="fill-brand-foreground" />
      <rect
        x="15"
        y="41"
        width="6"
        height="6"
        rx="1.5"
        fill="none"
        strokeWidth="2"
        className="stroke-brand-foreground"
      />
      <rect x="28" y="42" width="12" height="4" rx="2" className="fill-brand-foreground" />
    </svg>
  )
}
