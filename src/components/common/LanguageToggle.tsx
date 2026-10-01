/**
 * @file Vietnamese / English switcher next to the theme switcher (NFR14).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-01
 * @modified 2026-10-01
 */

import { Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { updateMyLanguage } from '@/api/generated/endpoints/users/users'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/constants'
import { useAuthStore } from '@/stores/auth.store'

import { Flag } from './Flag'

/** Each language is named in its own language, so it can be found whatever the current one is. */
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = { vi: 'Tiếng Việt', en: 'English' }

function isSupported(language: string): language is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
}

/**
 * The UI switches at once (and i18next remembers it in localStorage). When signed in, the choice is also saved
 * to the profile, so emails and the next sign-in on any device use it too.
 */
export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const current = isSupported(i18n.resolvedLanguage ?? '')
    ? (i18n.resolvedLanguage as SupportedLanguage)
    : 'vi'

  const select = async (language: SupportedLanguage) => {
    if (language === current) return
    await i18n.changeLanguage(language)
    const { status, setUser } = useAuthStore.getState()
    if (status !== 'authenticated') return
    try {
      setUser(await updateMyLanguage({ language: language === 'vi' ? 'VI' : 'EN' }))
    } catch {
      toast.error(t('language.saveFailed'))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-1.5 rounded-full px-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground data-[state=open]:bg-muted"
          aria-label={t('language.toggle')}
        >
          <Flag language={current} className="size-4.5 text-foreground" />
          <span aria-hidden>{current.toUpperCase()}</span>
          <ChevronDown className="size-3.5 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-xl p-1.5">
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language}
            lang={language}
            className="gap-2.5 rounded-lg px-2.5 py-2"
            onClick={() => void select(language)}
            aria-current={language === current}
          >
            <Flag language={language} />
            <span className="flex-1">{LANGUAGE_NAMES[language]}</span>
            {language === current && <Check className="text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
