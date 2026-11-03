/**
 * @file Top of the personal dashboard: a greeting by time of day, today's date, a one-line summary of today and
 *   shortcuts to "My tasks" and "My groups".
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { enUS, vi } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { ListChecks, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { ROUTES } from '@/config/routes'
import { selectUser, useAuthStore } from '@/stores/auth.store'

const AFTERNOON_HOUR = 12
const EVENING_HOUR = 18

interface DashboardHeroProps {
  now: Date
  dueToday: number
  overdue: number
}

export function DashboardHero({ now, dueToday, overdue }: DashboardHeroProps) {
  const { t, i18n } = useTranslation('dashboard')
  const user = useAuthStore(selectUser)
  // Vietnamese names end with the given name, the one used to greet someone
  const name = user?.fullName.trim().split(/\s+/).at(-1) ?? ''
  const hour = Number(formatInTimeZone(now, env.defaultTimezone, 'H'))
  const greeting = hour < AFTERNOON_HOUR ? 'morning' : hour < EVENING_HOUR ? 'afternoon' : 'evening'
  const today = formatInTimeZone(now, env.defaultTimezone, 'EEEE, dd/MM/yyyy', {
    locale: i18n.language === 'en' ? enUS : vi,
  })

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-accent via-card to-card p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground first-letter:uppercase">{today}</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{t(`greeting.${greeting}`, { name })}</h1>
          <p className="text-sm text-muted-foreground">
            {dueToday + overdue > 0 ? t('summary.busy', { dueToday, overdue }) : t('summary.clear')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={ROUTES.tasks}>
              <ListChecks aria-hidden />
              {t('actions.myTasks')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-card">
            <Link to={ROUTES.groups}>
              <UsersRound aria-hidden />
              {t('actions.groups')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
