# Project context – Gradient Maker

Read docs/BLUEPRINT.md before every task. Work on ONE phase at a time.

## Stack
React + TypeScript (strict) + Vite, Tailwind CSS v4, shadcn/ui, Zustand + zundo,
culori, Zod, dnd-kit, react-colorful, lz-string, Vitest, Playwright.

## Rules
1. TypeScript strict; no `any`.
2. Gradient/color/noise/export math lives in src/color, src/engine, src/export – never inside React components.
3. Single source of truth: one serializable `Project` object in the Zustand store.
4. Renderers are pure functions of Project (plus time for animation).
5. Changing the Project schema requires updating Zod schemas, defaults, tests and the JSON version migration.
6. Heavy previews are throttled; undo history commits on pointer release only.
7. Files stay under ~300 lines; split when larger.
8. Do not add new libraries without asking me.
9. Every function in color/, engine/, export/ has a unit test.
10. After each phase: list what was built, what was skipped, and any known bugs.

## Commands
npm run dev | build | test | lint | typecheck | e2e
