import { Hammer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { EmptyState } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export default function GroupTabPlaceholderPage() {
  const { t } = useTranslation('groups')
  const { groupId = '' } = useParams()

  return (
    <EmptyState
      icon={Hammer}
      title={t('workspace.comingSoonTitle')}
      description={t('workspace.comingSoonHint')}
      action={
        <Button asChild variant="outline">
          <Link to={ROUTES.groupDetail(groupId)}>{t('workspace.backToOverview')}</Link>
        </Button>
      }
      className="mx-auto mt-8 max-w-md"
    />
  )
}
