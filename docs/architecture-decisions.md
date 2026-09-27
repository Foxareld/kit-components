## "I set disableTrigger expecting the trigger to look disabled, but it still looks interactive"

<!-- tag: architecture, audience: consumer -->

disableTrigger and disabled are not the same thing, on purpose. disableTrigger only turns off the automatic click-to-toggle wiring, it exists for triggers that open the dropdown some other way (a search input with a separate icon button, for example), and the trigger itself stays fully interactive. It was never meant to convey a disabled visual state.

If you actually want the dropdown unopenable and the trigger showing disabled styling, use disabled instead. It blocks both trigger clicks and toggle() from opening the dropdown, and sets disabled/aria-disabled on the assigned trigger so components like kit-button render their own disabled look. The two properties are kept separate deliberately, so disableTrigger doesn't have to guess whether you also wanted it visually disabled.

## Forcing open=false on disable in kit-dropdown moved to willUpdate()

<!-- tag: forms, audience: internal -->

When `disabled` becomes true while the dropdown is open, it needs to close. Setting `this.open = false` inside `updated()` works, but mutating a reactive property inside `updated()` schedules a second, visible update cycle (Lit's "change-in-update" warning). Moved the `disabled → open = false` forcing into `willUpdate()` instead, so the same render cycle already reflects the closed state.

`willUpdate()` runs before Lit commits the render, so a property mutated there is visible to the rest of that same update pass — no extra cycle, no warning. Confirmed empirically: after the fix, `dropdown.test.ts`'s console shows no change-in-update warning, unlike a few other components in this repo that have one from an unrelated (accepted) mount-time cascade.

## Form-associated components compute validity in willUpdate(), not updated()

<!-- tag: forms, audience: internal -->

kit-input originally mirrored native validity in updated(). Since updated() runs after Lit commits the render, any state set there doesn't show up until a second cycle, the invalid-state UI lagged a full render behind the actual state change. Worse, the resulting repeating change-in-update cascade combined badly with mocha's fixture teardown and hung Web Test Runner indefinitely instead of failing cleanly, that cost real debugging time before the lifecycle hook turned out to be the actual cause.

Fix: compute and mirror validity in willUpdate() for every form-associated component. internals.setFormValue() stays in updated(), since it isn't render-dependent and doesn't have this problem. The one accepted exception is kit-radio-group's firstUpdated() read of slotted children, a single bounded mount-time cascade, not a recurring one, which @open-wc/testing's fixture() already handles correctly.

## Public validity-mutating methods on form-associated components now call requestUpdate()

<!-- tag: forms, audience: internal -->

`setCustomValidity()` and other methods that mutate `ElementInternals` directly kept intermittently failing to update the DOM, even after fixing the `willUpdate()` cascade above. `checkValidity()` reflected the change correctly, but the invalid-state UI didn't repaint. It only appeared to work in isolated tests because an unrelated property change happened to trigger a render at the same time, and it silently failed the moment a form called `setCustomValidity()` a second time with nothing else changing.

Any public method that mutates `ElementInternals` directly (`setCustomValidity`, a public `setValidity`) now ends with `this.requestUpdate()`. Those calls don't touch a reactive `@property`/`@state`, so Lit has no way to know a re-render is needed on its own — the change is real and immediately visible to `checkValidity()`, but invisible in the DOM until something else happens to trigger a render.

## "I expected `kit-select` to take an `options` array, but it wants slotted `kit-option` elements instead"

<!-- tag: architecture, audience: consumer -->

A plain JS array can't be set declaratively from an HTML attribute, only through a JS property binding, so the `options={[...]}` prop shape from the design system's React spec doesn't translate cleanly to a framework-agnostic web component.

`kit-select` takes slotted `kit-option` children instead, the same shape as `kit-radio-group` + `kit-radio`. `kit-select` owns the listbox, roving-tabindex keyboard navigation, selection, and form participation; `kit-option` is presentational only, mirroring `kit-radio`'s split. This reuses Kit's own established, tested, accessible pattern for a "collection of choices" rather than introducing a second, React-flavored convention for one component — the design doc's prop shape is meant as a translation aid, not a literal API to port.

## "Why doesn't `kit-select` filter options as I type?"

<!-- tag: architecture, audience: consumer -->

`kit-select` is a simple non-editable, button-triggered listbox, not an editable combobox with as-you-type filtering — that's what the Kit design system's own spec for Select actually draws, so that's what got built: a `<button>` trigger, no text input, no filtering. Type-ahead is still supported (typing jumps to a matching option, it doesn't filter the list), since that's standard listbox keyboard behavior, not a search feature.

