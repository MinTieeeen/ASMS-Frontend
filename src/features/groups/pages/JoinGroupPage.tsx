/**
 * @file Invite link landing page (UC04 steps 2-4): group preview, then join at once or send a join request.
 *   Alternatives: code not found, group full (3a), already a member (3b), request already sent.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { CircleAlert, Hourglass, SearchX, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/config/routes'
import { JOINABLE_GROUPS, JOINABLE_MEMBER_COUNT, ME_ID, useMockStore } from '@/mocks'

export default function JoinGroupPage() {
  const { t } = useTranslation('groups')
  const navigate = useNavigate()
  const code = (useParams().code ?? '').toUpperCase()
  const groups = useMockStore((state) => state.groups)
  const members = useMockStore((state) => state.members)
  const pending = useMockStore((state) => state.myPendingRequests)
  const joinByCode = useMockStore((state) => state.joinByCode)
  const [message, setMessage] = useState('')

  const mine = groups.find((item) => item.joinCode === code)
  const isMember =
    !!mine && members.some((item) => item.groupId === mine.id && item.userId === ME_ID && item.status === 'active')
  // UC04-3b: already in the group, go straight to it
  if (mine && isMember) return <Navigate to={ROUTES.groupDetail(mine.id)} replace />

  const group = JOINABLE_GROUPS.find((item) => item.joinCode === code)
  if (!group) {
    return (
      <EmptyState
        icon={SearchX}
        title={t('join.notFound')}
        description={t('join.notFoundHint')}
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.groups}>{t('join.backToGroups')}</Link>
          </Button>
        }
        className="mx-auto mt-10 max-w-md"
      />
    )
  }

  const memberCount = JOINABLE_MEMBER_COUNT[group.id] ?? 1
  const isFull = memberCount >= group.maxMembers
  const isPending = pending.includes(code)

  const join = () => {
    const result = joinByCode(code)
    if (result === 'joined') {
      toast.success(t('join.joined', { group: group.name }))
      void navigate(ROUTES.groupDetail(group.id))
    } else if (result === 'requested') {
      toast.success(t('join.requested'))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 pt-4 md:pt-10">
      <p className="text-center text-sm text-muted-foreground">{t('join.invitedTo')}</p>
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap gap-1.5">
            {group.subjectCode && (
              <Badge variant="secondary" className="font-mono">
                {group.subjectCode}
              </Badge>
            )}
            {group.semester && <Badge variant="outline">{group.semester}</Badge>}
          </div>
          <CardTitle className="text-xl">{group.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{group.topic}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="flex items-center gap-2">
            <UsersRound className="size-4 text-muted-foreground" aria-hidden />
            {t('join.memberCount', { count: memberCount, max: group.maxMembers })}
          </p>
          {group.subjectName && <p className="text-muted-foreground">{group.subjectName}</p>}
          {isFull && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden />
              <AlertTitle>{t('join.fullTitle')}</AlertTitle>
              <AlertDescription>{t('join.fullDescription')}</AlertDescription>
            </Alert>
          )}
          {isPending && (
            <Alert>
              <Hourglass aria-hidden />
              <AlertTitle>{t('join.pendingTitle')}</AlertTitle>
              <AlertDescription>{t('join.pendingDescription')}</AlertDescription>
            </Alert>
          )}
          {!isFull && !isPending && group.requireApproval && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="join-message">{t('join.message')}</Label>
              <Textarea id="join-message" rows={3} value={message} maxLength={300} onChange={(event) => setMessage(event.target.value)} placeholder={t('join.messagePlaceholder')} />
              <p className="text-xs text-muted-foreground">{t('join.approvalHint')}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link to={ROUTES.groups}>{t('join.notNow')}</Link>
          </Button>
          <Button disabled={isFull || isPending} onClick={join}>
            {group.requireApproval ? t('join.sendRequest') : t('join.joinNow')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
