// Concept mock layer of the group workflow (M02-M11): data model, seed, in-memory store and derived numbers.
// Temporary: replaced by the generated API client once the backend endpoints exist.
export * from './hooks'
export { useMockStore } from './mock.store'
export * from './permissions'
export {
  daysFromNow,
  JOINABLE_GROUPS,
  JOINABLE_MEMBER_COUNT,
  ME_ID,
  SEMESTER_OPTIONS,
  SUBJECT_SUGGESTIONS,
} from './seed'
export * from './selectors'
export type { CreateGroupInput, JoinResult } from './store/groups-slice'
export type { DeliverableInput, MilestoneInput, ReviewRoundInput } from './store/results-slice'
export type { CarryOver, PhaseInput, TaskInput } from './store/work-slice'
export type * from './types'
