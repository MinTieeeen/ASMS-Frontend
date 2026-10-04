/**
 * @file Profile tab of the settings, SCR-USER-01 (UC-USER-01; API-USER-01, 02, 21). Photo upload and GitHub come in
 *   the next steps of Module 2.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { CircleAlert, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGetMyProfile } from '@/api/generated/endpoints/profiles/profiles'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { ProfileForm } from '../components/ProfileForm'

export default function ProfileSettingsPage() {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const profile = useGetMyProfile({ query: { staleTime: 0 } })

  if (profile.isPending) return <ProfileSkeleton />
  if (profile.isError) {
    return (
      <div className="flex items-center gap-3">
        <Alert variant="destructive" className="flex-1">
          <CircleAlert aria-hidden />
          <AlertTitle>{t('message.loadFailed')}</AlertTitle>
          <AlertDescription>{t('message.loadFailedDescription')}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void profile.refetch()}>
          <RotateCw aria-hidden />
          {tCommon('action.retry')}
        </Button>
      </div>
    )
  }
  // Mounted once with the first data: later reloads go through the form, so typed values are never lost
  return <ProfileForm initialProfile={profile.data} />
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Card>
        <CardContent className="flex items-center gap-5">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
