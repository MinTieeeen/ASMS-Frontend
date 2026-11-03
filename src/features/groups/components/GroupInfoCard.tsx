/**
 * @file Group information on the overview (UC02, UC03): subject, semester, supervising lecturer, topic, description,
 *   member count and creation date, moved here from the workspace header to keep that header small.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { BookOpen, CalendarDays, GraduationCap, Lightbulb, type LucideIcon, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Group } from '@/mocks'
import { formatDate } from '@/utils/date'

export function GroupInfoCard({ group, memberCount }: { group: Group; memberCount: number }) {
  const { t } = useTranslation('groups')
  const subject = [group.subjectCode, group.subjectName].filter(Boolean).join(' · ')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview.info.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoItem icon={BookOpen} label={t('overview.info.subject')} value={subject} />
          <InfoItem icon={CalendarDays} label={t('overview.info.semester')} value={group.semester} />
          <InfoItem icon={GraduationCap} label={t('overview.info.lecturer')} value={group.lecturerName} />
          <InfoItem
            icon={UsersRound}
            label={t('overview.info.members')}
            value={t('overview.info.membersValue', { count: memberCount, max: group.maxMembers })}
          />
          <InfoItem icon={Lightbulb} label={t('overview.info.topic')} value={group.topic} className="sm:col-span-2 xl:col-span-3" />
          <InfoItem icon={CalendarDays} label={t('overview.info.createdAt')} value={formatDate(group.createdAt)} />
        </dl>
        {group.description && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">{t('overview.info.description')}</p>
            <p className="mt-1 text-sm whitespace-pre-line">{group.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface InfoItemProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  className?: string
}

function InfoItem({ icon: Icon, label, value, className }: InfoItemProps) {
  const { t } = useTranslation('groups')
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value || <span className="text-muted-foreground">{t('overview.info.notSet')}</span>}</dd>
    </div>
  )
}
