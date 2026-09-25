# Internationalization and Date/Time

## 1. i18n (NFR14)

- **No hard-coded user-facing text in JSX**, including `aria-label`, `placeholder`, `title` and toast messages. Use `t('key')`.
- Vietnamese (`vi`) is the default language; English (`en`) must always have the same keys.
- One namespace per feature (`auth.json`, `tasks.json`...) in `src/locales/{vi,en}/`, registered in `lib/i18n.ts`. Shared words (actions, states, navigation) live in `common.json`.
- Keys are `camelCase`, grouped by screen or purpose: `login.title`, `field.email`, `validation.emailInvalid`.
- Keys are type-checked (`types/i18next.d.ts`): a wrong key fails the build.
- Zod validation messages are i18n keys with namespace: `z.email('auth:validation.emailInvalid')`. Form components (`components/form`) translate them with `translateKey`.
- Use interpolation and plurals from i18next (`{{count}}`), never string concatenation.

## 2. Date and time (BR13)

- The API sends and receives ISO 8601 UTC strings.
- Display through `@/utils/date`: `formatDate`, `formatDateTime` (user time zone, default `Asia/Ho_Chi_Minh`).
- Date-only deadlines are converted with `toDeadlineIso()` (23:59 of that day in the user's time zone).
- Overdue checks use `isOverdue()` (BR06).
- Never call `toLocaleString()`, `format()` from date-fns directly on API values, or build dates from strings manually.