A filtering variant would be scope creep against the actual design intent — a searchable select is a genuinely different, larger component. It can be added later as an opt-in if a real consumer need shows up.

## kit-select's getUpdateComplete() now awaits kit-dropdown's own update cycle

<!-- tag: forms, audience: internal -->

`select.test.ts` hung the whole file indefinitely, the same way `dropdown.test.ts` once did. `kit-select` closes its internal `kit-dropdown` by setting `dropdownEl.open = false`, which schedules a Lit update on `kit-dropdown` — a separate custom element with its own independent update cycle. `await selectEl.updateComplete` only waits for `kit-select`'s own update, not its child's, so a test could observe `document.activeElement` before `kit-dropdown`'s own close/focus-return logic had actually run, and that race broke the next test's fixture teardown, producing the hang.

`kit-select` now overrides `getUpdateComplete()` to additionally await the internal `kit-dropdown` element's own `updateComplete`, per Lit's documented pattern for awaiting descendant updates. This fixes the race for every consumer, not just tests — `await selectEl.updateComplete` now genuinely means kit-select and everything it just told kit-dropdown to do have both settled. Fixing it only in test helpers would have left the same footgun for real app code.

## kit-tab-group extends KitElement directly, not FormAssociatedElement

<!-- tag: architecture, audience: internal -->

`kit-tab-group`/`kit-tab` were built following `kit-radio-group`/`kit-radio` as the structural reference — slotted children, delegated click/keydown on the parent, roving tabindex — which raised the question of whether to also extend `FormAssociatedElement` like radio-group does.

Both extend `KitElement` directly instead: no validity API, no `formResetCallback`, no form value submission. Tabs aren't a form control — a tablist doesn't submit a value to a server, it's a navigation/disclosure widget — so `FormAssociatedElement`'s validity boilerplate would be dead API surface on a component that can never be invalid or required. What's worth reusing from radio-group is the slotted-children-plus-delegated-events shape, not the form plumbing on top of it.

## "Why does `kit-tab-group` always show one tab as active, even without a selected attribute anywhere?"

<!-- tag: architecture, audience: consumer -->

`kit-radio-group` allows a valid "nothing checked" state, which matters for optional form fields, but tabs don't have an equivalent "nothing selected" state — a tablist with no visible active tab isn't a state any real tab UI has.

If no slotted `kit-tab` has `selected` set and no `value` is supplied, `kit-tab-group` selects the first enabled tab itself on `firstUpdated()`. Consumers shouldn't have to remember to mark one tab `selected` for the component to render sensibly — a tablist with a roving tabindex needs a tabbable tab regardless, so defaulting to the first enabled one keeps both the visuals and the keyboard entry point correct out of the box.

## "Does `kit-tab-group` support vertical tabs?"

<!-- tag: architecture, audience: consumer -->

WAI-ARIA APG's tabs pattern supports a vertical orientation (`aria-orientation`, Up/Down arrow keys instead of Left/Right), and an `orientation` property was built to support it, but there was no concrete consumer need for vertical tabs driving this — it was added speculatively because the spec allows for it.

The `orientation` property was removed entirely. `kit-tab-group` only supports horizontal tabs: Left/Right arrow keys, no `aria-orientation` attribute, no vertical CSS variant. Building for a layout variant nothing currently needs is speculative surface area worth avoiding, and it's easy to reintroduce later — the arrow-key-set and CSS branching were both small and isolated — if a real vertical-tabs need shows up.

