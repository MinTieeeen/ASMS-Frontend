# Testing

## 1. Tools

- Vitest (globals enabled) + Testing Library + `@testing-library/user-event` + jsdom.
- Render with `renderWithProviders` from `@/test/render` (QueryClient without retries + MemoryRouter).
- Mock the network with **MSW** handlers; never mock `axios` or the generated hooks.
- End-to-end flows (create group, drag a task, submit a deliverable) are covered with Playwright later.

## 2. What must be tested

- Every function in `utils/` and every Zod schema.
- Hooks containing logic (filters, permissions, derived data).
- Components with conditional behaviour, especially permission-based show/hide and form validation.
- A bug fix comes with a test that fails before the fix.

## 3. How to write tests

- Test behaviour as a user sees it: query by role, label or text (`getByRole('button', { name: ... })`); avoid `getByTestId` unless nothing else works.
- Interact with `userEvent`, then assert with `findBy*` for async results.
- Describe blocks name the unit; test names state the behaviour: `it('shows translated validation errors when submitting an empty form')`.
- Arrange - Act - Assert, one behaviour per test, no dependency on test order or on the current date (use `vi.useFakeTimers()` / `vi.setSystemTime()`).
- Test files sit next to the file they test: `LoginPage.test.tsx`.
