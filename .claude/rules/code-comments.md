# Code Comments and File Headers

## 1. Language

All comments, identifiers and log messages are written in **English**. User-facing text never appears in code; it lives in `src/locales/{vi,en}/*.json`.

## 2. Standard file header

Every hand-written `.ts`, `.tsx` and `.css` file under `src/` starts with this header, **before the imports**, followed by one blank line:

```ts
/**
 * @file One-sentence summary of what this file is responsible for.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { useState } from 'react'
```

| Tag         | Meaning                            | Rule                                                                                                                                                                                           |
| ----------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@file`     | What the file does                 | One sentence ending with a period; responsibility, not implementation. Mention requirement codes when relevant (`Login page (UC01).`)                                                          |
| `@author`   | Developer who created the file     | Value of `git config user.name` (team display name). One tag per person; the original author stays first. Add another `@author` line only when someone rewrites a significant part of the file |
| `@version`  | Version of this file               | Semantic versioning, starts at `1.0.0` (see section 3)                                                                                                                                         |
| `@since`    | Creation date                      | `yyyy-MM-dd`, **never changes** after creation                                                                                                                                                 |
| `@modified` | Date of the last meaningful change | `yyyy-MM-dd`, updated together with `@version`                                                                                                                                                 |

Exempt from the header:

- generated code: `src/api/generated/**`, `src/components/ui/**` and `src/lib/utils.ts` (shadcn CLI);
- barrel files that only re-export (`index.ts`) - a one-line `//` comment is enough when they define a public API;
- test files (`*.test.ts(x)`) - optional;
- tool configuration at the project root (`vite.config.ts`, `eslint.config.js`, `orval.config.ts`...) and JSON files.

## 3. Version and date update rules

Update `@version` and `@modified` in the **same commit** as the change:

| Change                                                                                          | Bump  | Example               |
| ----------------------------------------------------------------------------------------------- | ----- | --------------------- |
| Breaking change to what the file exports (renamed/removed export, changed props or return type) | MAJOR | `1.4.2 -> 2.0.0`      |
| New backward-compatible behaviour (new export, new optional prop, new UI state)                 | MINOR | `1.4.2 -> 1.5.0`      |
| Bug fix, refactor, style tweak without API change                                               | PATCH | `1.4.2 -> 1.4.3`      |
| Formatting only, import sorting, comment typo                                                   | none  | keep version and date |

- `@since` never changes. Do not keep a change log inside the file - Git history is the change log.
- When **Claude or another AI assistant** writes code, the author is the developer who requested the change (from `git config user.name`), never "Claude". New files get today's date for both `@since` and `@modified`.

## 4. JSDoc for exports

- Add a JSDoc block on exported functions, hooks and components when the name and types do not fully explain behaviour, side effects or the business rule involved: `/** BR06: overdue when a due date exists, has passed, and the task is not closed. */`
- Document non-obvious props inline in the props interface: `/** Right-aligned actions (Create, Export...) */`.
- Do not write JSDoc that repeats the name or the types (`/** The title. */`).

## 5. Inline comments

- Explain **why**, not what. If a comment explains what the code does, rename or extract instead.
- Put the comment on the line above the code; keep it short.
- Task markers reference a feature code and are actionable:
  - `// TODO(F05.08): add calendar view`
  - `// FIXME(BR13): due date shifts by one day for UTC-negative zones`
- Never commit commented-out code, `console.log`, or `eslint-disable` without a reason comment on the same line.
- Keep comments true: update or delete them when the code changes.