## "How do I connect a `kit-tab-panel` to its `kit-tab-group`?"

<!-- tag: architecture, audience: consumer -->

`kit-tab-panel` is a standalone element, not a slotted child of `kit-tab-group`. It pairs with a group via a `tab-group="<id>"` attribute — the same idea as a native `<label for>` — resolved once via `document.getElementById` when the panel connects, so it doesn't have to be adjacent to the group in the DOM.

Tab panels commonly need to live somewhere other than right next to the tablist: tabs in a page header with panel content lower in the layout, or panels rendered by an entirely different part of the app. Slotting panels into `kit-tab-group` would also mean the group's slot mixes two different child types (`kit-tab` and `kit-tab-panel`), complicating `@queryAssignedElements`-based child discovery for no real benefit. An id-reference keeps `kit-tab-group` unaware panels exist at all — it still only manages tabs.

## kit-tab-group now dispatches change for externally-set value, not just interactive selection

<!-- tag: architecture, audience: internal -->

`kit-tab-group`'s `updated()` already re-synced slotted tabs when `value` was set externally (`group.value = 'x'`), mirroring `kit-radio-group`'s equivalent path, but that path never dispatched `change` — only the internal `_selectTab()` (click/keyboard) did. Building `kit-tab-panel`, which listens for `change` to know when to swap visibility, surfaced this as a real gap: a panel would go stale if a consumer drove tab selection by setting `.value` directly instead of clicking or using the keyboard.

`updated()` now also dispatches `change` when it detects and applies an externally-set `value`, guarded so it can't double-fire alongside `_selectTab()`'s own dispatch. `kit-tab-group`'s own docs already promise consumers can switch panel visibility off the `change` event, and that contract wasn't actually true for the programmatic-selection case until this fix. This wasn't carried back into `kit-radio-group`: a form doesn't need a `change` event for every programmatic value assignment the way a panel-switcher does, and radio-group's existing asymmetry is established, tested behavior its own consumers already depend on.

## "Why doesn't `kit-accordion-item` pair its header and panel by id, the way `kit-tab-panel` does?"

<!-- tag: architecture, audience: consumer -->

`kit-tab-panel`'s pattern — a panel matched to its trigger by a shared id, so it can live anywhere on the page relative to what controls it — was considered for accordion panels too, but `kit-accordion-item` renders its own header and panel together in one component instead, with no separate panel element and no id-matching.

That indirection earns its keep for tabs because a tab strip and its single active panel are commonly positionally separate (tabs in a header, panel content lower in the layout), and only one panel is ever visible at once. An accordion item's header and body are always a co-located pair, and potentially several are open at once — there's no "lives elsewhere on the page" case to design for, so the id-matching/async-connect machinery would only add indirection for nothing gained.

## "Do accordion items close each other when I open one, or can I have several open at once?"

<!-- tag: architecture, audience: consumer -->

Whether `kit-accordion` should support closing other items when one opens, and whether that should be the default, was a real design fork to resolve before building.

Items open and close independently by default. `kit-accordion` adds an opt-in `single` boolean — when set, opening one item closes every other item in the group, the same mutual exclusivity `kit-tab-group` enforces between tabs. Multi-open is the more common accordion default, and making exclusivity opt-in rather than baking in one fixed behavior covers both real use cases — an FAQ list where several answers can be open at once, versus a space-constrained settings panel where only one section should show at a time — without forcing either shape on every consumer.

## "Why does `kit-accordion-item` fire a `change` event instead of `toggle`?"

<!-- tag: other, audience: consumer -->

`toggle` looked like the obvious name for the item's own state-change event, but TypeScript's DOM lib defines a global `ToggleEvent` type for the native `toggle` event (fired by `<details>` and the Popover API) and maps it in `HTMLElementEventMap`. That means `addEventListener('toggle', ...)` resolves to `ToggleEvent` rather than `Event`/`CustomEvent` — `event.detail` doesn't exist on it, forcing an unsafe cast anywhere it's consumed in TypeScript.

