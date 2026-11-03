/**
 * @file Tabs of the group workspace and which of them are built; links into a tab that is not built are hidden.
 * @author MinhTien
 * @version 1.0.1
 * @since 2026-11-03
 * @modified 2026-11-03
 */

export type GroupTabKey = 'overview' | 'tasks' | 'phases' | 'milestones' | 'members' | 'settings'

/**
 * Add a key when its page ships: the tab opens and every link into it (overview cards, task rows, phase
 * timeline) comes back on its own.
 */
const READY_GROUP_TABS: ReadonlySet<GroupTabKey> = new Set<GroupTabKey>(['overview', 'phases', 'members'])

export function isGroupTabReady(tab: GroupTabKey): boolean {
  return READY_GROUP_TABS.has(tab)
}
