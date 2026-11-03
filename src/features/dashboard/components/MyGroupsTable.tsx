/**
 * @file Compact table of the student's groups (UC11): the group with its subject and current phase, group progress,
 *   the student's open tasks and the next milestone; each group links to its workspace.
 * @author MinhTien
 * @version 1.2.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DueDate, EmptyState, ProgressMeter } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ROUTES } from '@/config/routes'

import type { GroupRow } from '../utils/dashboard-data'

export function MyGroupsTable({ rows }: { rows: GroupRow[] }) {
  const { t } = useTranslation('dashboard')

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('groups.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={t('groups.empty')}
            action={
              <Button asChild variant="outline">
                <Link to={ROUTES.groups}>{t('groups.emptyAction')}</Link>
              </Button>
            }
          />
        ) : (
          // Fixed columns truncate long names instead of wrapping; below 32rem the table scrolls sideways
          <Table aria-label={t('groups.title')} className="min-w-[32rem] table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[34%]">{t('groups.group')}</TableHead>
                <TableHead className="w-[22%]">{t('groups.progress')}</TableHead>
                <TableHead className="w-[16%] text-right">{t('groups.myOpen')}</TableHead>
                <TableHead className="w-[28%]">{t('groups.nextMilestone')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const meta = [row.group.subjectCode, row.activePhase?.name].filter(Boolean).join(' · ')
                return (
                  <TableRow key={row.group.id}>
                    <TableCell>
                      <Link
                        to={ROUTES.groupDetail(row.group.id)}
                        title={row.group.name}
                        className="block truncate rounded-sm font-medium outline-none hover:underline focus-visible:shadow-focus"
                      >
                        {row.group.name}
                      </Link>
                      {meta && <span className="block truncate text-xs text-muted-foreground">{meta}</span>}
                    </TableCell>
                    <TableCell>
                      <ProgressMeter ratio={row.progress} size="sm" />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.myOpen}</TableCell>
                    <TableCell className="text-[13px]">
                      {row.nextMilestone ? (
                        <>
                          <Link
                            to={ROUTES.groupMilestoneDetail(row.group.id, row.nextMilestone.id)}
                            title={row.nextMilestone.name}
                            className="block truncate rounded-sm outline-none hover:underline focus-visible:shadow-focus"
                          >
                            {row.nextMilestone.name}
                          </Link>
                          <DueDate dueAt={row.nextMilestone.dueAt} />
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
