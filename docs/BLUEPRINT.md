# Gradient Maker – Vibe-Coding Build Blueprint

> End-to-end, phase-by-phase plan for building the gradient maker website with an AI coding assistant.
> Based on the "Gradient Types & Settings" specification. October 2026.

## Table of contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Product summary](#2-product-summary)
3. [Recommended tech stack](#3-recommended-tech-stack)
4. [Architecture](#4-architecture)
5. [Data model](#5-data-model)
6. [Rendering and export map](#6-rendering-and-export-map)
7. [Build phases (0–12)](#7-build-phases)
8. [Rules for your AI assistant](#8-rules-to-give-your-ai-assistant-paste-once)
9. [Master kickoff prompt](#9-master-kickoff-prompt)
10. [Risks and decisions to confirm](#10-risks-and-decisions-to-confirm)
11. [Final launch checklist](#11-final-launch-checklist)

---

## 1. How to use this document

This document is written so an AI coding tool (Claude Code, Cursor, Windsurf, Bolt, Lovable, etc.) can build the project one phase at a time with little ambiguity.

1. Give the AI **Sections 2–6** once (stack, architecture, data model, rendering map) as permanent context.
2. Then feed it **one phase at a time** from Section 7. Never ask for two phases in one prompt.
3. After each phase, run the acceptance checks, commit to Git, and only then move on.
4. If something breaks, fix it inside the same phase before continuing.

---

## 2. Product summary

A browser-based gradient maker with **15 gradient types**, a reusable **noise and texture effect system**, **global settings**, and **multi-format export**.

| Group | Gradient types |
| --- | --- |
| Basic (1–7) | Linear, Radial, Conic/Angular, Diamond, Repeating Linear, Repeating Radial, Repeating Conic |
| Advanced (8–15) | Mesh, Freeform, Shape Blur, Multiple/Layered, Reflected, Aurora, Holographic/Iridescent, Grainy |

**Global settings**

- Color picker (HEX, RGB, HSL, OKLCH)
- Add / remove / reorder color stops
- Stop position 0–100%
- Per-stop and overall opacity
- Interpolation: sRGB, linear RGB, HSL, OKLab
- Background color
- Blend modes
- Blur and glow
- Canvas width / height
- Rotation and positioning
- Live preview
- Randomize and reset
- Undo and redo

**Export**

- CSS (copy, variables, layered)
- SVG
- PNG (transparent or solid)
- JPEG / WebP
- JSON (save and import projects)
- Tailwind CSS snippets
- Custom resolution with scale factor
- Animation (GIF or WebM)

**Key rules from the original notes**

- Noise and texture is a **reusable effect system**, not a separate gradient engine.
- Native CSS covers linear, radial, conic and their repeating variants.
- Mesh, freeform, diamond, aurora and some advanced effects need Canvas, SVG, WebGL or layered approximations.
- Basic controls are visible by default; advanced controls live in collapsible panels.

---

## 3. Recommended tech stack

The app has no accounts and no database requirement, so it is a **fully client-side single-page app**. That is the simplest thing for an AI to build correctly, and it hosts for free.

| Layer | Choice | Why it fits this spec |
| --- | --- | --- |
| Framework | **React + TypeScript + Vite** | Fast dev loop, huge AI training coverage, types prevent most AI mistakes. No SSR needed. |
| Styling | **Tailwind CSS v4** | Quick, consistent UI; also lets you test your own Tailwind export. |
| UI primitives | **shadcn/ui (Radix)** | Accessible sliders, tabs, accordions (collapsible advanced panels), popovers, dialogs. |
| State | **Zustand** + **zundo** | One store for the whole project; zundo gives undo/redo with almost no code. |
| Color math | **culori** | Parses and converts HEX, RGB, HSL, OKLCH, OKLab; handles interpolation and gamut. |
| Color picker | **react-colorful** + custom OKLCH sliders | Lightweight; extend with your own channel inputs. |
| Drag reorder | **dnd-kit** | Reordering color stops and layers. |
| Native-feel rendering | **CSS gradients** | Types 1–7 (and parts of 11, 12, 14) render and export natively. |
| Advanced rendering | **Canvas 2D** first, **WebGL2 fragment shaders** for heavy types | Mesh, freeform, diamond, aurora, shape blur and noise need per-pixel control. |
| Noise | Seeded PRNG (mulberry32) + simplex/value noise in code | Reproducible by seed, as the spec requires. |
| Validation | **Zod** | Validates imported JSON projects. |
| Export | Native Canvas APIs, **gifenc** (GIF), **MediaRecorder** (WebM), **lz-string** (share links) | Small, no server. |
| Testing | **Vitest** + **Playwright** | Unit tests for math and export strings; browser tests for flows. |
| Hosting | **Vercel, Netlify or Cloudflare Pages** | Free static hosting, deploy from Git. |

**Why not Next.js or a backend?** Nothing in the spec needs server rendering, auth or storage. Add a backend later only if you want accounts, cloud-saved projects or a public preset gallery.

**Why Canvas 2D before WebGL?** Canvas is far easier for an AI to get right, and exports (PNG/JPEG/WebP) come almost free. Use WebGL only for the types where Canvas is too slow at live-preview speed (mesh, aurora, animated noise). The renderer interface stays the same, so you can swap one for the other per type.

---

## 4. Architecture

### 4.1 Three rendering tiers

| Tier | Used for | Output |
| --- | --- | --- |
| **A – CSS** | Linear, Radial, Conic, all three Repeating types, Reflected, most of Layered and Holographic | A CSS `background` string; exact copy-paste export |
| **B – Canvas 2D** | Diamond, Shape Blur, Grainy, Freeform, Mesh (initial version), noise overlay | Pixels; exports to PNG/JPEG/WebP; CSS export is an approximation or a data-URI |
| **C – WebGL2** | Mesh (high quality), Aurora, animated noise, animated exports | Pixels from a fragment shader; same export path as Tier B |

Every gradient type implements the same interface:

```ts
interface GradientRenderer<T extends GradientConfig> {
  type: T['type'];
  tier: 'css' | 'canvas' | 'webgl';
  toCSS?(cfg: T, project: Project): string | null;   // null = not expressible in CSS
  toSVG?(cfg: T, project: Project): string | null;   // null = not expressible in SVG
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: T,
    project: Project,
    w: number,
    h: number,
    t?: number
  ): void;
}
```

### 4.2 Folder structure

```
src/
  core/         types.ts, schema.ts (Zod), defaults.ts, store.ts (Zustand + zundo)
  color/        convert.ts, interpolate.ts, stops.ts
  engine/
    css/        linear.ts, radial.ts, conic.ts, repeating.ts, reflected.ts ...
    canvas/     diamond.ts, mesh.ts, freeform.ts, shapeBlur.ts, aurora.ts ...
    webgl/      mesh.frag, aurora.frag, renderer.ts
    noise/      prng.ts, generators.ts, applyNoise.ts
    registry.ts (maps type -> renderer)
  export/       css.ts, tailwind.ts, svg.ts, raster.ts, json.ts, animation.ts
  ui/           Shell, Preview, TypePicker, panels/, controls/
  presets/      presets.ts
  lib/          share.ts (URL state), utils.ts
```

### 4.3 Core principles for the AI

- **One source of truth:** the whole app is a single serializable `Project` object. The UI edits it; renderers read it; export serializes it.
- **Renderers are pure functions** of `Project` (plus time for animation). No renderer reads from the DOM.
- **Noise is an effect, not a gradient.** It lives on `project.effects.noise` and is applied after any gradient type that supports it.
- **Graceful export:** if a format cannot represent a type, the export UI says so and offers the closest alternative (usually PNG, or SVG with an embedded raster).

---

## 5. Data model

```ts
type GradientType =
  | 'linear' | 'radial' | 'conic' | 'diamond'
  | 'repeating-linear' | 'repeating-radial' | 'repeating-conic'
  | 'mesh' | 'freeform' | 'shape-blur' | 'layered'
  | 'reflected' | 'aurora' | 'holographic' | 'grainy';

interface ColorStop {
  id: string;
  color: string;     // any CSS color
  position: number;  // 0-100
  opacity: number;   // 0-1
}

interface Project {
  version: 1;
  canvas: { width: number; height: number; background: string };
  gradient: GradientConfig;   // discriminated union on `type`
  global: {
    interpolation: 'srgb' | 'srgb-linear' | 'hsl' | 'oklab';
    opacity: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
    blendMode: BlendMode;
    blur: number;
    glow: { amount: number; color: string };
  };
  effects: { noise: NoiseConfig };
}

interface NoiseConfig {
  enabled: boolean;
  type: 'gaussian' | 'uniform' | 'monochromatic' | 'colored-rgb';
  intensity: number;
  grainSize: 'fine' | 'small' | 'medium' | 'coarse';
  scale: number;
  opacity: number;
  distribution: 'uniform' | 'gaussian';
  color: 'black' | 'white' | 'monochrome' | 'colored';
  blendMode: 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen';
  density: 'sparse' | 'balanced' | 'dense';
  seed: number;
  textureStyle: 'film-grain' | 'analog' | 'digital' | 'paper';
  animated: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast' | number;
  loopDuration: number;
  seamlessLoop: boolean;
  preserveTransparency: boolean;
  blending: 'overlay' | 'underlay' | 'embedded';
}
```

**Per-type settings (`GradientConfig` variants), taken directly from the specification table:**

| Type | Settings the AI must implement |
| --- | --- |
| Linear | stops, angle, positions, opacity |
| Radial | stops, centerX/Y, circle or ellipse, size |
| Conic | stops, centerX/Y, start angle |
| Diamond | stops, centerX/Y, width, height, rotation, falloff |
| Repeating Linear | stops, angle, stripe width, repeat interval |
| Repeating Radial | stops, centerX/Y, shape, ring size, repeat interval |
| Repeating Conic | stops, centerX/Y, start angle, segment size |
| Mesh | rows, columns, node positions, node colors, interpolation, smoothness |
| Freeform | points, positions, colors, influence radius, smoothness |
| Shape Blur | shape type, position, size, color, blur radius, opacity |
| Layered | list of layers (any type), position, size, opacity, blend mode, order |
| Reflected | stops, angle, center, symmetry, positions |
| Aurora | ribbon count, colors, wave amplitude, flow direction, blur, glow, opacity |
| Holographic | hue range, angle, stops, blend mode, highlight intensity |
| Grainy | base gradient (any type), plus noise settings |

---

## 6. Rendering and export map

| # | Type | Preview tier | CSS export | SVG export | Raster export |
| --- | --- | --- | --- | --- | --- |
| 1 | Linear | CSS | Exact | Exact | Yes |
| 2 | Radial | CSS | Exact | Exact | Yes |
| 3 | Conic | CSS | Exact | Approximate (sliced paths) | Yes |
| 4 | Diamond | Canvas | Approximation (layered) | Embedded raster | Yes |
| 5–7 | Repeating | CSS | Exact | Linear/radial via `spreadMethod`; conic approximate | Yes |
| 8 | Mesh | Canvas, then WebGL | No (offer PNG or inline SVG) | Embedded raster | Yes |
| 9 | Freeform | Canvas | Approximation (stacked radials) | Blurred circles via SVG filter | Yes |
| 10 | Shape Blur | Canvas | Approximation (blurred layers) | SVG with `feGaussianBlur` | Yes |
| 11 | Layered | Mixed | Comma-separated layers + blend modes | Grouped layers | Yes |
| 12 | Reflected | CSS | Exact (mirrored stops) | Exact (`spreadMethod` reflect) | Yes |
| 13 | Aurora | Canvas or WebGL | No | Embedded raster | Yes |
| 14 | Holographic | CSS layers | Exact (stacked gradients + blend) | Approximate | Yes |
| 15 | Grainy | CSS + noise | Gradient plus noise overlay (SVG data-URI) | `feTurbulence` filter | Yes (true noise) |

**Interpolation note:** modern CSS can interpolate in other color spaces directly (for example `linear-gradient(in oklab, ...)`). Use that for the CSS tier. For browsers or exports that lack it, pre-sample extra intermediate stops with culori.

---

## 7. Build phases

Each phase has a goal, tasks, a "done when" checklist and a starter prompt. Complete them in order.

### Phase 0 – Project setup and tooling

**Goal:** an empty app that builds, lints and deploys.

**Tasks**

- Scaffold with `npm create vite@latest gradient-maker -- --template react-ts`.
- Install Tailwind v4 (Vite plugin), shadcn/ui, Zustand, zundo, culori, Zod, dnd-kit, react-colorful, lz-string, Vitest, Playwright.
- Enable TypeScript `strict`, ESLint, Prettier. Create the folder structure from 4.2.
- Initialize Git and push to GitHub; connect to Vercel or Netlify.

**Done when:** `npm run dev`, `npm run build` and `npm run test` all pass and a placeholder page is live on a public URL.

**Starter prompt**

> Set up the project exactly as Phase 0 describes. Do not build any features yet. Show me the final folder tree.

### Phase 1 – Data model, store, undo/redo

**Goal:** the brain of the app, with no UI yet.

**Tasks**

- Implement all types from Section 5 in `core/types.ts` and matching Zod schemas.
- Write `defaults.ts` with a sensible default config for every one of the 15 types.
- Build the Zustand store with actions: `setType`, `updateGradient`, `addStop`, `removeStop`, `moveStop`, `updateGlobal`, `updateNoise`, `reset`, `randomize`, `loadProject`.
- Add zundo for `undo` and `redo`. Slider drags must create **one** history entry (commit on pointer release, not on every tick).
- Unit-test every action and the undo/redo behavior.

**Done when:** tests prove that changing a value, undoing and redoing returns the exact previous states, and that invalid JSON is rejected by Zod.

**Starter prompt**

> Implement Phase 1: types, Zod schemas, defaults for all 15 gradient types, the Zustand store with the listed actions, and undo/redo via zundo. Add unit tests. No UI.

### Phase 2 – App shell and layout

**Goal:** the screen structure from the "basics visible, advanced collapsible" rule.

**Tasks**

- Desktop: left sidebar (type picker + controls), large center preview, right sidebar or bottom sheet for export. Mobile: preview on top, controls in a bottom drawer.
- Type picker grouped as **Basic** and **Advanced**, showing a small live thumbnail per type.
- Control panels as accordions: *Colors*, *Type settings*, *Global*, *Noise & texture*, *Export*. Advanced sub-controls collapsed by default.
- Top bar: Undo, Redo, Randomize, Reset, Import, Export. Light and dark UI themes.
- Preview shows the canvas at the chosen aspect ratio with a checkerboard behind transparency.

**Done when:** the layout is responsive from 360px to 1920px wide and every panel opens and closes without layout jumps.

**Starter prompt**

> Implement Phase 2: the responsive app shell, grouped type picker with thumbnails, accordion control panels, top bar, and checkerboard preview frame. Panels can be empty placeholders.

### Phase 3 – Color system and stop editor

**Goal:** every color control from the Global Settings.

**Tasks**

- Color picker with tabs for **HEX, RGB, HSL, OKLCH**, each with numeric inputs; convert via culori; show a gamut warning when an OKLCH color falls outside sRGB.
- Stop editor: a gradient bar with draggable handles, click-to-add, delete, reorder (dnd-kit), numeric position input (0–100%), per-stop opacity.
- Overall gradient opacity and background color controls.
- Interpolation selector: sRGB, linear RGB, HSL, OKLab.

**Done when:** editing any stop updates the store, supports undo, and the picker never produces invalid colors.

**Starter prompt**

> Implement Phase 3: the multi-format color picker, the draggable stop editor, opacity and background controls, and the interpolation selector. All changes go through the store.

### Phase 4 – Basic gradients (types 1–7) with live preview

**Goal:** the seven native-CSS gradients working end to end.

**Tasks**

- Implement `toCSS` for Linear, Radial, Conic, Repeating Linear, Repeating Radial and Repeating Conic.
- Build each settings panel exactly as listed in Section 5 (angle dial, center X/Y pad, circle/ellipse toggle, size keyword or percent, stripe width and repeat interval, segment size).
- Preview renders from the CSS string; show the generated CSS in a read-only box.
- Add Diamond here as a **Canvas 2D** renderer: per pixel, `t = pow(|x'|/w + |y'|/h, falloff)` after applying center and rotation, then sample the stops.

**Done when:** all seven CSS types plus Diamond render, and the output matches what a hand-written CSS rule would produce.

**Starter prompt**

> Implement Phase 4: toCSS and settings panels for types 1–7, a read-only CSS output box, and a Canvas 2D Diamond renderer. Follow the settings table in Section 5.

### Phase 5 – Global settings

**Goal:** settings that apply to every gradient type.

**Tasks**

- Canvas width and height with aspect-ratio presets (1:1, 16:9, 4:3, 9:16, custom).
- Rotation, X/Y positioning, overall blend mode, blur, and glow (CSS `filter` for preview, Canvas `filter` for raster).
- **Randomize** (harmonious palettes: analogous, complementary, triadic, generated in OKLCH) and **Reset**.
- Keyboard shortcuts: Ctrl/Cmd+Z, Shift+Z, and R for randomize.

**Done when:** each global setting changes the preview identically in the CSS and Canvas tiers.

**Starter prompt**

> Implement Phase 5: canvas size and aspect presets, rotation, positioning, blend mode, blur, glow, randomize with OKLCH harmony rules, reset, and keyboard shortcuts. Verify CSS and Canvas tiers match.

### Phase 6 – Noise and texture effect system

**Goal:** one reusable effect panel usable by compatible types.

**Tasks**

- Build `engine/noise` with a seeded PRNG so the same seed always gives the same grain.
- Implement noise type (Gaussian, uniform, monochromatic, colored RGB), distribution, density, grain size (Fine/Small/Medium/Coarse as cell size), scale, intensity, opacity, color, blend mode, and texture styles (film grain, analog, digital, paper-like as parameter presets).
- Implement the three blending modes: **overlay** (on top), **underlay** (beneath the gradient), **embedded** (mixed into the stops before rendering).
- Preserve-transparency toggle: noise is masked by the gradient's alpha.
- For the CSS preview, render noise to a small tiling canvas and use it as a data-URI overlay with `mix-blend-mode`.
- Mark which types are compatible (all 15 by default; disable only where it makes no sense).

**Done when:** the same seed always gives identical output, every setting in the noise table is wired to the UI, and Type 15 (Grainy) works simply by enabling noise on a chosen base gradient.

**Starter prompt**

> Implement Phase 6: the seeded noise engine, all noise settings and texture presets, the three blending modes, the preserve-transparency toggle, and the noise panel. Grainy (type 15) should just be a base gradient with noise enabled.

### Phase 7 – Advanced gradients, part A (mostly CSS-composable)

**Goal:** Layered, Reflected, Holographic, Grainy.

**Tasks**

- **Layered (11):** a list of layers, each holding any gradient type with its own position, size, opacity and blend mode; drag to reorder; CSS export as comma-separated backgrounds with `background-blend-mode`.
- **Reflected (12):** mirror the stops around the center based on symmetry (none, horizontal, vertical, both); export as mirrored stops.
- **Holographic (14):** stacked conic and linear layers with hue range, angle, highlight intensity and a screen/overlay blend.
- **Grainy (15):** UI wrapper that picks a base gradient and turns on the noise system.

**Done when:** each renders correctly in the preview and produces a working CSS string.

**Starter prompt**

> Implement Phase 7: Layered, Reflected, Holographic and Grainy gradients with their settings panels and CSS export. Reuse existing renderers; do not duplicate gradient math.

### Phase 8 – Advanced gradients, part B (pixel-based)

**Goal:** Mesh, Freeform, Shape Blur, Aurora.

**Tasks**

- **Mesh (8):** a grid of draggable nodes with colors. Start with Canvas 2D bilinear or bicubic patch interpolation, with smoothness controlling the curve. Add a WebGL2 fragment shader once the canvas version is correct.
- **Freeform (9):** draggable color points, each with an influence radius; blend with inverse-distance weighting; smoothness controls the falloff.
- **Shape Blur (10):** shapes (circle, ellipse, rectangle, blob) with position, size, color, blur radius and opacity; draw with canvas `filter: blur()`.
- **Aurora (13):** ribbons built from sine-wave paths with amplitude, flow direction, blur, glow and opacity; draw several translucent blurred ribbons using additive/screen blending.
- Render previews at reduced resolution while dragging, then at full quality on release. Use `requestAnimationFrame` and an `OffscreenCanvas` if needed.

**Done when:** dragging a node or point updates the preview at roughly 30 fps or better on a mid-range laptop.

**Starter prompt**

> Implement Phase 8: Mesh, Freeform, Shape Blur and Aurora on Canvas 2D with draggable controls and reduced-resolution drag previews. Add the WebGL2 Mesh shader only after the canvas version is correct.

### Phase 9 – Static export

**Goal:** every export in the spec except animation.

**Tasks**

- **CSS:** copy button; options for plain, CSS variables (`--g1`, `--g2`, ...) and layered output; show a notice when a type is approximated.
- **Tailwind:** arbitrary-value utility (`bg-[linear-gradient(...)]`, spaces replaced with underscores) and a `theme.extend.backgroundImage` config snippet.
- **SVG:** exact for linear, radial and reflected; filters for shape blur and freeform; embedded raster fallback for the rest.
- **PNG / JPEG / WebP:** render the project to an offscreen canvas at custom width, height and scale factor (1x–4x); PNG supports transparent or solid background; quality slider for JPEG/WebP.
- **JSON:** download and import projects, validated with Zod and carrying a `version` field for future migrations.
- **Share link:** project JSON compressed with lz-string into the URL hash.

**Done when:** a downloaded PNG matches the preview, an exported JSON re-imports to an identical project, and pasted CSS looks the same in a blank HTML page.

**Starter prompt**

> Implement Phase 9: CSS (plain, variables, layered), Tailwind, SVG, PNG/JPEG/WebP with scale factor, JSON export/import with Zod validation, and a share link. Show a notice whenever a type is approximated.

### Phase 10 – Animation

**Goal:** animated noise, animated aurora and animated exports.

**Tasks**

- Add a time parameter `t` to canvas and WebGL renderers; animate noise (speed: slow, medium, fast, custom), aurora flow and optional hue shifts.
- **Seamless loops:** make animation periodic over the chosen loop duration (use `sin(2πt/T)` and `cos(2πt/T)` terms, or sample noise on a circle in 4D/3D space).
- **WebM:** `canvas.captureStream()` plus `MediaRecorder`.
- **GIF:** render frames offline and encode with gifenc; cap size and frame count, with a progress bar and a Cancel button.
- Respect `prefers-reduced-motion` for the live preview.

**Done when:** a 3-second exported loop shows no visible jump between its last and first frames.

**Starter prompt**

> Implement Phase 10: time-based animation for noise and aurora, seamless loops, WebM export via MediaRecorder, and GIF export via gifenc with progress and cancel.

### Phase 11 – Presets, polish and accessibility

**Goal:** make it feel finished.

**Tasks**

- 30+ curated presets covering every type, with thumbnails; save "My presets" to `localStorage`.
- Empty, loading and error states; toast messages for copy and export.
- Keyboard navigation, visible focus rings, ARIA labels, WCAG AA contrast in the UI.
- SEO basics: title, description, Open Graph image, favicon, and `manifest.webmanifest` (optional PWA for offline use).

**Done when:** the app can be used with the keyboard alone and passes an automated accessibility check with no serious issues.

**Starter prompt**

> Implement Phase 11: 30+ presets with thumbnails, My presets in localStorage, empty/loading/error states, toasts, keyboard and ARIA accessibility, and SEO metadata.

### Phase 12 – Testing, performance and launch

**Tasks**

- **Unit tests:** color conversions, stop sorting, CSS string generators (snapshot tests), noise determinism, JSON schema.
- **Browser tests (Playwright):** switch every type, edit a stop, undo/redo, export each format, import JSON.
- **Performance:** cap preview resolution, debounce heavy renders, move export rendering to a Web Worker, test on a throttled CPU.
- Cross-browser check on Chrome, Safari, Firefox, and mobile Safari/Chrome.
- Deploy to production, add privacy-friendly analytics (such as Plausible), and write a short README.

**Starter prompt**

> Implement Phase 12: the full unit and Playwright test suites, preview performance caps, export in a Web Worker, a README, and production deployment. List any remaining known bugs.

---

## 8. Rules to give your AI assistant (paste once)

1. Work on **one phase at a time**; stop and summarize when it is done.
2. TypeScript strict mode; no `any`. Every function in `color/`, `engine/` and `export/` gets a unit test.
3. Never put gradient math inside React components; keep it in `engine/`.
4. Never change the `Project` schema without updating the Zod schemas, defaults, tests and the JSON `version` migration.
5. The preview must stay interactive: throttle heavy renders and commit history only on pointer release.
6. Keep files under about 300 lines; split when larger.
7. Do not add new libraries without asking.
8. After each phase, list what was built, what was skipped and any known bugs.

---

## 9. Master kickoff prompt

> You are a senior front-end engineer. We are building a client-side Gradient Maker web app using React, TypeScript, Vite, Tailwind v4, shadcn/ui, Zustand with zundo, culori and Zod. It supports 15 gradient types (linear, radial, conic, diamond, three repeating types, mesh, freeform, shape blur, layered, reflected, aurora, holographic, grainy), a reusable noise and texture effect system, global settings, and export to CSS, Tailwind, SVG, PNG, JPEG/WebP, JSON and animated GIF/WebM. Follow the architecture, data model and rules in the blueprint I pasted. We will build in 13 phases (0–12). Start with Phase 0 only, then wait for my approval.

---

## 10. Risks and decisions to confirm

| Topic | Recommendation |
| --- | --- |
| Mesh and aurora performance | Build in Canvas first; move to WebGL only if previews lag |
| CSS-inexpressible types (mesh, aurora) | Be honest in the UI: offer PNG, WebP or SVG-with-raster instead of fake CSS |
| GIF size | Cap dimensions and duration; prefer WebM for quality |
| Color gamut | OKLCH can exceed sRGB; clamp on export and warn the user |
| Browser support | CSS interpolation color spaces need modern browsers; keep the sampled-stops fallback |
| Monetization or accounts | Out of scope for v1; add a backend (for example Supabase) later if needed |

---

## 11. Final launch checklist

- [ ] All 15 types render and have complete settings from the specification
- [ ] Noise panel works on every compatible type with reproducible seeds
- [ ] Every export format downloads or copies correctly
- [ ] Undo/redo is reliable across all actions
- [ ] Mobile layout tested on a real phone
- [ ] Accessibility and performance checks pass
- [ ] README, favicon, social image and production URL are ready