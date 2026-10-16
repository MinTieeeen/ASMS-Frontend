/**
 * @file Invite panel of the members page (F03.02): code and link, invite by e-mail, pending e-mail invitations.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Mail, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { RelativeTime } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { type GroupWorkspace, useMockStore } from '@/mocks'

import { InviteShareBox } from './InviteShareBox'

const emailSchema = z.email()

export function InvitePanel({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { group, members, can } = workspace
  const allInvites = useMockStore((state) => state.emailInvites)
  const inviteByEmail = useMockStore((state) => state.inviteByEmail)
  const revokeInvite = useMockStore((state) => state.revokeInvite)
  const regenerateJoinCode = useMockStore((state) => state.regenerateJoinCode)
  const [email, setEmail] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)
  const invites = allInvites.filter((item) => item.groupId === group.id)
  const isFull = members.length >= group.maxMembers

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!emailSchema.safeParse(email.trim()).success) {
      setIsInvalid(true)
      return
    }
    inviteByEmail(group.id, email.trim().toLowerCase())
    toast.success(t('invite.emailSent', { email }))
    setEmail('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('invite.title')}</CardTitle>
        <CardDescription>
          {isFull ? t('invite.full') : t('invite.slots', { count: group.maxMembers - members.length })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <InviteShareBox
          group={group}
          onRegenerate={can('changeRole') ? () => regenerateJoinCode(group.id) : undefined}
        />
        <form onSubmit={submit} className="flex flex-col gap-1.5" noValidate>
          <label htmlFor="invite-email" className="text-sm font-medium">
            {t('invite.byEmail')}
          </label>
          <div className="flex gap-2">
            <Input
              id="invite-email"
              type="email"
              value={email}
              disabled={isFull}
              placeholder="ban@student.edu.vn"
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? 'invite-email-error' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                setIsInvalid(false)
              }}
            />
            <Button type="submit" disabled={isFull || !email}>
              <Mail aria-hidden />
              {t('invite.send')}
            </Button>
          </div>
          {isInvalid && <FieldError id="invite-email-error">{t('validation.emailInvalid')}</FieldError>}
        </form>
        {invites.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{t('invite.pending')}</p>
            <ul className="divide-y">
              {invites.map((invite) => (
                <li key={invite.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{invite.email}</span>
                  <RelativeTime value={invite.createdAt} className="text-xs text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('invite.revoke', { email: invite.email })}
                    onClick={() => revokeInvite(invite.id)}
                  >
                    <X aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
