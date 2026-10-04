/**
 * @file Public profile card, SCR-USER-03 (UC-USER-03, API-USER-05): photo, name, school, GitHub, about.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { ExternalLink, GraduationCap, UserRoundX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGetPublicProfile } from '@/api/generated/endpoints/profiles/profiles'
import type { PublicProfileResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { UserAvatar } from '@/components/common'
import { Skeleton } from '@/components/ui/skeleton'

/** Cards are opened again and again from member lists; their content changes rarely */
const PROFILE_STALE_TIME_MS = 60_000

interface ProfileCardProps {
  userId: string
  /** Shown under "not found", e.g. a link back home on the full page */
  notFoundAction?: React.ReactNode
}

export function ProfileCard({ userId, notFoundAction }: ProfileCardProps) {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const profile = useGetPublicProfile(userId, { query: { staleTime: PROFILE_STALE_TIME_MS } })

  if (profile.isPending) return <ProfileCardSkeleton />
  if (profile.isError) {
    const isNotFound = toApiError(profile.error).code === 'USER_NOT_FOUND'
    return (
      <div className="flex flex-col items-center gap-2.5 py-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRoundX className="size-5" aria-hidden />
        </span>
        <p className="text-[15px] font-semibold">
          {isNotFound ? t('message.notFound') : tCommon('error.generic')}
        </p>
        {notFoundAction}
      </div>
    )
  }
  return <ProfileCardContent profile={profile.data} />
}

function ProfileCardContent({ profile }: { profile: PublicProfileResponse }) {
  const { t } = useTranslation('profile')
  const { github, school } = profile

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3.5">
        <UserAvatar
          userId={profile.id}
          fullName={profile.fullName}
          avatarUrl={profile.avatarUrl}
          size={64}
        />
        <h3 className="font-heading text-lg leading-6 font-semibold">{profile.fullName}</h3>
      </div>
      {(school || github) && (
        <div className="flex flex-col gap-2 text-sm">
          {school && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="size-4 shrink-0" aria-hidden />
              <span className="text-foreground">{school.name}</span>
            </p>
          )}
          {github && (
            <a
              href={github.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('card.openGithub', { login: github.login })}
              className="flex items-center gap-2.5 rounded-md border px-2.5 py-2 hover:bg-muted focus-visible:shadow-focus focus-visible:outline-none"
            >
              <img src={github.avatarUrl} alt="" className="size-7 rounded-full" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">@{github.login}</span>
                <span className="text-xs text-muted-foreground">
                  {t('card.githubStats', {
                    repos: github.publicRepos,
                    followers: github.followers,
                  })}
                </span>
              </span>
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
            </a>
          )}
        </div>
      )}
      {/* Plain text only, never HTML (NFR-USER-06) */}
      {profile.bio ? (
        <p className="border-t pt-3 text-sm leading-[21px] whitespace-pre-line">{profile.bio}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{t('card.noBio')}</p>
      )}
    </div>
  )
}

function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <div className="flex items-center gap-3">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}
