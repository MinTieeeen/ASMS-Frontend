/**
 * @file Group information settings (F02.01, UC02): name, topic, description, member limit (BR02: not below the
 *   current members), subject, semester and lecturer, with the same fields as group creation.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Group, useMockStore } from '@/mocks'

import { type CreateGroupFormValues, createGroupSchema } from '../schemas/create-group.schema'
import { GroupInfoFields } from './GroupInfoFields'

interface GroupInfoSettingsProps {
  group: Group
  memberCount: number
  canEdit: boolean
}

export function GroupInfoSettings({ group, memberCount, canEdit }: GroupInfoSettingsProps) {
  const { t } = useTranslation('groups')
  const updateGroup = useMockStore((state) => state.updateGroup)
  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: valuesOf(group),
  })

  const submit = form.handleSubmit((values) => {
    updateGroup(group.id, {
      name: values.name,
      topic: values.topic,
      description: values.description,
      // UC02-2a: every classification field is optional; empty means "Unclassified"
      subjectCode: values.subjectCode || null,
      subjectName: values.subjectName || null,
      semester: values.semester || null,
      lecturerName: values.lecturerName || null,
      maxMembers: Math.max(Number(values.maxMembers), memberCount),
    })
    form.reset(values)
    toast.success(t('settings.info.saved'))
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.info.title')}</CardTitle>
        <CardDescription>{t('settings.info.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void submit(event)} noValidate>
          {/* A disabled fieldset turns every field and the save button read-only for non-leaders */}
          <fieldset disabled={!canEdit} className="flex flex-col gap-4">
            <GroupInfoFields
              control={form.control}
              setValue={form.setValue}
              minMaxMembers={memberCount}
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.info.minMembers', { count: memberCount })}
            </p>
            {canEdit && (
              <Button type="submit" className="self-start" disabled={!form.formState.isDirty}>
                {t('settings.info.save')}
              </Button>
            )}
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}

function valuesOf(group: Group): CreateGroupFormValues {
  return {
    name: group.name,
    topic: group.topic,
    description: group.description,
    subjectCode: group.subjectCode ?? '',
    subjectName: group.subjectName ?? '',
    semester: group.semester ?? '',
    lecturerName: group.lecturerName ?? '',
    maxMembers: String(group.maxMembers),
    // Group creation only; kept so both forms share one schema and one set of fields
    template: 'blank',
  }
}