The event was named `change` instead, matching `kit-tab-group`/`kit-radio-group`'s existing convention, with `detail: { open, value }`. Keeping `toggle` would have pushed the same unsafe-cast problem onto every consumer listening in TypeScript, not just internal tests — `change` sidesteps the native-type collision entirely and stays consistent with how every other grouped/stateful Kit component already names its state-change event.

## kit-accordion-item's panel padding moved off the overflow:hidden grid item onto a nested part

<!-- tag: other, audience: internal -->

The collapse/expand animation used a CSS grid `0fr`/`1fr` trick on `[part='panel']`, originally with `overflow: hidden` and the panel's padding both on the same grid item (`[part='panel-inner']`). A closed item still rendered with a visible sliver of height and content, exactly equal to its padding-bottom — caught visually testing in Storybook (a "single open" story showed every closed panel's text peeking through), not by the automated tests, which never asserted a pixel height.

The grid item was split into two layers: the outer one (`[part='panel-inner']`) keeps only `overflow: hidden` and `min-height: 0`, and a new inner `[part='content']` carries the padding. A grid item's padding is part of its own generated box and contributes to the row's automatic minimum size regardless of `overflow: hidden` — only content can be clipped away by overflow, not the box's own padding. Moving the padding one level deeper, inside the clipped element rather than on it, lets the outer box's intrinsic size actually reach zero so the `0fr` track collapses fully, while `overflow: hidden` on the parent still visually hides the now off-flow inner content. `min-height: 0` on the outer layer was also required, since a grid item's default `min-height: auto` otherwise floors it at its min-content size independent of the row's track size.

## "How do I control a heading's visual size independently of its semantic level in kit-heading?"

<!-- tag: architecture, audience: consumer -->

`kit-accordion-item` originally solved its own heading semantics inline, with a one-off `role="heading"`/`aria-level` div. Rather than solve that per-component, it became its own reusable component: `kit-heading` separates the semantic tag from the visual style, so the tag a screen reader sees and the size a sighted user sees don't have to move together.

`level` (1–6, clamped) picks a real, literal `hN` tag — never `role="heading"` emulation. `size` (`sm`/`base`/`lg`/`xl`) is an independent visual override, defaulting to a level-derived value (1→xl, 2→lg, 3–4→base, 5–6→sm), so the common case — no explicit visual override — still looks like a heading at every level out of the box, instead of requiring a consumer to set two props together to get a sane result. `kit-accordion-item`'s old role=heading div was replaced with a real `<kit-heading>` wrapping the trigger button, since real semantic heading elements are more broadly and reliably understood by assistive tech than the ARIA-role stand-in. Kit's own design system has no heading type scale yet (`design-reference/tokens/typography.css` only defines `--font-size-sm/base/lg/xl`, no display/title steps), so `size` maps onto those 4 existing tokens.

## kit-accordion-item's header button uses font-size/font-weight: inherit so kit-heading's sizing actually applies

<!-- tag: architecture, audience: internal -->

After wrapping the trigger `<button>` in `<kit-heading>`, the button still visually ignored whatever level/size `kit-heading` resolved to — the accordion header text stayed the same size regardless of `heading-level`. The button already had its own hardcoded `font-size: var(--font-size-base)` from before `kit-heading` existed, which simply overrode whatever the wrapping `hN` element's CSS specified.

The button's `font-size` and `font-weight` were changed to `inherit`, letting them cascade from `kit-heading`'s internal `hN` element through slot assignment — inherited CSS properties flow through the flattened/rendered tree, not the light-DOM tree, so a slotted button does pick up its slot parent's font styles once nothing on the button itself overrides them. The entire point of threading `heading-level` through the accordion is for it to visibly change the rendered size, so a hardcoded value on the slotted button silently defeated that. Worth knowing going in: any future hardcoded `font-size`/`font-weight` on content slotted inside a `kit-heading` will silently win over the heading's own styling.

## "Do I have to set heading-level on every kit-accordion-item, or can I set it once on kit-accordion?"

