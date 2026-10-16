/**
 * @file Summary of each of my groups for the group list and the dashboard: progress, next milestone, my open tasks.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useMemo } from 'react'

import {
  isTaskClosed,
  ME_ID,
  type Milestone,
  type MockUser,
  type MyGroup,
  type Progress,
  progressOf,
  useMockStore,
  useMyGroups,
  useUserMap,
} from '@/mocks'

export interface GroupSummary extends MyGroup {
  progress: Progress
  nextMilestone: Milestone | null
  myOpenTasks: number
  people: MockUser[]
}

export function useGroupSummaries(): GroupSummary[] {
  const myGroups = useMyGroups()
  const tasks = useMockStore((state) => state.tasks)
  const milestones = useMockStore((state) => state.milestones)
  const members = useMockStore((state) => state.members)
  const users = useUserMap()

  return useMemo(() => {
    const now = new Date()
    return myGroups.map((item) => {
      const groupTasks = tasks.filter((task) => task.groupId === item.group.id)
      const nextMilestone =
        milestones
          .filter((milestone) => milestone.groupId === item.group.id && new Date(milestone.dueAt) >= now)
          .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0] ?? null
      const people = members
        .filter((member) => member.groupId === item.group.id && member.status === 'active')
        .flatMap((member) => (users[member.userId] ? [users[member.userId] as MockUser] : []))
      return {
        ...item,
        progress: progressOf(groupTasks),
        nextMilestone,
        myOpenTasks: groupTasks.filter(
          (task) => task.assigneeId === ME_ID && !isTaskClosed(task) && !task.parentTaskId,
        ).length,
        people,
      }
    })
  }, [myGroups, tasks, milestones, members, users])
}
