## kit-dropdown — disableTrigger vs. a new disabled property

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** Wanted a disabled dropdown trigger (e.g. a `kit-button`) to show its own disabled styling. The existing `disableTrigger` property looked like the obvious place to add this, but it only suppresses the automatic click-to-toggle wiring — the trigger stays fully interactive by design, since it exists for cases like a search-input trigger where opening is driven by something else internal to it (a separate icon button), not by clicking the input itself.
**Decision:** Added a separate `disabled` property instead of repurposing `disableTrigger`. `disabled` blocks opening entirely (trigger click and `toggle()` both no-op) and sets `disabled`/`aria-disabled` on the assigned trigger element(s) so components like `kit-button` render their own disabled state. `disableTrigger` keeps its original, narrower meaning unchanged.
**Why:** Repurposing `disableTrigger` to also disable the trigger would have broken the exact case it was added for. Keeping them separate means each property does one thing, and neither has to guess at the other's intent.
**Processed:** yes

## kit-dropdown — forcing open=false on disable without a double render

**Tag:** forms
**Audience:** internal
**Symptom/question:** When `disabled` becomes true while the dropdown is open, it needs to close. Setting `this.open = false` as a side effect inside `updated()` works, but mutating a reactive property inside `updated()` schedules a second, visible update cycle (Lit's "change-in-update" warning) — this repo's CLAUDE.md specifically calls this out as a bug pattern to avoid.
**Decision:** Moved the `disabled → open = false` forcing into `willUpdate()` instead of `updated()`, so the same render cycle already reflects the closed state.
**Why:** `willUpdate()` runs before Lit commits the render, so a property mutated there is visible to the rest of that same update pass — no extra cycle, no dev-mode warning. Confirmed empirically: after the fix, `dropdown.test.ts`'s browser console shows no change-in-update warning, unlike a few other components in this repo that have one from an unrelated (accepted) mount-time cascade.
**Processed:** yes

## Form-associated components — compute validity in willUpdate(), not updated()

**Tag:** forms
**Audience:** internal
**Symptom/question:** `kit-input` originally computed/mirrored its validity state in `updated()`. Since `updated()` runs after the DOM is already committed, mutating anything there just schedules a second update instead of showing up in the current one — the invalid-state UI (error text, error styling) lagged a full cycle behind the change that caused it. Worse, the resulting repeating "change-in-update" cascade combined badly with mocha's fixture teardown and hung Web Test Runner indefinitely rather than just failing a test — this cost real debugging time before the actual cause (wrong lifecycle hook) was found.
**Decision:** Compute/mirror validity in `willUpdate()` instead, for every form-associated component (`kit-input`, `kit-radio-group`). Both also sync the submitted form value via `internals.setFormValue()` in `updated()`, which is fine there since it isn't render-dependent.
**Why:** `willUpdate()` runs before render, so the same render cycle already reflects fresh validity — no extra cycle, no cascade. The one place a mount-time cascade is unavoidable and accepted: `kit-radio-group` has to read which slotted `kit-radio` child has `checked` to set its own initial `value`, and `@queryAssignedElements` can't see slotted content before the first render — so that resolution happens in `firstUpdated()` instead, producing a single bounded follow-up cycle at mount, not a recurring one from user interaction. `@open-wc/testing`'s `fixture()` already waits through that correctly.
**Processed:** yes

## Form-associated components — public validity-mutating methods must call requestUpdate()

**Tag:** forms
**Audience:** internal
**Symptom/question:** Even after fixing the `willUpdate()` cascade above, `setCustomValidity()` and other methods that mutate `ElementInternals` directly still seemed to intermittently fail to update the DOM. `checkValidity()` reflected the change correctly, but the invalid-state UI didn't repaint. It "worked" in isolated tests only because an unrelated property change happened to be triggering a render at the same time, and silently failed the moment a form called `setCustomValidity()` a second time with nothing else changing.
**Decision:** Any public method that mutates `ElementInternals` directly (`setCustomValidity`, a public `setValidity`) must end with `this.requestUpdate()`.
**Why:** Those calls don't touch a reactive `@property`/`@state`, so Lit has no way to know on its own that a re-render is needed — the change is real and immediately visible to `checkValidity()`, but invisible in the DOM until something else happens to trigger a render.
**Processed:** yes

## kit-select — slotted kit-option children vs. a data-driven options array

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** The design system's own spec (a React recreation) takes `options={[...]}` as a prop. That shape doesn't translate cleanly to a framework-agnostic web component — a plain JS array can't be set declaratively from an HTML attribute, only via a JS property binding.
**Decision:** `kit-select` takes slotted `kit-option` children instead, the same shape as `kit-radio-group` + `kit-radio`. `kit-select` owns the listbox, roving-tabindex keyboard navigation, selection, and form participation; `kit-option` is presentational only, mirroring `kit-radio`'s split.
**Why:** This is Kit's own already-established, tested, accessible pattern for exactly this "collection of choices" shape — reusing it beats introducing a second, React-flavored convention for one component. The design doc's prop shape is explicitly a translation aid ("encodes intended composition, prop shapes"), not a literal API to port.
**Processed:** yes

## kit-select — no built-in filtering/type-to-search

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** An editable-combobox mode with as-you-type filtering was a real option to build, but the Kit design system's own spec for Select draws a simple non-editable button-triggered listbox — it doesn't call for filtering at all.
**Decision:** Built the simpler select-only combobox the design actually specs — a `<button>` trigger, no text input, no filtering. Type-ahead (typing jumps to a matching option, doesn't filter the list) is included, since that's part of standard listbox keyboard support, not a search feature.
**Why:** Building the filtering variant would be scope creep against the actual design intent — a searchable variant is a genuinely different, larger component. It can be added later as an opt-in if a real consumer need shows up.
**Processed:** yes

## kit-select — getUpdateComplete() must await kit-dropdown's own update cycle

**Tag:** forms
**Audience:** internal
**Symptom/question:** `select.test.ts` hung the whole file indefinitely (no test even reported a result) the same way `dropdown.test.ts` once did. Root cause: `kit-select` closes its internal `kit-dropdown` by setting `dropdownEl.open = false`, which schedules a Lit update on `kit-dropdown` — a separate custom element with its own independent update cycle. `await selectEl.updateComplete` only waits for `kit-select`'s own update, not its child's, so a test could observe `document.activeElement` before `kit-dropdown`'s own close/focus-return logic had actually run. That race then broke the next test's fixture teardown, producing the hang.
**Decision:** Overrode `getUpdateComplete()` on `kit-select` to additionally await the internal `kit-dropdown` element's own `updateComplete`, per Lit's documented pattern for awaiting descendant updates.
**Why:** This fixes the race for every consumer, not just tests — `await selectEl.updateComplete` now genuinely means "kit-select and everything it just told kit-dropdown to do have both settled." The alternative (only fixing it in test helpers) would leave the same footgun for real app code.
**Processed:** yes

## kit-tab-group — not form-associated, despite following the radio-group reference pattern

**Tag:** architecture
**Audience:** internal
**Symptom/question:** `kit-tab-group`/`kit-tab` were built following `kit-radio-group`/`kit-radio` as the structural reference (slotted children, delegated click/keydown on the parent, roving tabindex) — the obvious question was whether to also extend `FormAssociatedElement` like radio-group does.
**Decision:** `kit-tab-group` and `kit-tab` both extend `KitElement` directly. No validity API, no `formResetCallback`, no form value submission.
**Why:** Tabs aren't a form control — a tablist doesn't submit a value to a server, it's a navigation/disclosure widget. `FormAssociatedElement`'s validity boilerplate (`checkValidity`, `willValidate`, etc.) would be dead API surface on a component that can never be invalid or required. The slotted-children-plus-delegated-events shape is what's worth reusing from radio-group, not the form plumbing on top of it.
**Processed:** yes

## kit-tab-group — always keeps exactly one enabled tab selected

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** `kit-radio-group` allows "nothing checked" as a valid state (relevant for optional form fields). Tabs don't have an equivalent "nothing selected" state — a tablist with no visible active tab isn't a state any real tab UI has.
**Decision:** If no slotted `kit-tab` has `selected` set and no `value` is supplied, `kit-tab-group` selects the first enabled tab itself on `firstUpdated()`. This mirrors the predecessor `fs-tab-group`'s `_calculateCurrentIndexOrSelectFirst` behavior.
**Why:** Consumers shouldn't have to remember to mark one tab `selected` for the component to render sensibly — a tablist with a roving tabindex needs a tabbable tab regardless, so defaulting to the first enabled one keeps both the visuals and keyboard entry point correct out of the box.
**Processed:** yes

## kit-tab-group — automatic activation (arrow keys select immediately), not manual

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** The predecessor `fs-tab-group` uses manual activation — arrow keys only move focus, and a separate Enter/Space press is needed to actually select a tab. Kit's own `kit-radio-group` (the in-repo reference for this composition shape) instead selects immediately on arrow-key movement.
**Decision:** `kit-tab-group` uses automatic activation, matching `kit-radio-group`: arrow keys move focus and select the tab in the same step. Space/Enter also select, for when a tab is reached via Tab key rather than arrows.
**Why:** WAI-ARIA APG allows either model, recommending manual activation only when moving to a tab triggers an expensive operation (e.g. a network fetch for panel content). Kit doesn't know what a consumer's panel switch costs, but automatic activation is the more common/expected default for tabs, and matching `kit-radio-group`'s existing behavior keeps keyboard behavior consistent across Kit's grouped-selection components rather than introducing a second interaction model for no in-repo precedent-driven reason.
**Processed:** yes

## kit-tab-group — Home/End support, absent from kit-radio-group

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** `kit-radio-group` has no Home/End support. The WAI-ARIA APG tabs pattern (unlike the radio pattern as Kit implements it) specifies Home/End to jump to the first/last tab as part of the tablist widget's expected keyboard support.
**Decision:** Added Home/End handling to `kit-tab-group`'s keydown handler (jumps to the first/last _enabled_ tab).
**Why:** This is spec-required behavior for the tablist widget specifically, not a gap being carried over for consistency's sake, and cheap to support once arrow-key navigation already exists. (An `orientation` property/vertical layout was also prototyped alongside this but deliberately cut — see below.)
**Processed:** yes

## kit-tab-group — no orientation property; tabs are always horizontal

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** WAI-ARIA APG's tabs pattern supports a vertical orientation (`aria-orientation`, Up/Down arrow keys instead of Left/Right), and an `orientation` property was built to support it. There was no concrete consumer need for vertical tabs driving this — it was added speculatively because the spec allows for it.
**Decision:** Removed the `orientation` property entirely. `kit-tab-group` only supports horizontal tabs: Left/Right arrow keys, no `aria-orientation` attribute, no vertical CSS variant.
**Why:** Building for a layout variant nothing in this codebase or its consumers currently needs is exactly the kind of speculative surface area this repo's conventions call out to avoid. Easy to reintroduce later (the arrow-key-set and CSS branching were both small and isolated) if a real vertical-tabs need shows up.
**Processed:** yes

## kit-tab-panel — pairs with kit-tab-group by id, not by slotting

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** There's no predecessor `fs-tab-panel` to take prior art from — this is new ground. The main design fork: should a panel be a slotted child of `kit-tab-group` (alongside the tabs), or a sibling component paired by reference?
**Decision:** `kit-tab-panel` is a standalone element paired with a `kit-tab-group` via a `tab-group="<id>"` attribute (the same idea as a native `<label for>`), resolved once via `document.getElementById` when the panel connects. It is not slotted into the group and doesn't have to be adjacent to it in the DOM.
**Why:** Tab panels commonly need to live somewhere other than right next to the tablist (e.g. the tabs in a page header, the panel content lower in the layout, or panels rendered by an entirely different part of the app). Slotting panels into `kit-tab-group` would also mean the group's slot mixes two different child types (`kit-tab` and `kit-tab-panel`), complicating `@queryAssignedElements`-based child discovery for no real benefit. An id-reference keeps `kit-tab-group` unaware panels exist at all — it still only manages tabs.
**Processed:** yes

## kit-tab-panel — visibility starts hidden until the paired group resolves

**Tag:** accessibility
**Audience:** internal
**Symptom/question:** Resolving the paired `kit-tab-group` and reading its `value` happens asynchronously (`await group.updateComplete`, since the group may not have finished picking its own default-selected tab yet — see the "always keeps exactly one enabled tab selected" decision above). If a panel defaulted to visible until that resolution finished, multiple panels could theoretically render visible together for that brief window.
**Decision:** `kit-tab-panel` sets `hidden = true` synchronously in `connectedCallback()`, before the async group resolution even starts, then corrects it once the real value is known.
**Why:** Cheap to guarantee "at most one panel visible" holds at every observable point rather than relying on the resolution being fast enough in practice to not matter.
**Processed:** yes

## kit-tab-panel — auto-wires aria-controls/aria-labelledby, without overwriting a consumer's own

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** The predecessor never solved tab/panel ARIA linkage at all, and Kit's own `kit-tab`/`kit-tab-group` (built before this component existed) left `aria-controls` wiring as a manual task for the consumer. Now that `kit-tab-panel` exists and already has to find its matching `kit-tab` (by `value`) to determine visibility, it has everything needed to close that gap automatically.
**Decision:** On connecting to its paired group, `kit-tab-panel` finds the `kit-tab` whose `value` matches its own, assigns ids to itself and/or the tab if either is missing, and sets `aria-controls` on the tab and `aria-labelledby` on itself — but only if the corresponding attribute isn't already present, so a consumer's own explicit wiring (or a pre-set `id`) is never clobbered.
**Why:** This is exactly the kind of accessibility completeness a dedicated component should provide by default; leaving it manual was only ever a stopgap for when no panel component existed yet. The "don't overwrite" guard keeps it safe for consumers who want to set their own ids/attributes for other reasons (e.g. deep-linking to a specific panel).
**Processed:** yes

## kit-tab-group — change event now fires for externally-set value, not just interactive selection

**Tag:** architecture
**Audience:** internal
**Symptom/question:** `kit-tab-group`'s `updated()` already re-synced slotted tabs when `value` was set externally (`group.value = 'x'`), mirroring `kit-radio-group`'s equivalent path — but that path never dispatched `change`, only the internal `_selectTab()` (click/keyboard) did. Building `kit-tab-panel`, which listens for `change` to know when to swap visibility, surfaced this as a real gap: a panel would go stale if a consumer drove tab selection by setting `.value` directly instead of clicking/using the keyboard.
**Decision:** `updated()` now also dispatches `change` when it detects and applies an externally-set `value` (guarded so it can't double-fire alongside `_selectTab()`'s own dispatch, since by the time `updated()` runs after an interactive selection, the group and its tabs are already back in sync).
**Why:** `kit-tab-group`'s own docs already promise consumers can "switch panel visibility off the `change` event" — that contract wasn't actually true for the programmatic-selection case until this fix. Deliberately not carried back into `kit-radio-group`: a form doesn't need a `change` event for every programmatic value assignment the way a panel-switcher does, and radio-group's existing asymmetry is established, tested behavior with its own consumers already depending on it.
**Processed:** yes

## kit-accordion-item / kit-accordion — not reusing kit-tab-panel's id-pairing model

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** Before starting, considered whether an accordion panel could reuse `kit-tab-panel`'s decoupled-by-id pairing (a panel matched to its trigger by a shared id, so it can live anywhere on the page relative to the thing that controls it).
**Decision:** `kit-accordion-item` renders its own header and panel together, in one component — no separate panel element, no id-matching.
**Why:** `kit-tab-panel`'s indirection earns its keep because a tab strip and its single active panel are commonly positionally separate (tabs in a header, panel content lower in the layout), and only one panel is ever visible at once. An accordion item's header and body are always a co-located pair — potentially several open simultaneously — so there's no "lives elsewhere on the page" case to design for, and the id-matching/async-connect machinery would only add indirection for nothing gained.

## kit-accordion — multiple items open by default, single-open is opt-in

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** The predecessor `fs-accordion` has no group-level coordination at all — every `fs-accordion-item` is fully independent, with no way to make opening one close the others. Whether `kit-accordion` should support that exclusivity at all, and if so whether it should be the default, was a real fork (asked and decided with the user before building).
**Decision:** Items are open/closed independently by default, matching the predecessor. `kit-accordion` adds an opt-in `single` boolean — when set, opening one item closes every other item in the group, the same mutual exclusivity `kit-tab-group` enforces between tabs.
**Why:** Multi-open is the more common accordion default and matches the only prior art in this codebase. Making exclusivity opt-in rather than baking in one fixed behavior covers both real use cases (an FAQ list where several answers can be open at once, vs. a space-constrained settings panel where only one section should show at a time) without forcing either shape on every consumer.

## kit-accordion-item — role="heading" wrapper with configurable heading-level

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** The predecessor `fs-accordion-item` never wraps its header in heading semantics at all — a screen reader user navigating by heading has no way to jump between accordion sections, which the ARIA APG accordion pattern calls for (each header nested in a heading element).
**Decision:** Added a `heading-level` property (default 3), rendered as a `role="heading"` + `aria-level` wrapper around the header button, rather than a literal `<h3>` (or similar) tag.
**Why:** The correct heading level depends on where a consumer places the accordion in their own page's heading outline, which a fixed tag name couldn't adapt to — `role="heading"` + `aria-level` gives the same semantics as a real heading tag while staying configurable, and isn't capped at `aria-level="6"` the way literal heading tags are.

## kit-accordion-item — closed panel is inert, not just visually collapsed

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** The predecessor `fs-accordion-item` tries to keep a closed panel's content out of the tab order by setting `tabindex` on the `<slot>` element itself. That doesn't work — a `<slot>`'s own `tabindex` attribute has no effect on the focusability of the nodes assigned to it, so its collapsed panels stay fully keyboard-reachable (and exposed to assistive tech) despite being visually hidden.
**Decision:** `kit-accordion-item` applies the `inert` attribute to the panel region while closed.
**Why:** `inert` genuinely removes everything inside it from both the tab order and the accessibility tree, regardless of what a consumer slots in — no need to walk arbitrary slotted content and set `tabindex` on each focusable descendant by hand. Broadly supported across the browsers this repo tests against (Chromium/Firefox/WebKit via Playwright).

## kit-accordion-item — dispatches 'change', not 'toggle'

**Tag:** other
**Audience:** consumer
**Symptom/question:** The obvious name for the item's own state-change event was `toggle`. TypeScript's DOM lib defines a global `ToggleEvent` type for the native `toggle` event (fired by `<details>` and the Popover API) and maps it in `HTMLElementEventMap`, so `addEventListener('toggle', ...)` resolves to `ToggleEvent` rather than `Event`/`CustomEvent` — `event.detail` doesn't exist on it, and TypeScript flagged even this repo's own test code as an unsafe cast.
**Decision:** Renamed the event to `change`, matching `kit-tab-group`/`kit-radio-group`'s existing convention, with `detail: { open, value }`.
**Why:** Keeping `toggle` would have pushed the same unsafe-cast problem onto every consumer listening in TypeScript, not just this repo's tests. `change` sidesteps the native-type collision entirely and stays consistent with how every other grouped/stateful Kit component already names its state-change event.

## kit-accordion-item — panel padding lives on a nested part, not the overflow:hidden element

**Tag:** other
**Audience:** internal
**Symptom/question:** Built the collapse/expand animation with a CSS grid `0fr`/`1fr` trick on `[part='panel']`, originally with `overflow: hidden` and the panel's padding both on the same element (`[part='panel-inner']`, the grid item). A closed item still rendered with a visible sliver of height and content, exactly equal to its padding-bottom — caught visually testing in Storybook (a "single open" story showed every closed panel's text peeking through), not by the automated tests, which never asserted a pixel height.
**Decision:** Split the grid item into two layers: the outer one (`[part='panel-inner']`) keeps only `overflow: hidden` and `min-height: 0`, and a new inner `[part='content']` carries the padding.
**Why:** A grid item's padding is part of its own generated box and contributes to the row's automatic minimum size regardless of `overflow: hidden` — only content can be clipped away by overflow, not the box's own padding. Moving the padding one level deeper, inside the clipped element rather than on it, lets the outer box's intrinsic size actually reach zero so the `0fr` track collapses fully, while `overflow: hidden` on the parent still visually hides the now off-flow inner content. `min-height: 0` on the outer layer was also required, since a grid item's default `min-height: auto` otherwise floors it at its min-content size independent of the row's track size.

## kit-accordion-item — real <button> per header, no roving tabindex across items

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** `kit-tab-group`'s established pattern (shared by `kit-tab` and `kit-radio-group`'s `kit-radio`) is a single Tab stop for the whole group, with roving tabindex and manual keydown-based activation on a `role="tab"`/`role="radio"` element. Accordion headers don't share that shape — the ARIA APG accordion pattern expects every header to remain its own Tab stop, with arrow keys only moving focus (never roving tabindex) and Home/End jumping to the ends.
**Decision:** `kit-accordion-item` renders a real native `<button>` for its header — getting focus, native `disabled` semantics, and Enter/Space activation for free — instead of a `role="tab"`-style element with manually-managed tabindex/keydown handling. `kit-accordion`'s own keydown handler only moves focus on arrow keys/Home/End; it never touches any item's tabindex.
**Why:** A native button is simpler and more correct here, since accordion doesn't need — and per APG shouldn't have — the single-Tab-stop composite-widget behavior that makes roving tabindex necessary for tabs and radios. Copying `kit-tab-group`'s roving-tabindex shape anyway would have made every header but one unreachable via Tab, which is wrong specifically for accordions.