<!-- tag: architecture, audience: consumer -->

With `kit-heading` in place, `kit-accordion-item` still only had its own per-item `heading-level` property, meaning a consumer had to repeat it on every single item.

`kit-accordion` now has its own `heading-level` property (default 3). On first render and on any subsequent change — including new items slotted in later — it overwrites every child item's `heading-level` unconditionally. Every item in a given accordion instance is virtually always at the same outline depth in practice, so requiring the property on every item is pure boilerplate for the common case. The unconditional overwrite (rather than "only fill in if the item didn't set its own") keeps the contract simple, matching the same broadcast approach `kit-tab-group` uses to push its own value down to its tabs, rather than adding a per-item-override escape hatch nothing has asked for yet.

## chunks.json and embeddings.json are gitignored, not committed

<!-- tag: architecture, audience: internal -->

`embeddings.json` grows with the corpus and gets regenerated any time docs or components change — a git-tracked copy would produce large, unreadable diffs on every run.

`chunks.json` and `embeddings.json` are gitignored instead. `embeddings.json` gets uploaded directly to S3 for the Lambda to load, not shipped through git or the Storybook build. Both files are fully reproducible from source (docs, `custom-elements.json`, and one API call), so nothing is lost by not versioning them, and it keeps the repo's history clean.

## Lambda timeout raised from AWS's default 3s to 30s for the RAG chatbot function

<!-- tag: architecture, audience: internal -->

The first test invocation of the RAG chatbot Lambda failed with `Sandbox.Timedout` after exactly 3 seconds. Logs showed the S3 embeddings load succeeding, then nothing — the function died mid-request rather than erroring cleanly.

The function's timeout was raised from AWS's default 3 seconds to 30 seconds, and memory bumped from 128 MB to 256 MB, since Lambda ties CPU allocation to memory and the function does real work (JSON parsing, similarity math) in addition to waiting on network calls. The handler makes two sequential external API calls — one to OpenAI for the question's embedding, one to Claude for the actual answer — on top of the S3 load, comfortably more than 3 seconds end to end, especially on a cold start. 3 seconds is a reasonable default for a single quick operation, but was never going to be enough for a function chaining multiple network calls together.

## RAG chat test page kept outside the Storybook build (docs-site/chat-test.html, not a staticDirs entry)

<!-- tag: architecture, audience: internal -->

Stage 1 of the docs chat widget needed a throwaway page for testing against the real `/ask` endpoint. That endpoint's CORS only allows the CloudFront origin, so the page can only be tested for real once it's served from there — but `storybook build` only emits what's under `storybook-static/` (stories plus any `staticDirs`, of which there are none).

The page lives at `docs-site/chat-test.html`, a standalone file with no build step, uploaded to the bucket by hand next to the Storybook build for the real test — `docs-site/` was deliberately not added as a Storybook `staticDirs` entry. Wiring it into `staticDirs` would ship scaffolding with every Storybook deploy and leave it there after the real widget replaces it; a manual one-file upload is cheap and easy to delete afterward. Local runs from `file://` or `localhost` always hit the error state, which is expected.

## RAG chat test page can't distinguish a CORS rejection from a plain network failure

<!-- tag: other, audience: internal -->

Whether the error state could say "blocked by CORS" specifically, when the page runs from the wrong origin, turned out not to be possible: the browser deliberately hides the CORS failure reason from script. It surfaces as the same opaque `TypeError` as a dropped connection — the actual reason only appears in devtools — so the page has nothing to branch on.

Instead, a rejected `fetch()` shows one generic "could not reach" message, a non-2xx response shows its HTTP status, and a 2xx response whose body won't parse as JSON gets its own message. The answer itself is rendered with `textContent`, never `innerHTML`, since it's LLM output that could contain HTML-like text — a stubbed answer containing `<b>` rendered as escaped text, as intended.

## Stage 2 RAG chat test page bundles Kit locally with esbuild rather than publishing the package

<!-- tag: architecture, audience: internal -->

