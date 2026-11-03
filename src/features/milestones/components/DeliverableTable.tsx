/**
 * @file Versions of a milestone's deliverable (UC10 step 4): version, file or link, note, who and when, with the
 *   "Primary" and "Late" flags; leader and deputies make another version the primary one.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { FileText, Link2, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { RelativeTime, UserAvatar } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { type Deliverable, useMockStore, useUserMap } from '@/mocks'
import { formatDateTime } from '@/utils/date'
import { formatFileSize } from '@/utils/format'

interface DeliverableTableProps {
  /** Newest first */
  versions: Deliverable[]
  canChoosePrimary: boolean
}

export function DeliverableTable({ versions, canChoosePrimary }: DeliverableTableProps) {
  const { t } = useTranslation('milestones')
  const users = useUserMap()
  const setPrimaryDeliverable = useMockStore((state) => state.setPrimaryDeliverable)

  return (
    <Table aria-label={t('deliverables.title')}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-24">{t('deliverables.version')}</TableHead>
          <TableHead className="min-w-56">{t('deliverables.product')}</TableHead>
          <TableHead>{t('deliverables.by')}</TableHead>
          <TableHead>{t('deliverables.at')}</TableHead>
          {canChoosePrimary && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {versions.map((item) => {
          const author = users[item.uploadedBy]
          const name = item.fileName ?? item.url
          return (
            <TableRow key={item.id} className={cn(item.isPrimary && 'bg-accent/40')}>
              <TableCell className="align-top">
                <span className="flex flex-col items-start gap-1">
                  <span className="font-mono text-sm font-semibold">v{item.version}</span>
                  {item.isPrimary && <Badge className="bg-primary text-primary-foreground">{t('deliverables.primary')}</Badge>}
                  {item.isLate && <Badge variant="outline" className="border-destructive text-destructive-text">{t('deliverables.late')}</Badge>}
                </span>
              </TableCell>
              <TableCell className="max-w-80 align-top whitespace-normal">
                {item.kind === 'link' ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 rounded-sm font-medium outline-none hover:underline focus-visible:shadow-focus"
                  >
                    <Link2 className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{name}</span>
                  </a>
                ) : (
                  // TODO(F06.02): link to the stored file once uploads reach the backend; the mock keeps no content
                  <span className="inline-flex max-w-full items-center gap-1.5 font-medium">
                    <FileText className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{name}</span>
                  </span>
                )}
                {item.fileSize !== null && <span className="ml-1 text-xs text-muted-foreground">({formatFileSize(item.fileSize)})</span>}
                {item.note && <p className="mt-0.5 text-[13px] text-muted-foreground">{item.note}</p>}
              </TableCell>
              <TableCell className="align-top">
                <span className="flex items-center gap-2 text-[13px]">
                  <UserAvatar userId={item.uploadedBy} fullName={author?.fullName ?? '?'} size={22} />
                  {author?.fullName}
                </span>
              </TableCell>
              <TableCell className="align-top text-[13px]" title={formatDateTime(item.createdAt)}>
                <RelativeTime value={item.createdAt} />
              </TableCell>
              {canChoosePrimary && (
                <TableCell className="align-top">
                  {!item.isPrimary && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('deliverables.makePrimaryFor', { version: item.version })}
                      title={t('deliverables.makePrimary')}
                      onClick={() => {
                        setPrimaryDeliverable(item.id)
                        toast.success(t('deliverables.primaryChanged', { version: item.version }))
                      }}
                    >
                      <Star aria-hidden />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
