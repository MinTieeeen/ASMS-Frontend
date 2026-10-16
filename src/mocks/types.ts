/**
 * @file Concept data model of the group workflow (requirement section 7.2-7.3), used by the mock layer until the
 *   backend exposes the group, phase, task, milestone and review APIs.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

export type GroupRole = 'leader' | 'deputy' | 'member'
export type MemberStatus = 'active' | 'left' | 'removed'
export type GroupStatus = 'active' | 'archived'
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PhaseStatus = 'upcoming' | 'active' | 'closed'
export type MilestoneStatus = 'open' | 'submitted' | 'graded'
export type LabelTone = 'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5'
export type PhaseTemplate = 'blank' | 'software' | 'research'

export interface MockUser {
  id: string
  fullName: string
  userCode: string
  email: string
  skills: string[]
}

export interface Group {
  id: string
  name: string
  topic: string
  description: string
  /** UC02: classification only, every field optional */
  subjectCode: string | null
  subjectName: string | null
  semester: string | null
  /** The semester has ended: the group can be hidden from the dashboard (F02.03) */
  isSemesterEnded: boolean
  lecturerName: string | null
  maxMembers: number
  /** BR04 */
  joinCode: string
  inviteExpiresAt: string | null
  requireApproval: boolean
  reviewEnabled: boolean
  requireResultOnReview: boolean
  status: GroupStatus
  createdAt: string
  lastActivityAt: string
  githubRepo: string | null
}

export interface Member {
  id: string
  groupId: string
  userId: string
  role: GroupRole
  status: MemberStatus
  joinedAt: string
  leftAt: string | null
}

export interface EmailInvite {
  id: string
  groupId: string
  email: string
  invitedBy: string
  createdAt: string
}

export interface JoinRequest {
  id: string
  groupId: string
  userId: string
  message: string
  createdAt: string
}

export interface Charter {
  groupId: string
  content: string[]
  version: number
  updatedAt: string
  confirmedBy: string[]
}

export interface PhaseSnapshot {
  done: number
  unfinished: number
  overdue: number
}

export interface Phase {
  id: string
  groupId: string
  name: string
  goal: string
  startDate: string
  endDate: string
  position: number
  status: PhaseStatus
  closedAt: string | null
  milestoneId: string | null
  snapshot: PhaseSnapshot | null
}

export interface Label {
  id: string
  groupId: string
  name: string
  tone: LabelTone
}

export interface ChecklistItem {
  id: string
  text: string
  isDone: boolean
}

export interface Attachment {
  id: string
  kind: 'file' | 'link'
  name: string
  url: string
  size: number | null
  uploadedBy: string
  createdAt: string
}

export interface Task {
  id: string
  groupId: string
  phaseId: string | null
  /** Sub-tasks are one level deep only */
  parentTaskId: string | null
  /** Number inside the group, shown as #12 */
  code: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  supporterIds: string[]
  dueAt: string | null
  estimateHours: number | null
  labelIds: string[]
  checklist: ChecklistItem[]
  attachments: Attachment[]
  /** F05.10: tasks that must be done first */
  blockedBy: string[]
  createdBy: string
  createdAt: string
  completedAt: string | null
  position: number
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  body: string
  createdAt: string
}

export type TaskEventKind =
  'created' | 'assigned' | 'statusChanged' | 'approved' | 'returned' | 'cancelled'

export interface TaskEvent {
  id: string
  taskId: string
  actorId: string
  kind: TaskEventKind
  from?: TaskStatus
  to?: TaskStatus
  note?: string
  createdAt: string
}

export interface Milestone {
  id: string
  groupId: string
  name: string
  /** Requirements of the lecturer */
  description: string
  dueAt: string
  /** Score weight in percent */
  weight: number | null
  status: MilestoneStatus
  score: number | null
  feedback: string | null
  /** F06.04: pre-submission checklist */
  checklist: ChecklistItem[]
}

export interface Deliverable {
  id: string
  milestoneId: string
  version: number
  kind: 'file' | 'link'
  url: string
  fileName: string | null
  fileSize: number | null
  note: string
  isPrimary: boolean
  isLate: boolean
  uploadedBy: string
  createdAt: string
}

export interface ProgressUpdate {
  id: string
  groupId: string
  userId: string
  done: string
  next: string
  blockers: string
  createdAt: string
}

export type RetroKind = 'good' | 'bad' | 'improve'

export interface RetroItem {
  id: string
  phaseId: string
  kind: RetroKind
  text: string
  /** Null when posted anonymously */
  authorId: string | null
  votes: number
}

export interface ReviewCriterion {
  id: string
  name: string
}

export interface ReviewResult {
  userId: string
  reviewCount: number
  /** Average per criterion, 1-5 */
  scores: Record<string, number>
  /** BR12: only shown from 2 reviews up; never linked to their writers (BR11) */
  comments: string[]
}

export interface ReviewRound {
  id: string
  groupId: string
  name: string
  deadline: string
  criteria: ReviewCriterion[]
  allowSelfReview: boolean
  status: 'open' | 'closed'
  /** Who has submitted, without what they wrote (BR11) */
  submittedBy: string[]
  results: ReviewResult[] | null
}

export interface ReviewDraft {
  scores: Record<string, number>
  comment: string
}

export interface Resource {
  id: string
  groupId: string
  kind: 'file' | 'link'
  title: string
  url: string
  folder: string
  size: number | null
  addedBy: string
  createdAt: string
}

export interface ActionItem {
  id: string
  text: string
  assigneeId: string | null
  /** Set once the item has been turned into a task (F09.02) */
  taskId: string | null
}

export interface MeetingNote {
  id: string
  groupId: string
  title: string
  heldAt: string
  attendeeIds: string[]
  summary: string
  actionItems: ActionItem[]
}

export interface PollOption {
  id: string
  text: string
  voterIds: string[]
}

export interface Poll {
  id: string
  groupId: string
  question: string
  options: PollOption[]
  closesAt: string
  createdBy: string
}

export type ActivityKind =
  | 'memberJoined'
  | 'memberLeft'
  | 'roleChanged'
  | 'taskCreated'
  | 'taskStatusChanged'
  | 'taskApproved'
  | 'taskReturned'
  | 'phaseCreated'
  | 'phaseClosed'
  | 'deliverableUploaded'
  | 'milestoneGraded'
  | 'reviewOpened'
  | 'charterConfirmed'
  | 'groupUpdated'

export type ActivityCategory = 'member' | 'task' | 'phase' | 'milestone' | 'group'

export interface Activity {
  id: string
  groupId: string
  actorId: string
  kind: ActivityKind
  /** Values interpolated into the translated sentence: task, phase, milestone, member, role... */
  params: Record<string, string>
  createdAt: string
}

export type NotificationKind =
  | 'taskAssigned'
  | 'taskDueSoon'
  | 'taskOverdue'
  | 'taskReviewRequested'
  | 'taskApproved'
  | 'taskReturned'
  | 'mentioned'
  | 'joinRequest'
  | 'joinApproved'
  | 'groupInvite'
  | 'milestoneDueSoon'
  | 'reviewOpened'
  | 'memberLeft'

export interface AppNotification {
  id: string
  kind: NotificationKind
  groupId: string
  actorId: string | null
  params: Record<string, string>
  /** Route opened when the notification is clicked */
  link: string
  createdAt: string
  readAt: string | null
}
