/**
 * @file Tasks of the student that need attention now (UC11): overdue or due within 3 days, soonest first, with
 *   their group.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { TaskListItem } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import type { Task } from '@/mocks'

const LIMIT = 6

export function UrgentTasks({ tasks, groupNames }: { tasks: Task[]; groupNames: Map<string, string> }) {
  const { t } = useTranslation('dashboard')

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('urgent.title')}</CardTitle>
        <CardDescription>{t('urgent.description')}</CardDescription>
        <CardAction>
          <Button asChild variant="link" size="sm">
            <Link to={ROUTES.tasks}>{t('urgent.viewAll')}</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <PartyPopper className="size-8 text-primary" aria-hidden />
            {t('urgent.empty')}
          </div>
        ) : (
          <ul className="-my-1 divide-y">
            {tasks.slice(0, LIMIT).map((task) => (
              <li key={task.id}>
                <TaskListItem task={task} groupName={groupNames.get(task.groupId)} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
