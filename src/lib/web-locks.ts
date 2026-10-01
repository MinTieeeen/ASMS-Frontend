/**
 * @file Web Locks API wrapper: runs a task while holding a lock shared by every tab of the origin.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-27
 * @modified 2026-09-27
 */

/**
 * Section 7.3: tabs refresh the session one after another. Without Web Locks the task runs directly; the backend's
 * AUTH_REFRESH_RACE answer is then the second line of defence.
 */
export function withLock<T>(name: string, task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  if (!locks) return task()
  return locks.request(name, task)
}
