/**
 * @file Login page (UC01).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormTextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { type LoginFormValues, loginSchema } from '@/features/auth/schemas/login.schema'

/** API wiring is added once the backend exposes the login endpoint (Orval hook). */
export default function LoginPage() {
  const { t } = useTranslation('auth')
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (_values: LoginFormValues) => {
    // TODO(UC01): call the generated login mutation and store the session in useAuthStore
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FormTextField
              control={form.control}
              name="email"
              label={t('field.email')}
              type="email"
              autoComplete="email"
            />
            <FormTextField
              control={form.control}
              name="password"
              label={t('field.password')}
              type="password"
              autoComplete="current-password"
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {t('login.submit')}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