The stage 2 standalone page needs Kit in a plain HTML file, but `dist/` leaves `lit` as a bare import (`packages: 'external'`) and the package isn't published, so no CDN or `<script>` tag can load it. Publishing the package, or moving stage 2 into a Storybook story, were both considered.

Instead, `docs-site/build-chat-test.mjs` bundles `src/index.ts` plus Lit into a self-contained `kit.js` + `kit.css` next to the page (gitignored), tested by uploading all three files to CloudFront. Publishing means picking a real package name/scope (still the `@yourorg/kit` placeholder), accepting npm's unpublish limits, and still needing an import-rewriting CDN for Lit — real decisions a throwaway page shouldn't force, especially since the stage 3 Storybook panel gets Kit from source anyway. A story would have abandoned the standalone-page plan for stage 2 entirely. The script is the smallest thing that works, and it gets deleted along with the page.

## Storybook manager addon imports from storybook/manager-api, not the older @storybook/manager-api

<!-- tag: architecture, audience: internal -->

The stage 3 spec named `@storybook/manager-api`, but that package isn't installed on Storybook 10.6 — Storybook 9 folded the separate `@storybook/*` addon APIs into the main `storybook` package.

`.storybook/manager.tsx` imports `addons`/`types` from `storybook/manager-api` and `AddonPanel` from `storybook/internal/components` instead, per the current addon-types docs (a panel registers as `addons.add(id, { type: types.PANEL, title, render: ({ active }) => <AddonPanel active={active}>…</AddonPanel> })`). This was confirmed against the installed package's `exports` map and Storybook's own addon docs rather than older examples, which still show the `@storybook/` paths.

## Docs chat addon pre-compiles Kit for the manager, since Storybook's manager esbuild ignores this project's tsconfig

<!-- tag: architecture, audience: internal -->

Importing Kit components straight from `src/` into `.storybook/manager.tsx` crashed the manager entry at load with `Unsupported decorator location: field`. Storybook builds the manager with its own esbuild call and hard-codes its own `addon.tsconfig.json` (JSX settings only) — this project's `experimentalDecorators`/`useDefineForClassFields: false` never apply, so esbuild compiled Lit's `@property` fields as standard decorators, which Lit rejects on plain fields, and Storybook exposes no preset hook to change that config.

`.storybook/docs-chat/build-kit.mjs` bundles just `kit-input`/`kit-button`/`kit-icon` with this project's own `tsconfig.json` into `kit.generated.js` (gitignored), which the panel imports. It runs automatically via `prestorybook`/`prebuild-storybook` npm hooks, so both local dev and the deploy workflow (`npm run build-storybook`) get it with no workflow change; theme tokens (`variables.css`) are imported directly, since the manager builder does emit and link imported CSS. Importing `dist/` was rejected since it only exists after a full `npm run build` (including `tsc` declarations), which neither `npm run storybook` nor the deploy workflow runs; embedding a preview-side story in an iframe inside the panel was also rejected, since that means a second full preview runtime just to host one form. The tradeoff: the manager is built once at startup and doesn't watch, so edits to the panel or to those three components need a Storybook restart to show up in the panel.

## Docs chat panel works around the manager's React 18 (not the project's React 19) custom-element quirks

<!-- tag: architecture, audience: internal -->

This project has React 19 installed, which handles custom elements properly, but the panel renders inside Storybook's manager, which uses Storybook's own bundled React (18.3.1 on Storybook 10.6). React 18 sets every prop on a custom element as a string attribute, so `disabled={false}` becomes `disabled="false"`, which Lit's Boolean converter reads as `true`.

The panel passes `disabled={loading || undefined}` instead, so the attribute is removed rather than set to `"false"`, reads the question from `kit-input` through a ref at submit time instead of mirroring it into React state, and relies only on bubbling native events (`onClick`, `onKeyDown`), which React 18's synthetic system catches fine on custom elements. The disabled attribute was verified to actually be removed once loading finishes — worth checking the manager's actual React version rather than assuming the project's, since that's what determines custom-element behavior here.
