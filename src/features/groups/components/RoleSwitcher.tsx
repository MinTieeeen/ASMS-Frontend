/**
 * @file Concept-only control: preview the workspace as Leader, Deputy or Member to check the permission matrix
 *   (section 3.2) without changing the data. Removed once the backend exists.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Eye, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type GroupRole, useMockStore } from '@/mocks'

const ROLES: GroupRole[] = ['leader', 'deputy', 'member']

interface RoleSwitcherProps {
  groupId: string
  role: GroupRole
  actualRole: GroupRole
}

export function RoleSwitcher({ groupId, role, actualRole }: RoleSwitcherProps) {
  const { t } = useTranslation()
  const setRoleOverride = useMockStore((state) => state.setRoleOverride)
  const resetDemo = useMockStore((state) => state.resetDemo)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <Eye aria-hidden />
          <span className="rounded-sm bg-highlight-soft px-1 text-[11px] font-semibold text-highlight-text uppercase">
            {t('concept.badge')}
          </span>
          {t(`domain.groupRole.${role}`)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t('concept.note')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('concept.viewAs')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={role}
          onValueChange={(value) => {
            const next = ROLES.find((item) => item === value)
            if (next) setRoleOverride(groupId, next === actualRole ? null : next)
          }}
        >
          {ROLES.map((item) => (
            <DropdownMenuRadioItem key={item} value={item}>
              {t(`domain.groupRole.${item}`)}
              {item === actualRole && (
                <span className="ml-auto text-xs text-muted-foreground">({t('concept.realRole')})</span>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            resetDemo()
            toast.success(t('concept.resetDone'))
          }}
        >
          <RotateCcw aria-hidden />
          {t('concept.reset')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
