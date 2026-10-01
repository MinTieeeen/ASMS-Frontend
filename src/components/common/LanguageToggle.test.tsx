import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { LanguageToggle } from '@/components/common'
import i18n from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, server, testUser } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'

async function pick(name: string) {
  await userEvent.click(screen.getByRole('button', { name: /Đổi ngôn ngữ|Change language/ }))
  await userEvent.click(await screen.findByRole('menuitem', { name }))
}

describe('LanguageToggle', () => {
  afterEach(() => i18n.changeLanguage('vi'))

  it('switches the UI language and the html lang without calling the API when signed out', async () => {
    let called = false
    server.use(
      http.put(apiUrl('/users/me/language'), () => {
        called = true
        return HttpResponse.json(testUser)
      }),
    )
    renderWithProviders(<LanguageToggle />)

    await pick('English')

    expect(i18n.resolvedLanguage).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('button', { name: 'Change language' })).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('saves the choice to the profile when signed in', async () => {
    let body: unknown
    server.use(
      http.put(apiUrl('/users/me/language'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ ...testUser, language: 'EN' })
      }),
    )
    useAuthStore.getState().setSession('access-token', testUser)
    renderWithProviders(<LanguageToggle />)

    await pick('English')

    await waitFor(() => expect(useAuthStore.getState().user?.language).toBe('EN'))
    expect(body).toEqual({ language: 'EN' })
  })
})
