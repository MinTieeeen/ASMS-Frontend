/**
 * @file Personal dashboard (UC11, F07.02), the default page after login.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { EmptyState, PageHeader } from '@/components/common'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader title={t('nav.dashboard')} />
      <EmptyState icon={LayoutDashboard} title={t('state.empty')} />
    </>
  )
}
