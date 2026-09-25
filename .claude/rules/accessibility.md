# Accessibility

- Use semantic elements: `button` for actions, `a`/`Link` for navigation, `nav`, `main`, `header`, headings in order (`h1` once per page).
- Never attach `onClick` to a `div` or `span`.
- Every input has a visible label - use the components in `components/form`, which also wire `aria-invalid` and `aria-describedby`.
- Icon-only buttons have a translated `aria-label`; decorative icons have `aria-hidden`.
- Everything works with the keyboard: logical tab order, visible focus ring (`focus-visible:ring`), `Esc` closes dialogs (Radix handles this).
- Drag and drop always has a non-pointer alternative (status menu, dnd-kit keyboard sensor).
- Do not convey information by color alone: statuses and priorities also show text or an icon.
- Text and UI colors meet AA contrast; only use theme tokens (already checked).
- Loading and live updates use `role="status"` / `aria-live="polite"`; errors use `role="alert"`.
- `eslint-plugin-jsx-a11y` must report no errors.
