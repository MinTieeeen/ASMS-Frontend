# Styling and Themeư

## 1. Tailwind only

- Style with Tailwind utility classes. No per-component CSS files, no CSS modules, no inline `style` (except truly dynamic values such as drag positions).
- Merge conditional classes with `cn()` from `@/lib/utils`. Components with variants use `cva`.
- `styles/globals.css` is the single CSS entry point; do not add other global stylesheets.

## 2. Design tokens

- Colors come **only** from tokens defined in `styles/theme.css`: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-destructive`, `bg-success`, `bg-warning`, `bg-info`, `border-border`, `chart-1..5`, `sidebar-*`...
- **Hard-coded colors are forbidden** (`#fff`, `rgb(...)`, `bg-blue-500`, `text-gray-600`).
- Need a new color? Add the variable in both `:root` and `.dark`, map it in `@theme inline`, and check WCAG AA contrast.
- Radius uses `rounded-sm/md/lg/xl` (derived from `--radius`); fonts use `font-sans` / `font-heading`.

## 3. Dark mode

- Themes are switched by `next-themes` (class strategy). Because components use tokens, dark mode works automatically.
- Use the `dark:` variant only when a token cannot express the difference.
- Check every new screen in both light and dark themes.

## 4. Responsive design

- Mobile-first, from 360 px: write base classes for mobile, then add `sm:`, `md:`, `lg:`, `xl:`.
- The personal dashboard and task status updates must be fully usable on phones.
- Avoid fixed widths; use flex/grid, `min-w-0` for truncation, `max-w-*` for readable content.

## 5. shadcn/ui

- Add components with `npx shadcn@latest add <name>`, then run `npm run lint:fix && npm run format`.
- Edit files in `components/ui` only to change the look app-wide. For a single use, pass `className` or wrap the primitive in `components/common`.
- Icons come from `lucide-react`; decorative icons get `aria-hidden`.
