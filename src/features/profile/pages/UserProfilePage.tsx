/**
 * @file Full-page profile card at /users/{userId}, SCR-USER-03 on phones and for direct links.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'

import { ProfileCard } from '../components/ProfileCard'

export default function UserProfilePage() {
  const { t } = useTranslation('profile')
  const { userId = '' } = useParams()

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent>
        <ProfileCard
          userId={userId}
          notFoundAction={
            <Link
              to={ROUTES.home}
              className="text-sm font-semibold text-primary hover:text-primary-hover"
            >
              {t('card.backHome')}
            </Link>
          }
        />
      </CardContent>
    </Card>
  )
}