## kit-heading — new component, extracted from kit-accordion-item's one-off heading wrapper

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** `kit-accordion-item` originally solved its own heading semantics inline (a `role="heading"`/`aria-level` div). The user didn't want that solved one-off and asked for a reusable heading component instead, pointing at the predecessor's `fs-heading` as prior art: it decouples the semantic tag (`as`, real `h1`–`h6` or `div`, via `lit/static-html`) from a visual style variant (`type`: display/title1–6).
**Decision:** Built `kit-heading` as its own component — `level` (1–6, clamped) picks a real, literal `hN` tag (never `role="heading"`); `size` (`sm`/`base`/`lg`/`xl`) is the independent visual override, defaulting to a level-derived value (1→xl, 2→lg, 3–4→base, 5–6→sm) rather than fs-heading's fixed `type: 'display'` default regardless of `as`. `kit-accordion-item`'s old role=heading div was replaced with a real `<kit-heading>` wrapping the trigger button.
**Why:** Real semantic heading elements are more broadly and reliably understood by assistive tech than `role="heading"` emulation, so once a dedicated component existed there was no reason to keep the ARIA-role stand-in. Deriving the default `size` from `level` (rather than fs-heading's single fixed default) means the common case — no explicit visual override — still looks like a heading at every level out of the box, instead of requiring a consumer to set two props together to get a sane result. Kit's own design system has no heading type scale yet (`design-reference/tokens/typography.css` only defines `--font-size-sm/base/lg/xl`, no display/title steps), so `size` maps onto those 4 existing tokens rather than porting fs-heading's 7-step scale — nothing to port from a design system that doesn't spec this component yet.

## kit-heading — hardcoded font-weight, not a --font-weight-\* token

**Tag:** theming
**Audience:** internal
**Symptom/question:** The design system's exported `design-reference/tokens/typography.css` documents `--font-weight-regular`/`--font-weight-medium` custom properties. Went to use `--font-weight-medium` for heading text, but neither token actually exists in the shipped `src/styles/variables.css` — every existing component that needs a heavier weight (`kit-tab`'s selected state, `kit-radio-group`'s legend) hardcodes a raw number instead.
**Decision:** `kit-heading` hardcodes `font-weight: 600`, matching the rest of the library's existing convention, instead of referencing a custom property that doesn't exist in this codebase yet.
**Why:** Referencing an undefined custom property fails silently (the declaration is just dropped, no error), which would have been a quiet bug. Introducing the real tokens into `variables.css` to close this gap felt like its own separate, broader change (a typography-token migration affecting every component with a hardcoded weight) rather than something to take on as a side effect of building one new component.

## kit-accordion-item — button uses font-size/font-weight: inherit, not its own hardcoded values

**Tag:** architecture
**Audience:** internal
**Symptom/question:** After wrapping the trigger `<button>` in `<kit-heading>`, the button still visually ignored whatever level/size `kit-heading` resolved to — the accordion header text stayed the same size regardless of `heading-level`. Cause: the button already had its own hardcoded `font-size: var(--font-size-base)` (from before `kit-heading` existed), which simply overrode whatever the wrapping `hN` element's CSS specified.
**Decision:** Changed the button's `font-size` and `font-weight` to `inherit`, letting them cascade from `kit-heading`'s internal `hN` element through slot assignment (inherited CSS properties flow through the flattened/rendered tree, not the light-DOM tree, so a slotted button does pick up its slot parent's font styles once nothing on the button itself overrides them).
**Why:** The entire point of threading `heading-level` through the accordion is for it to visibly change the rendered size — a hardcoded value on the slotted button silently defeated that. This is easy to reintroduce by accident (any future hardcoded `font-size`/`font-weight` on slotted content inside a `kit-heading` will silently win over the heading's own styling), worth knowing going in rather than re-debugging.

## kit-accordion — heading-level lives on the group, cascades to items

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** With `kit-heading` in place, `kit-accordion-item` still had its own per-item `heading-level` property. Whether `kit-accordion` should get a matching group-level property that pushes down to every item, versus leaving it purely per-item, was a real fork (asked and decided with the user).
**Decision:** `kit-accordion` gained its own `heading-level` property (default 3). On first render and on any subsequent change (including new items slotted in later), it overwrites every child item's `heading-level` unconditionally.
**Why:** Every item in a given accordion instance is virtually always at the same outline depth in practice, so requiring a consumer to repeat `heading-level` on every single item is pure boilerplate for the common case. Chose unconditional overwrite (not "only fill in if the item didn't set its own") to keep the contract simple and match the precedent set by `kit-tab-group`'s `_applyValueToTabs()`-style broadcast, rather than adding a per-item-override escape hatch nothing has asked for yet.

## kit-heading — size scale ported from the predecessor's --heading-_ tokens, not the general --font-size-_ scale

**Tag:** theming
**Audience:** consumer
**Symptom/question:** `kit-heading` originally reused Kit's existing 4-step `--font-size-sm/base/lg/xl` scale for its `size` prop, since that was the only font-size scale in `variables.css` at the time. That only gave 6 heading levels 4 distinct sizes (levels 3–4 and 5–6 each collapsed onto the same value). The user explicitly asked to use the predecessor component library's own font sizes instead, pointing at `packages/web-components/src/assets/index.css`, which has a dedicated 7-step `--heading-display`/`--heading-title1`–`title6` scale (each paired with its own `-leading` line-height) — exactly the same category names `fs-heading`'s own `type` prop used.
**Decision:** Ported that scale into `src/styles/variables.css` as its own `--heading-*` token namespace (converted px → rem, kept the predecessor's naming), separate from `--font-size-*`. `kit-heading`'s `size` union changed to `'display' | 'title1'..'title6'`, defaulting to `titleN` for the matching level (no more collapsing) — `display` is the one step nothing defaults to, opt-in only, for hero/marquee text bigger than any level's own default.
**Why:** This repo's usual default is to re-derive against Kit's own tokens rather than port predecessor literals verbatim — the instruction here was an explicit, knowing exception to that default made for this one case, not a general license to start porting fs-_ values elsewhere. Kept `--heading-_`as its own namespace rather than folding these into`--font-size-_`: the two scales serve different things (body/UI text like button labels and error text vs. heading sizes specifically), and conflating them would force every `--font-size-_`consumer to wade through heading-sized options irrelevant to them. Carried the paired`-leading` line-height values along with the sizes, not just the raw font-size numbers — they're bundled together in the source for a reason (a 36px heading needs different line-height than a 14px one to read well), and dropping them would've left the ported scale visually worse than the source it came from.

## Embeddings index generated locally, not committed

**Tag:** architecture
**Audience:** internal
**Symptom/question:** embeddings.json will grow with the corpus and gets regenerated any time docs or components change, a git-tracked copy would produce large, unreadable diffs on every run.
**Decision:** chunks.json and embeddings.json are gitignored. embeddings.json gets uploaded directly to S3 for the Lambda to load, not shipped through git or the Storybook build.
**Why:** both files are fully reproducible from source (docs, custom-elements.json, and one API call), so there's nothing lost by not versioning them, and it keeps the repo's history clean.
