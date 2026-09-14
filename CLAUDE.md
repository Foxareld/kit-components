# Kit Component Library

A Lit-based web component library (TypeScript, Shadow DOM, Storybook). This file consolidates the project conventions previously spread across `docs/`.

## Decisions log

Whenever you make a choice during this work that isn't obvious just from reading the resulting code, log it. This means:

You picked one approach over a real alternative (not just "the way you happened to write it," an actual fork where something else was plausible).
You hit a bug, gotcha, or unexpected behavior and had to work around it.
A constraint (browser, Lit, Shadow DOM, accessibility, or otherwise) shaped the implementation in a way that isn't visible just from the final code.

Do not log routine implementation work (writing a standard prop, following an existing pattern from another component, straightforward styling) — only log things a future engineer would otherwise have to rediscover by hitting the same wall you did.

Log both things that a consumer of a component could actually hit, and internal decisions/bugs that never reached a consumer but explain real reasoning (an approach you rejected, a bug caught before it shipped, a tradeoff). Don't filter based on whether it was "fixed internally," that's exactly the kind of thing worth capturing while the reasoning is still fresh. Use the Audience field below to separate the two later.

Append an entry to docs/decisions-log.md (create it if it doesn't exist) in this exact format:

## [component-or-area] — [one-line topic]

**Tag:** [architecture | accessibility | theming | testing | forms | other]
**Audience:** [consumer | internal]
**Symptom/question:** what prompted this — the bug, the question, or the fork in the road
**Decision:** what was actually done
**Why:** the reasoning, including what was considered and rejected, if relevant

consumer = something a person using the component could actually run into (a validation quirk, a styling gotcha, a prop that behaves unexpectedly). internal = a decision, tradeoff, or bug that shaped the implementation but never reached a consumer (an approach that was tried and rejected, a bug caught before it shipped, why one architectural pattern was chosen over another).

Keep entries short, a few sentences per field, not essays. Write them the way the rest of this file is written: plain, specific, symptom-first where there is one. Append to the end of the file, don't reorganize or edit past entries. Don't ask before logging, just do it as part of the normal course of work.

## Architecture

- Every component extends `KitElement` ([src/base/KitElement.ts](src/base/KitElement.ts)), not `LitElement` directly. `KitElement` currently adds no behavior of its own — it's a deliberate extension seam for shared behavior we might add later (e.g. an `emit()` helper, form-association boilerplate). Don't put styling logic on it; see below.
- Each component lives in its own folder under `src/components/<name>/`:
    - `<name>.component.ts` — the component class
    - `<name>.css` — source styles (committed)
    - `<name>.styles.ts` — generated from the `.css` file (gitignored, never hand-edit)
    - `<name>.test.ts` — Web Test Runner tests
    - `<name>.stories.ts` — Storybook stories
    - `index.ts` — re-exports the component
- New components must be exported from `src/components/index.ts`, and declare their tag in `HTMLElementTagNameMap` (see any existing component for the pattern).

### Form-associated components

Extend `FormAssociatedElement` ([src/base/FormAssociatedElement.ts](src/base/FormAssociatedElement.ts)), not `KitElement` directly, for any component that participates in a `<form>` (text-like inputs, radio groups, select, checkbox, etc.). It provides the boilerplate that's identical across every such component: `static formAssociated = true`, `attachInternals()` in the constructor, and the read-only validity API (`checkValidity`, `reportValidity`, `validity`, `validationMessage`, `willValidate`, `form`).

It deliberately does **not** provide `setValidity`/`setCustomValidity`/`formResetCallback` — how a component computes and clears its own validity differs by what's underneath it:

- `kit-input` ([src/components/input/input.component.ts](src/components/input/input.component.ts)) — mirrors a _native_ `<input>`'s own `ValidityState`/`validationMessage` into `internals.setValidity(...)`, anchored to that native element. Custom/business-rule errors go through the native input's own `setCustomValidity(message)` rather than a separate field — its `ValidityState.customError` becomes the single source of truth and survives the next native-validity mirror automatically.
- `kit-radio-group` ([src/components/radio-group/radio-group.component.ts](src/components/radio-group/radio-group.component.ts)) — reference for a component with **no native control underneath**. It computes validity itself (`required && !value` → `valueMissing`) and tracks its own `_customError` field, since there's no native element to route a custom message through.

Both share these rules:

- Sync the form value every update via `internals.setFormValue(this.value)` (in `updated()` is fine — it's not render-dependent).
- Compute/mirror validity in `willUpdate()`, not `updated()`. `willUpdate()` runs before render, so the same render cycle already reflects fresh validity; doing it in `updated()` means the state changed _after_ render, so nothing visually updates until a second cycle — see the gotcha below.
- Implement `formResetCallback()` (reset to whatever was captured at connect/first-render time) so `form.reset()` works.
- Any public method that mutates `ElementInternals` directly (`setCustomValidity`, a public `setValidity`, etc.) must end with `this.requestUpdate()`. Those calls don't touch a reactive `@property`/`@state`, so Lit has no way to know a re-render is needed — the change is real (`checkValidity()` reflects it immediately) but invisible in the DOM until something _else_ happens to trigger a render. This bit us even after fixing the `willUpdate()` cascade issue below: it "worked" in isolated tests only because an unrelated property change happened to be triggering a render at the same time, and silently failed once a form actually called `setCustomValidity()` a second time with nothing else changing.
- Render any "is this field/group invalid" UI as a **pure read** of `this.validity`/`this.validationMessage` at render time, not as a separately-cached reactive field that a validity check has to remember to clear.
- Watch for string properties with an empty-string default (e.g. `pattern = ''`) bound straight to the matching native attribute (`pattern=${this.pattern}`). An empty attribute isn't "absent" to the browser — `pattern=""` means "match only the empty string," so every non-empty value fails validation. Bind with `ifDefined(this.pattern || undefined)` when empty should mean "not set."

**Lit gotcha — don't mutate reactive state as a side effect inside `updated()`.** `el.updateComplete` only resolves for the update currently in flight; if `updated()` itself sets a property (`this._foo = x`), that schedules another update that `updateComplete` does _not_ wait for (Lit calls this "change-in-update" and warns about it in dev mode). Code — including tests — that does a single `await el.updateComplete` will then observe stale DOM. This cost real debugging time on `kit-input` (it manifested as Web Test Runner hanging indefinitely, not just failing, because the cascade combined badly with mocha's fixture teardown). Prefer computing derived UI state as a pure getter read during `render()`; if you must mutate internals-style state as a side effect, do it in `willUpdate()` so the current render already sees it.

One place this pattern is _unavoidable and fine_: resolving initial state that depends on slotted children (e.g. `kit-radio-group` reading which child has `checked` to set its own `value`). `@queryAssignedElements` can't see slotted content until after the first render, so that resolution has to happen in `firstUpdated()`, and setting a property there necessarily schedules one bounded follow-up cycle. That's a single, mount-only cascade (not a recurring one from user interaction), `@open-wc/testing`'s `fixture()`/`elementUpdated()` already waits through it correctly, and it's the same shape `kit-input` uses for its own initial validity. The dev-mode warning here is expected — the bug to watch for is a cascade that recurs on every interaction, not one that settles once at mount.

## Styling

### CSS build pipeline

Component styles are authored in `.css` files and compiled to `.styles.ts`:

```bash
npm run build:styles   # one-shot compile
npm run watch:styles    # rebuild on save, run in a second terminal while developing
```

Never edit a `.styles.ts` file directly — it's regenerated from the matching `.css` file. The export name always matches the filename (`button.css` → `buttonStyles`).

### Base styles: explicit, not automatic

There is **no automatic style injection**. Every component spreads its styles explicitly, with the shared base first:

```typescript
import { baseStyles } from '../../styles/utilities.js';
import { buttonStyles } from './button.styles.js';

static styles = [baseStyles, buttonStyles];
```

`baseStyles` (in [src/styles/utilities.ts](src/styles/utilities.ts)) is the small set every component should always have — currently `boxSizing` + `focusStyles`. Other utilities in that file are opt-in and situational — only pull them in when relevant:

- `disabledStyles` — for components with a real disabled state
- `srOnly` — screen-reader-only utility class
- `baseInput` — shared styling for text-input-like elements

**Do not reintroduce a global/per-component CSS reset.** Shadow DOM already isolates each component's styles from the rest of the page — that's what makes per-component styling safe. A shared reset stylesheet applied across nested components previously caused a parent's reset to bleed into and override child component styles in ways that were hard to predict; keeping the shared surface to a small, explicit `baseStyles` set (rather than a broad reset) avoids that class of bug entirely.

### Consumer-facing styling (for apps using Kit)

- CSS custom properties are auto-injected at `:root` when any component is imported (`src/styles/variables.css`). Consumers theme by overriding those variables in their own app CSS — no setup required.
- You cannot style inside a component's shadow DOM from outside it (e.g. `kit-button button { ... }` will not work). Use CSS custom properties (they pierce shadow DOM) or the component's own attributes/props instead.
- Content passed into a `<slot>` is styled by the consumer's own app styles, not the component's shadow styles.
- Dark mode: override the theme variables under `@media (prefers-color-scheme: dark)` or a class toggle — components don't do anything special for this themselves.

## Creating a new component

1. `npm run scaffold <kebab-case-name>` — generates the component/CSS/test/stories/index files from a template (already wired up with `baseStyles`; the template is intentionally minimal — a bare `<div part="root"><slot></slot></div>` with no example properties, so add whatever properties/variants the component actually needs).
2. Run `npm run build:styles` to generate the `.styles.ts` file.
3. Export the component from `src/components/index.ts`.
4. Use CSS custom properties for anything themeable; write real styles in the `.css` file.
5. Extend the generated tests to exercise the component's actual properties/behavior, and keep the accessibility check via `@open-wc/testing`'s `.to.be.accessible()`.

## Testing

- Web Test Runner + `@open-wc/testing`, run across Chromium/Firefox/WebKit via Playwright.
- `npm test` / `npm run test:watch` / `npm run test:coverage`.

## Build

`npm run build` runs, in order: clean → `build:icons` → `build:styles` → `build:ts` → `build:metadata` (custom-elements manifest via `cem analyze`).
