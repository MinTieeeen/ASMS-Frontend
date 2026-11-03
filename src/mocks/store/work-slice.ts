/**
 * @file Mock backend of phases, tasks and retrospectives (M04, M05).
 * @author MinhTien
 * @version 1.3.0
 * @since 2026-10-16
 * @modified 2026-11-03
 */

import { ME_ID } from '../seed'
import type { Attachment, Phase, RetroKind, Task, TaskStatus } from '../types'
import { activity, newId, nowIso, type Slice } from './helpers'

export interface PhaseInput {
  name: string
  goal: string
  startDate: string
  endDate: string
  milestoneId: string | null
}

/** UC07-2: where the unfinished tasks of a closed phase go */
export type CarryOver = { mode: 'next' } | { mode: 'phase'; phaseId: string } | { mode: 'keep' }

export interface TaskInput {
  groupId: string
  phaseId: string | null
  parentTaskId?: string | null
  title: string
  description: string
  priority: Task['priority']
  assigneeId: string | null
  startAt: string | null
  dueAt: string | null
  estimateHours: number | null
  labelIds: string[]
  status?: TaskStatus
}

export interface WorkSlice {
  createPhase: (groupId: string, input: PhaseInput) => void
  updatePhase: (phaseId: string, input: PhaseInput) => void
  movePhase: (phaseId: string, offset: -1 | 1) => void
  /** UC06 step 3: the group's phases in their new display order */
  reorderPhases: (groupId: string, orderedIds: string[]) => void
  deletePhase: (phaseId: string, targetPhaseId: string | null) => void
  closePhase: (phaseId: string, carryOver: CarryOver) => void
  reopenPhase: (phaseId: string) => void
  addRetroItem: (phaseId: string, kind: RetroKind, text: string, isAnonymous: boolean) => void
  voteRetroItem: (itemId: string) => void
  createTask: (input: TaskInput) => string
  updateTask: (taskId: string, patch: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  setTaskStatus: (taskId: string, status: TaskStatus) => void
  approveTask: (taskId: string) => void
  returnTask: (taskId: string, reason: string) => void
  toggleChecklistItem: (taskId: string, itemId: string) => void
  addChecklistItem: (taskId: string, text: string) => void
  addComment: (taskId: string, body: string) => void
  addAttachment: (
    taskId: string,
    attachment: Omit<Attachment, 'id' | 'uploadedBy' | 'createdAt'>,
  ) => void
}

const UNFINISHED: ReadonlySet<TaskStatus> = new Set(['todo', 'in_progress', 'in_review'])

function patchTask(tasks: Task[], taskId: string, patch: Partial<Task>): Task[] {
  return tasks.map((item) => (item.id === taskId ? { ...item, ...patch } : item))
}

/** A phase that is not closed is upcoming until its start date, then active */
function openStatusOf(startDate: string): Phase['status'] {
  return new Date(startDate) > new Date() ? 'upcoming' : 'active'
}

export const createWorkSlice: Slice<WorkSlice> = (set, get) => ({
  createPhase: (groupId, input) =>
    set((state) => {
      const position = state.phases.filter((item) => item.groupId === groupId).length + 1
      const phase: Phase = {
        id: newId('p'),
        groupId,
        ...input,
        position,
        status: openStatusOf(input.startDate),
        closedAt: null,
        snapshot: null,
      }
      return {
        phases: [...state.phases, phase],
        activities: [
          activity(groupId, ME_ID, 'phaseCreated', { phase: input.name }),
          ...state.activities,
        ],
      }
    }),

  updatePhase: (phaseId, input) =>
    set((state) => ({
      phases: state.phases.map((item) =>
        item.id === phaseId
          ? {
              ...item,
              ...input,
              status: item.status === 'closed' ? 'closed' : openStatusOf(input.startDate),
            }
          : item,
      ),
    })),

  // Swaps with the neighbour in display order, so gaps left by deleted phases do not matter
  movePhase: (phaseId, offset) =>
    set((state) => {
      const phase = state.phases.find((item) => item.id === phaseId)
      if (!phase) return {}
      const ordered = state.phases
        .filter((item) => item.groupId === phase.groupId)
        .sort((a, b) => a.position - b.position)
      const swap = ordered[ordered.findIndex((item) => item.id === phaseId) + offset]
      if (!swap) return {}
      return {
        phases: state.phases.map((item) => {
          if (item.id === phase.id) return { ...item, position: swap.position }
          if (item.id === swap.id) return { ...item, position: phase.position }
          return item
        }),
      }
    }),

  reorderPhases: (groupId, orderedIds) =>
    set((state) => ({
      phases: state.phases.map((item) => {
        const index = orderedIds.indexOf(item.id)
        return item.groupId === groupId && index >= 0 ? { ...item, position: index + 1 } : item
      }),
    })),

  // UC06: a phase that still has tasks needs a phase to receive them (BR08: soft delete)
  deletePhase: (phaseId, targetPhaseId) =>
    set((state) => {
      const phase = state.phases.find((item) => item.id === phaseId)
      if (!phase) return {}
      return {
        phases: state.phases.filter((item) => item.id !== phaseId),
        tasks: state.tasks.map((item) =>
          item.phaseId === phaseId ? { ...item, phaseId: targetPhaseId } : item,
        ),
        activities: [
          activity(phase.groupId, ME_ID, 'phaseDeleted', { phase: phase.name }),
          ...state.activities,
        ],
      }
    }),

  // UC07: snapshot the numbers, move the unfinished tasks
  closePhase: (phaseId, carryOver) => {
    const state = get()
    const phase = state.phases.find((item) => item.id === phaseId)
    if (!phase) return
    const tasks = state.tasks.filter((item) => item.phaseId === phaseId && !item.parentTaskId)
    const now = new Date()
    const unfinished = tasks.filter((item) => UNFINISHED.has(item.status))
    const snapshot = {
      done: tasks.filter((item) => item.status === 'done').length,
      unfinished: unfinished.length,
      overdue: unfinished.filter((item) => item.dueAt && new Date(item.dueAt) < now).length,
    }
    const next = state.phases
      .filter((item) => item.groupId === phase.groupId && item.position > phase.position)
      .sort((a, b) => a.position - b.position)[0]
    const target =
      carryOver.mode === 'next'
        ? (next?.id ?? null)
        : carryOver.mode === 'phase'
          ? carryOver.phaseId
          : phaseId
    set({
      phases: state.phases.map((item) =>
        item.id === phaseId ? { ...item, status: 'closed', closedAt: nowIso(), snapshot } : item,
      ),
      tasks: state.tasks.map((item) =>
        item.phaseId === phaseId && UNFINISHED.has(item.status)
          ? { ...item, phaseId: target }
          : item,
      ),
      activities: [
        activity(phase.groupId, ME_ID, 'phaseClosed', { phase: phase.name }),
        ...state.activities,
      ],
    })
  },

  reopenPhase: (phaseId) =>
    set((state) => {
      const phase = state.phases.find((item) => item.id === phaseId)
      if (!phase) return {}
      return {
        phases: state.phases.map((item) =>
          item.id === phaseId ? { ...item, status: 'active', closedAt: null } : item,
        ),
        activities: [
          activity(phase.groupId, ME_ID, 'phaseReopened', { phase: phase.name }),
          ...state.activities,
        ],
      }
    }),

  addRetroItem: (phaseId, kind, text, isAnonymous) =>
    set((state) => ({
      retroItems: [
        ...state.retroItems,
        { id: newId('r'), phaseId, kind, text, authorId: isAnonymous ? null : ME_ID, votes: 0 },
      ],
    })),

  voteRetroItem: (itemId) =>
    set((state) => ({
      retroItems: state.retroItems.map((item) =>
        item.id === itemId ? { ...item, votes: item.votes + 1 } : item,
      ),
    })),

  createTask: (input) => {
    const id = newId('t')
    set((state) => {
      const code =
        Math.max(
          0,
          ...state.tasks.filter((item) => item.groupId === input.groupId).map((item) => item.code),
        ) + 1
      const task: Task = {
        id,
        groupId: input.groupId,
        phaseId: input.phaseId,
        parentTaskId: input.parentTaskId ?? null,
        code,
        title: input.title,
        description: input.description,
        status: input.status ?? 'todo',
        priority: input.priority,
        assigneeId: input.assigneeId,
        supporterIds: [],
        startAt: input.startAt,
        dueAt: input.dueAt,
        estimateHours: input.estimateHours,
        labelIds: input.labelIds,
        checklist: [],
        attachments: [],
        blockedBy: [],
        createdBy: ME_ID,
        createdAt: nowIso(),
        completedAt: null,
        position: Date.now(),
      }
      return {
        tasks: [...state.tasks, task],
        taskEvents: [
          ...state.taskEvents,
          { id: newId('e'), taskId: id, actorId: ME_ID, kind: 'created', createdAt: nowIso() },
        ],
        activities: [
          activity(input.groupId, ME_ID, 'taskCreated', { task: `#${code} ${input.title}` }),
          ...state.activities,
        ],
      }
    })
    return id
  },

  // A new assignee is recorded in the task history; `note` holds their name, empty when unassigned
  updateTask: (taskId, patch) => {
    const task = get().tasks.find((item) => item.id === taskId)
    if (!task) return
    const isReassigned = patch.assigneeId !== undefined && patch.assigneeId !== task.assigneeId
    const assignee = get().users.find((item) => item.id === patch.assigneeId)
    set((state) => ({
      tasks: patchTask(state.tasks, taskId, patch),
      taskEvents: isReassigned
        ? [
            ...state.taskEvents,
            {
              id: newId('e'),
              taskId,
              actorId: ME_ID,
              kind: 'assigned',
              note: assignee?.fullName ?? '',
              createdAt: nowIso(),
            },
          ]
        : state.taskEvents,
    }))
  },

  // BR08 asks for a soft delete on the backend; the mock simply drops the task with its sub-tasks and history
  deleteTask: (taskId) =>
    set((state) => {
      const removed = new Set(
        state.tasks.filter((item) => item.id === taskId || item.parentTaskId === taskId).map((item) => item.id),
      )
      return {
        tasks: state.tasks.filter((item) => !removed.has(item.id)),
        comments: state.comments.filter((item) => !removed.has(item.taskId)),
        taskEvents: state.taskEvents.filter((item) => !removed.has(item.taskId)),
      }
    }),

  setTaskStatus: (taskId, status) => {
    const task = get().tasks.find((item) => item.id === taskId)
    if (!task || task.status === status) return
    set((state) => ({
      tasks: patchTask(state.tasks, taskId, {
        status,
        completedAt: status === 'done' ? nowIso() : null,
      }),
      taskEvents: [
        ...state.taskEvents,
        {
          id: newId('e'),
          taskId,
          actorId: ME_ID,
          kind: status === 'cancelled' ? 'cancelled' : 'statusChanged',
          from: task.status,
          to: status,
          createdAt: nowIso(),
        },
      ],
      activities: [
        activity(task.groupId, ME_ID, 'taskStatusChanged', {
          task: `#${task.code} ${task.title}`,
          status,
        }),
        ...state.activities,
      ],
    }))
  },

  approveTask: (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId)
    if (!task) return
    set((state) => ({
      tasks: patchTask(state.tasks, taskId, { status: 'done', completedAt: nowIso() }),
      taskEvents: [
        ...state.taskEvents,
        { id: newId('e'), taskId, actorId: ME_ID, kind: 'approved', createdAt: nowIso() },
      ],
      activities: [
        activity(task.groupId, ME_ID, 'taskApproved', { task: `#${task.code} ${task.title}` }),
        ...state.activities,
      ],
    }))
  },

  // UC09-3: returned with a reason, back to In progress
  returnTask: (taskId, reason) => {
    const task = get().tasks.find((item) => item.id === taskId)
    if (!task) return
    set((state) => ({
      tasks: patchTask(state.tasks, taskId, { status: 'in_progress' }),
      taskEvents: [
        ...state.taskEvents,
        {
          id: newId('e'),
          taskId,
          actorId: ME_ID,
          kind: 'returned',
          note: reason,
          createdAt: nowIso(),
        },
      ],
      activities: [
        activity(task.groupId, ME_ID, 'taskReturned', {
          task: `#${task.code} ${task.title}`,
          reason,
        }),
        ...state.activities,
      ],
    }))
  },

  toggleChecklistItem: (taskId, itemId) =>
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              checklist: item.checklist.map((entry) =>
                entry.id === itemId ? { ...entry, isDone: !entry.isDone } : entry,
              ),
            }
          : item,
      ),
    })),

  addChecklistItem: (taskId, text) =>
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === taskId
          ? { ...item, checklist: [...item.checklist, { id: newId('c'), text, isDone: false }] }
          : item,
      ),
    })),

  addComment: (taskId, body) =>
    set((state) => ({
      comments: [
        ...state.comments,
        { id: newId('cm'), taskId, authorId: ME_ID, body, createdAt: nowIso() },
      ],
    })),

  addAttachment: (taskId, attachment) =>
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              attachments: [
                ...item.attachments,
                { ...attachment, id: newId('a'), uploadedBy: ME_ID, createdAt: nowIso() },
              ],
            }
          : item,
      ),
    })),
})
