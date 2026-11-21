# Gradient Maker – Setup Guide for Antigravity IDE

> Everything you need to go from an empty computer to a working, deployed project skeleton, ready for Phase 1 of the build blueprint. October 2026.

## Table of contents

1. [The big picture](#1-the-big-picture)
2. [Prerequisites](#2-prerequisites)
3. [Install and configure Antigravity](#3-install-and-configure-antigravity)
4. [Create the workspace](#4-create-the-workspace)
5. [Put the blueprint and rules inside the project](#5-put-the-blueprint-and-rules-inside-the-project)
6. [Option A – Agent-driven setup (recommended)](#6-option-a--agent-driven-setup-recommended)
7. [Option B – Manual setup commands](#7-option-b--manual-setup-commands)
8. [Target folder structure](#8-target-folder-structure)
9. [Verify the setup](#9-verify-the-setup)
10. [Git and GitHub](#10-git-and-github)
11. [Deploy (free)](#11-deploy-free)
12. [Setup completion checklist](#12-setup-completion-checklist)
13. [Daily workflow inside Antigravity](#13-daily-workflow-inside-antigravity)
14. [Troubleshooting](#14-troubleshooting)
15. [What comes next](#15-what-comes-next)

---

## 1. The big picture

You have two ways to do setup. **Use Option A (agent-driven)** and keep **Option B (manual commands)** as your fallback or as a way to verify what the agent did.

| Step | What happens | Who does it |
| --- | --- | --- |
| 1 | Install Node.js, Git, and Antigravity | You |
| 2 | Create an empty folder and open it in Antigravity | You |
| 3 | Save the blueprint and AI rules into the project | You (or the agent) |
| 4 | Scaffold the app, install libraries, configure tooling | Agent (Option A) or you (Option B) |
| 5 | Push to GitHub and deploy | You, with the agent's help |
| 6 | Verify with the checklist in Section 12 | You |

---

## 2. Prerequisites

### 2.1 Accounts you need

- **Google account** – to sign in to Antigravity.
- **GitHub account** – to store the code and connect hosting.
- **Vercel, Netlify or Cloudflare account** – any one, for free hosting (sign up with your GitHub account).

### 2.2 Software to install

| Software | Version | Where to get it |
| --- | --- | --- |
| Node.js | Current **LTS** (v22 or newer LTS) | nodejs.org (includes npm) |
| Git | Latest | git-scm.com |
| Antigravity IDE | Latest | Google's Antigravity download page |
| A modern browser | Chrome recommended (for testing and the agent's browser tool) | google.com/chrome |

**Windows tips:** use a 64-bit Windows 10 or 11, and install Antigravity on your main drive (usually C:) to avoid permission problems when the agent runs terminal commands. During Git installation, accept the defaults. If you want a smoother terminal experience, use Git Bash or PowerShell.

**macOS / Linux tips:** Node can also be installed with `nvm` if you prefer to switch versions easily.

### 2.3 Verify the install

Open any terminal and run:

```bash
node -v      # should print v22.x or higher
npm -v       # should print 10.x or higher
git --version
```

If any command says "not found", close and reopen the terminal (or restart the computer) and try again.

### 2.4 Tell Git who you are (one time)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 3. Install and configure Antigravity

1. Download and install Antigravity for your operating system, then launch it.
2. In onboarding, choose **Start fresh**, pick a theme, and sign in with your Google account.
3. When asked for the **development mode**, pick **Agent-Assisted Development**. It keeps you in the loop while the agent does the work, which is ideal for a project you are learning from.
4. Set the **terminal execution policy** so the agent may run commands (you can keep a review step so you approve each one at first). Set the **review policy** so you can inspect plans and code changes before they are applied.
5. Know the two main views:
   - **Editor view** – a familiar code editor with an agent side panel. Use it to read and tweak files.
   - **Manager view** – the control center where you create tasks ("missions") for agents and watch their plans, diffs and screenshots.

> Names of menus and policies may change between Antigravity updates. If a label differs from this guide, choose the option that means the same thing.

---

## 4. Create the workspace

1. On your computer, create an empty folder named `gradient-maker` in a simple path (for example `C:\projects\gradient-maker` or `~/projects/gradient-maker`). Avoid folders synced by OneDrive or iCloud, because they can slow npm and cause file-lock errors.
2. In Antigravity choose **File → Open Folder** and select `gradient-maker`.
3. Open the integrated terminal (View → Terminal) and confirm you are inside the folder with `pwd` (macOS/Linux) or `cd` (Windows).

---

## 5. Put the blueprint and rules inside the project

The agent works best when the plan lives in the repository, so you can just say "read the blueprint and do Phase N".

1. Export your **Gradient Maker – Vibe-Coding Build Blueprint** doc as Markdown.
2. Create a `docs` folder and save it as `docs/BLUEPRINT.md`.
3. Create `docs/SETUP.md` and paste this setup guide into it (optional but handy).
4. Create the file `.agents/CONTEXT.md` with the rules below. Antigravity guides use a persistent context file like this for project standards; also mention it by name in your first prompt so the agent definitely reads it.

```markdown
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
```

---

## 6. Option A – Agent-driven setup (recommended)

Open the **Manager view**, create a new task in the `gradient-maker` workspace, and paste the prompt below. Review the plan the agent shows before approving.

> Read .agents/CONTEXT.md and docs/BLUEPRINT.md. Then do **Phase 0 only**. Scaffold a Vite + React + TypeScript project **in the current folder** (not in a sub-folder). Install: tailwindcss and @tailwindcss/vite (Tailwind v4), shadcn/ui, zustand, zundo, culori and @types/culori, zod, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, react-colorful, lz-string, gifenc, and as dev tools vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @playwright/test, prettier, eslint-config-prettier, @types/node. Configure the `@` path alias, Tailwind v4 in the Vite config, Vitest with jsdom, and Playwright with the dev server. Enable TypeScript strict mode. Add npm scripts: dev, build, test, test:watch, lint, format, typecheck, e2e. Create the folder structure from section 4.2 of the blueprint with a placeholder file in each folder, and a smoke test. Do not build any features. Initialize Git and make a first commit. When done, show the folder tree and the output of `npm run build`, `npm run test` and `npm run lint`.

If the agent asks "the folder is not empty", tell it the folder only contains `docs/` and `.agents/` and to keep them.

When it finishes, jump to **Section 9 (Verify)**.

---

## 7. Option B – Manual setup commands

Use these if the agent gets stuck, or if you want to understand each step. Run them in the terminal inside `gradient-maker`.

### 7.1 Create the Vite app in the current folder

```bash
npm create vite@latest . -- --template react-ts
# If asked about a non-empty folder, choose to ignore existing files and continue.
npm install
```

### 7.2 Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/vite
```

Replace everything in `src/index.css` with:

```css
@import "tailwindcss";
```

Make sure `src/main.tsx` imports `./index.css`, and delete the default `App.css` and demo styles.

### 7.3 Path alias `@`

```bash
npm install -D @types/node
```

In **both** `tsconfig.json` and `tsconfig.app.json`, add inside `compilerOptions`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

In `tsconfig.app.json` also make sure `"strict": true` is present and add `"types": ["vitest/globals"]`.

Then replace `vite.config.ts` with:

```ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
```

### 7.4 shadcn/ui

```bash
npx shadcn@latest init
```

Answer the prompts (the default "neutral" base color is fine). Then add the components the app will need:

```bash
npx shadcn@latest add button slider tabs accordion popover dialog tooltip input select switch toggle-group sonner dropdown-menu separator scroll-area
```

### 7.5 App libraries

```bash
npm install zustand zundo culori zod react-colorful lz-string gifenc @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @types/culori
```

### 7.6 Testing and formatting tools

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test prettier eslint-config-prettier
npx playwright install
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:5173" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
```

Create `e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("app loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
```

Create `.prettierrc`:

```json
{ "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 100 }
```

Add `"prettier"` as the last entry of the `extends` list in your ESLint config (or the matching flat-config line for `eslint-config-prettier`) so the two tools do not fight.

### 7.7 npm scripts

In `package.json`, make the `scripts` section contain:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write .",
  "typecheck": "tsc -b",
  "test": "vitest run",
  "test:watch": "vitest",
  "e2e": "playwright test"
}
```

### 7.8 Folder structure

On macOS, Linux or Git Bash:

```bash
mkdir -p src/core src/color src/engine/css src/engine/canvas src/engine/webgl src/engine/noise \
  src/export src/ui/panels src/ui/controls src/presets src/lib src/test e2e docs
```

On Windows PowerShell, ask the agent to create these folders, or create them in the Explorer panel. Add an empty `.gitkeep` file inside each so Git tracks them.

### 7.9 Smoke test

Create `src/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("setup", () => {
  it("runs tests", () => {
    expect(1 + 1).toBe(2);
  });
});
```

---

## 8. Target folder structure

```
gradient-maker/
  .agents/CONTEXT.md
  docs/BLUEPRINT.md, SETUP.md
  e2e/smoke.spec.ts
  public/
  src/
    core/        types, Zod schemas, defaults, store
    color/       convert, interpolate, stops
    engine/
      css/  canvas/  webgl/  noise/
    export/      css, tailwind, svg, raster, json, animation
    ui/          shell, preview, panels/, controls/
    presets/
    lib/         share, utils
    test/setup.ts
    App.tsx  main.tsx  index.css
  index.html
  package.json
  playwright.config.ts
  vite.config.ts
  tsconfig.json  tsconfig.app.json  tsconfig.node.json
  .prettierrc  .gitignore
```

---

## 9. Verify the setup

Run each command and confirm it succeeds:

```bash
npm run dev         # opens http://localhost:5173 and shows the starter page
npm run build       # builds to dist/ with no errors
npm run typecheck   # no TypeScript errors
npm run lint        # no ESLint errors
npm run test        # smoke test passes
npm run e2e         # Playwright smoke test passes
```

To prove Tailwind works, temporarily put `<h1 className="text-3xl font-bold underline">Gradient Maker</h1>` in `App.tsx`. It should appear large, bold and underlined. Then replace it with a simple placeholder heading.

To prove shadcn works, import `Button` from `@/components/ui/button` in `App.tsx` and render it.

---

## 10. Git and GitHub

```bash
git init                      # skip if the agent already did it
git add .
git commit -m "Phase 0: project setup"
```

1. On GitHub, create a new **empty** repository named `gradient-maker` (no README, no .gitignore).
2. Connect and push (replace the URL with yours):

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/gradient-maker.git
git push -u origin main
```

3. Check that `.gitignore` includes `node_modules`, `dist`, `.env*` and `playwright-report`.

**Branching habit:** for each phase create a branch (`git checkout -b phase-1-data-model`), merge into `main` when the acceptance checks pass, and push. If the agent breaks something, you can switch back to `main`.

---

## 11. Deploy (free)

Pick **one** host. All three auto-detect Vite.

| Host | Steps |
| --- | --- |
| **Vercel** | Add New → Project → import the GitHub repo → Framework: Vite → Deploy |
| **Netlify** | Add new site → Import from Git → build command `npm run build`, publish directory `dist` |
| **Cloudflare Pages** | Create application → Pages → connect Git → build command `npm run build`, output `dist` |

From then on, every push to `main` redeploys automatically, and every branch gets a preview URL you can open on your phone to test the mobile layout.

No environment variables are needed, because the app is fully client-side.

---

## 12. Setup completion checklist

- [ ] Node, npm and Git installed and verified
- [ ] Antigravity installed, signed in, policies set
- [ ] `gradient-maker` folder opened as the workspace
- [ ] `docs/BLUEPRINT.md` and `.agents/CONTEXT.md` saved in the project
- [ ] Vite + React + TypeScript app created, strict mode on
- [ ] Tailwind v4, shadcn/ui and all libraries installed
- [ ] Folder structure created
- [ ] `dev`, `build`, `typecheck`, `lint`, `test` and `e2e` all pass
- [ ] Code pushed to GitHub
- [ ] Live URL working on a free host

---

## 13. Daily workflow inside Antigravity

For every phase from 1 to 12, create a **new task** in the Manager view and use this template:

> Read .agents/CONTEXT.md and docs/BLUEPRINT.md. Do **Phase N only**: \[phase name\]. First show me a short plan and the list of files you will create or change. After I approve, build it, write the tests, and run `npm run typecheck`, `npm run lint`, `npm run test` and `npm run build`. Then use the browser to open the app and check each item under "Done when". End with a summary: what was built, what was skipped, known bugs.

**Good habits**

- Review the agent's plan and diffs before approving large changes.
- Keep one clear goal per task; do not mix phases.
- Commit after each phase passes its checks.
- When something looks wrong, give the agent the exact error message or a screenshot rather than a vague description.
- If the agent starts rewriting unrelated files, stop it and say: "Only change files needed for this phase. Revert everything else."
- For a subtle bug, ask for an explanation of the cause **before** asking for a fix.

---

## 14. Troubleshooting

| Problem | Fix |
| --- | --- |
| `node` or `npm` "not recognized" | Reopen the terminal or restart; reinstall Node LTS and tick "add to PATH" |
| `npm create vite` complains the folder is not empty | Choose "Ignore files and continue", or let the agent scaffold in a temporary folder and move the files up |
| Import `@/...` shows a red error | Check the `paths` entry in **both** `tsconfig.json` and `tsconfig.app.json`, and the alias in `vite.config.ts`; restart the TS server |
| Tailwind classes have no effect | `src/index.css` must contain `@import "tailwindcss";`, `main.tsx` must import it, and `tailwindcss()` must be in the Vite plugins |
| shadcn init cannot find the alias | Fix the `@` alias first (section 7.3), then run `npx shadcn@latest init` again |
| Vitest picks up Playwright files | Keep `exclude: ["e2e/**"]` in the Vitest config |
| `npx playwright install` is slow or fails | Retry on a stable connection; run `npx playwright install chromium` to install only Chrome |
| `Port 5173 already in use` | Close the other dev server or run `npm run dev -- --port 5174` |
| Agent terminal commands fail with permissions | Move the project out of OneDrive/iCloud folders and off protected paths; check the terminal policy |
| Agent installs a library you did not approve | Tell it to remove it (`npm uninstall NAME`) and point to rule 8 in `.agents/CONTEXT.md` |
| Deploy builds locally but fails online | Check the Node version setting on the host (use 22), and that `npm run build` has no TypeScript errors |

Setup commands for tools like shadcn/ui and Playwright can change slightly over time. If a command fails with a deprecation message, follow the message or ask the agent to check the tool's official docs.

---

## 15. What comes next

With setup done, start **Phase 1 – Data model, store, undo/redo** using the task template in Section 13. Each later phase follows the same loop: plan, approve, build, test, verify in the browser, commit, deploy.