# Workflow, Commits and Definition of Done

## 1. Working process for a screen

1. Read the related use case, business rules and permission matrix. If anything is unclear, **ask** before coding.
2. If a new endpoint is needed, agree on it with the backend and run `npm run api:gen`.
3. Build inside-out: types / schema -> hooks -> components -> page -> route (`app/router`) + menu (`nav-items.ts`) + translations (vi and en).
4. Install new packages only when the feature needs them and they are listed in requirement section 9.2; otherwise justify the library in the PR.
5. Keep changes focused: no unrelated refactors or reformatting in a feature commit.

## 2. Branches

`main` is always releasable. Use short-lived branches: `feature/<code>-<short-name>` (`feature/F05.03-task-board`), `fix/<short-name>`, `chore/<short-name>`.

## 3. Commit messages (Conventional Commits, English)

```
<type>(<feature>): <imperative summary> [(Fxx.yy|UCxx|BRxx)]

<optional body: why the change was needed>
```

- Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
- Scope: the feature (`tasks`, `groups`...) or `ui` / `layout` / `api` / `i18n`.
- Examples:
  - `feat(tasks): drag and drop task board (F05.03)`
  - `fix(auth): refresh token only once for parallel requests`
  - `style(ui): align dark mode colors of badges`

## 4. Definition of done

- [ ] Behaviour matches the specification and the permission matrix
- [ ] File headers added / updated (`@version`, `@modified`) per code-comments.md
- [ ] No hard-coded text, colors or paths; vi and en translations added
- [ ] Loading / error / empty states handled
- [ ] Works at 360 px and on desktop, in light and dark themes, with the keyboard
- [ ] Tests written; `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass
- [ ] No `console.log`, commented-out code, or TODOs without a feature code

## 5. Checklist for a new screen

- [ ] Page uses `export default`; route declared with `lazy` and path added to `ROUTES`
- [ ] Data comes from Orval hooks; mutations invalidate the right queries
- [ ] Actions hidden or disabled according to the group role
- [ ] Form fields use `components/form`; Zod messages are i18n keys
- [ ] Menu entry added to `nav-items.ts` when the page is top-level
