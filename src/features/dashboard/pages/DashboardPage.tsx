/**
 * @file Personal dashboard (UC11, F07.02), the default page after login: greeting and today's summary, headline
 *   numbers, deadlines of the next 14 days, open tasks by status, urgent tasks, a deadline calendar, the student's
 *   groups and upcoming milestones, across every group.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-11-03
 */

import { useMemo, useState } from 'react'

import { useMyGroups } from '@/mocks'

import { DashboardHero } from '../components/DashboardHero'
import { DashboardKpis } from '../components/DashboardKpis'
import { DeadlineCalendar } from '../components/DeadlineCalendar'
import { MyGroupsTable } from '../components/MyGroupsTable'
import { StatusSplit } from '../components/StatusSplit'
import { UpcomingMilestones } from '../components/UpcomingMilestones'
import { UrgentTasks } from '../components/UrgentTasks'
import { WorkloadChart } from '../components/WorkloadChart'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const { data, now } = useDashboard()
  const myGroups = useMyGroups()
  const groupNames = useMemo(() => new Map(myGroups.map(({ group }) => [group.id, group.name])), [myGroups])
  const today = data.workload[0]?.day ?? ''
  // The chart and the calendar share the selected day
  const [selectedDay, setSelectedDay] = useState(today)

  return (
    <div className="flex flex-col gap-5">
      <DashboardHero now={now} dueToday={data.workload[0]?.count ?? 0} overdue={data.overdue} />
      <DashboardKpis data={data} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <WorkloadChart workload={data.workload} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>
        <StatusSplit split={data.statusSplit} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <UrgentTasks tasks={data.urgent} groupNames={groupNames} />
        </div>
        <DeadlineCalendar
          deadlinesByDay={data.deadlinesByDay}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          groupNames={groupNames}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <MyGroupsTable rows={data.groups} />
        </div>
        <UpcomingMilestones milestones={data.milestones} groupNames={groupNames} />
      </div>
    </div>
  )
}
