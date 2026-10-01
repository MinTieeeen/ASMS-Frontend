/**
 * @file Reads the one-time token of an email link and removes it from the address bar (FR-AUTH-15, section 7.6).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

const TOKEN_PARAM = 'token'
const REFERRER_META_NAME = 'referrer'

/**
 * Keeps the token in component state only. The page also gets `<meta name="referrer" content="no-referrer">` while
 * mounted, so the token never leaks through the Referer header of fonts or links.
 *
 * @returns the token, or `null` when the link has none
 */
export function useUrlToken(): string | null {
  const [searchParams, setSearchParams] = useSearchParams()
  const [token] = useState(() => searchParams.get(TOKEN_PARAM))

  useEffect(() => {
    if (!searchParams.has(TOKEN_PARAM)) return
    setSearchParams(
      (params) => {
        params.delete(TOKEN_PARAM)
        return params
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = REFERRER_META_NAME
    meta.content = 'no-referrer'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return token
}
