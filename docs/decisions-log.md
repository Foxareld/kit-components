## kit-dropdown — disableTrigger vs. a new disabled property
**Tag:** architecture
**Audience:** consumer
**Symptom/question:** Wanted a disabled dropdown trigger (e.g. a `kit-button`) to show its own disabled styling. The existing `disableTrigger` property looked like the obvious place to add this, but it only suppresses the automatic click-to-toggle wiring — the trigger stays fully interactive by design, since it exists for cases like a search-input trigger where opening is driven by something else internal to it (a separate icon button), not by clicking the input itself.
**Decision:** Added a separate `disabled` property instead of repurposing `disableTrigger`. `disabled` blocks opening entirely (trigger click and `toggle()` both no-op) and sets `disabled`/`aria-disabled` on the assigned trigger element(s) so components like `kit-button` render their own disabled state. `disableTrigger` keeps its original, narrower meaning unchanged.
**Why:** Repurposing `disableTrigger` to also disable the trigger would have broken the exact case it was added for. Keeping them separate means each property does one thing, and neither has to guess at the other's intent.

## kit-dropdown — forcing open=false on disable without a double render
**Tag:** forms
**Audience:** internal
**Symptom/question:** When `disabled` becomes true while the dropdown is open, it needs to close. Setting `this.open = false` as a side effect inside `updated()` works, but mutating a reactive property inside `updated()` schedules a second, visible update cycle (Lit's "change-in-update" warning) — this repo's CLAUDE.md specifically calls this out as a bug pattern to avoid.
**Decision:** Moved the `disabled → open = false` forcing into `willUpdate()` instead of `updated()`, so the same render cycle already reflects the closed state.
**Why:** `willUpdate()` runs before Lit commits the render, so a property mutated there is visible to the rest of that same update pass — no extra cycle, no dev-mode warning. Confirmed empirically: after the fix, `dropdown.test.ts`'s browser console shows no change-in-update warning, unlike a few other components in this repo that have one from an unrelated (accepted) mount-time cascade.

## Form-associated components — compute validity in willUpdate(), not updated()
**Tag:** forms
**Audience:** internal
**Symptom/question:** `kit-input` originally computed/mirrored its validity state in `updated()`. Since `updated()` runs after the DOM is already committed, mutating anything there just schedules a second update instead of showing up in the current one — the invalid-state UI (error text, error styling) lagged a full cycle behind the change that caused it. Worse, the resulting repeating "change-in-update" cascade combined badly with mocha's fixture teardown and hung Web Test Runner indefinitely rather than just failing a test — this cost real debugging time before the actual cause (wrong lifecycle hook) was found.
**Decision:** Compute/mirror validity in `willUpdate()` instead, for every form-associated component (`kit-input`, `kit-radio-group`). Both also sync the submitted form value via `internals.setFormValue()` in `updated()`, which is fine there since it isn't render-dependent.
**Why:** `willUpdate()` runs before render, so the same render cycle already reflects fresh validity — no extra cycle, no cascade. The one place a mount-time cascade is unavoidable and accepted: `kit-radio-group` has to read which slotted `kit-radio` child has `checked` to set its own initial `value`, and `@queryAssignedElements` can't see slotted content before the first render — so that resolution happens in `firstUpdated()` instead, producing a single bounded follow-up cycle at mount, not a recurring one from user interaction. `@open-wc/testing`'s `fixture()` already waits through that correctly.

## Form-associated components — public validity-mutating methods must call requestUpdate()
**Tag:** forms
**Audience:** internal
**Symptom/question:** Even after fixing the `willUpdate()` cascade above, `setCustomValidity()` and other methods that mutate `ElementInternals` directly still seemed to intermittently fail to update the DOM. `checkValidity()` reflected the change correctly, but the invalid-state UI didn't repaint. It "worked" in isolated tests only because an unrelated property change happened to be triggering a render at the same time, and silently failed the moment a form called `setCustomValidity()` a second time with nothing else changing.
**Decision:** Any public method that mutates `ElementInternals` directly (`setCustomValidity`, a public `setValidity`) must end with `this.requestUpdate()`.
**Why:** Those calls don't touch a reactive `@property`/`@state`, so Lit has no way to know on its own that a re-render is needed — the change is real and immediately visible to `checkValidity()`, but invisible in the DOM until something else happens to trigger a render.

## kit-select — slotted kit-option children vs. a data-driven options array
**Tag:** architecture
**Audience:** consumer
**Symptom/question:** The design system's own spec (a React recreation) takes `options={[...]}` as a prop. That shape doesn't translate cleanly to a framework-agnostic web component — a plain JS array can't be set declaratively from an HTML attribute, only via a JS property binding.
**Decision:** `kit-select` takes slotted `kit-option` children instead, the same shape as `kit-radio-group` + `kit-radio`. `kit-select` owns the listbox, roving-tabindex keyboard navigation, selection, and form participation; `kit-option` is presentational only, mirroring `kit-radio`'s split.
**Why:** This is Kit's own already-established, tested, accessible pattern for exactly this "collection of choices" shape — reusing it beats introducing a second, React-flavored convention for one component. The design doc's prop shape is explicitly a translation aid ("encodes intended composition, prop shapes"), not a literal API to port.

## kit-select — no built-in filtering/type-to-search
**Tag:** architecture
**Audience:** consumer
**Symptom/question:** An editable-combobox mode with as-you-type filtering was a real option to build, but the Kit design system's own spec for Select draws a simple non-editable button-triggered listbox — it doesn't call for filtering at all.
**Decision:** Built the simpler select-only combobox the design actually specs — a `<button>` trigger, no text input, no filtering. Type-ahead (typing jumps to a matching option, doesn't filter the list) is included, since that's part of standard listbox keyboard support, not a search feature.
**Why:** Building the filtering variant would be scope creep against the actual design intent — a searchable variant is a genuinely different, larger component. It can be added later as an opt-in if a real consumer need shows up.

## kit-select — getUpdateComplete() must await kit-dropdown's own update cycle
**Tag:** forms
**Audience:** internal
**Symptom/question:** `select.test.ts` hung the whole file indefinitely (no test even reported a result) the same way `dropdown.test.ts` once did. Root cause: `kit-select` closes its internal `kit-dropdown` by setting `dropdownEl.open = false`, which schedules a Lit update on `kit-dropdown` — a separate custom element with its own independent update cycle. `await selectEl.updateComplete` only waits for `kit-select`'s own update, not its child's, so a test could observe `document.activeElement` before `kit-dropdown`'s own close/focus-return logic had actually run. That race then broke the next test's fixture teardown, producing the hang.
**Decision:** Overrode `getUpdateComplete()` on `kit-select` to additionally await the internal `kit-dropdown` element's own `updateComplete`, per Lit's documented pattern for awaiting descendant updates.
**Why:** This fixes the race for every consumer, not just tests — `await selectEl.updateComplete` now genuinely means "kit-select and everything it just told kit-dropdown to do have both settled." The alternative (only fixing it in test helpers) would leave the same footgun for real app code.

## kit-tab-group — not form-associated, despite following the radio-group reference pattern

**Tag:** architecture
**Audience:** internal
**Symptom/question:** `kit-tab-group`/`kit-tab` were built following `kit-radio-group`/`kit-radio` as the structural reference (slotted children, delegated click/keydown on the parent, roving tabindex) — the obvious question was whether to also extend `FormAssociatedElement` like radio-group does.
**Decision:** `kit-tab-group` and `kit-tab` both extend `KitElement` directly. No validity API, no `formResetCallback`, no form value submission.
**Why:** Tabs aren't a form control — a tablist doesn't submit a value to a server, it's a navigation/disclosure widget. `FormAssociatedElement`'s validity boilerplate (`checkValidity`, `willValidate`, etc.) would be dead API surface on a component that can never be invalid or required. The slotted-children-plus-delegated-events shape is what's worth reusing from radio-group, not the form plumbing on top of it.

## kit-tab-group — always keeps exactly one enabled tab selected

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** `kit-radio-group` allows "nothing checked" as a valid state (relevant for optional form fields). Tabs don't have an equivalent "nothing selected" state — a tablist with no visible active tab isn't a state any real tab UI has.
**Decision:** If no slotted `kit-tab` has `selected` set and no `value` is supplied, `kit-tab-group` selects the first enabled tab itself on `firstUpdated()`. This mirrors the predecessor `fs-tab-group`'s `_calculateCurrentIndexOrSelectFirst` behavior.
**Why:** Consumers shouldn't have to remember to mark one tab `selected` for the component to render sensibly — a tablist with a roving tabindex needs a tabbable tab regardless, so defaulting to the first enabled one keeps both the visuals and keyboard entry point correct out of the box.

## kit-tab-group — automatic activation (arrow keys select immediately), not manual

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** The predecessor `fs-tab-group` uses manual activation — arrow keys only move focus, and a separate Enter/Space press is needed to actually select a tab. Kit's own `kit-radio-group` (the in-repo reference for this composition shape) instead selects immediately on arrow-key movement.
**Decision:** `kit-tab-group` uses automatic activation, matching `kit-radio-group`: arrow keys move focus and select the tab in the same step. Space/Enter also select, for when a tab is reached via Tab key rather than arrows.
**Why:** WAI-ARIA APG allows either model, recommending manual activation only when moving to a tab triggers an expensive operation (e.g. a network fetch for panel content). Kit doesn't know what a consumer's panel switch costs, but automatic activation is the more common/expected default for tabs, and matching `kit-radio-group`'s existing behavior keeps keyboard behavior consistent across Kit's grouped-selection components rather than introducing a second interaction model for no in-repo precedent-driven reason.

## kit-tab-group — orientation and Home/End support, absent from kit-radio-group

**Tag:** accessibility
**Audience:** consumer
**Symptom/question:** Neither the predecessor `fs-tab-group` nor Kit's own `kit-radio-group` support a vertical layout with the correct arrow-key mapping, and `kit-radio-group` has no Home/End support. The WAI-ARIA APG tabs pattern (unlike the radio pattern as Kit implements it) explicitly specifies both: `aria-orientation` with orientation-appropriate arrow keys, and Home/End to jump to the first/last tab.
**Decision:** Added an `orientation: 'horizontal' | 'vertical'` property (reflected, drives both `aria-orientation` and which arrow-key pair navigates) and Home/End handling to `kit-tab-group`.
**Why:** This is spec-required behavior for the tablist widget specifically, not a gap being carried over for consistency's sake — vertical tabs are a common real layout (e.g. settings pages), and Home/End are cheap to support once arrow-key navigation already exists.

## kit-tab / kit-tab-group — no kit-tab-panel; panel wiring is left to the consumer

**Tag:** architecture
**Audience:** consumer
**Symptom/question:** Neither the predecessor `fs-tab`/`fs-tab-group` nor this Kit pair solve the tabpanel half of the tabs pattern — the predecessor has no panel component or `aria-controls` wiring at all. The question was whether Kit's version should introduce a `kit-tab-panel` to close that gap.
**Decision:** Scoped this work to `kit-tab` + `kit-tab-group` only, matching what was asked for. `kit-tab` doesn't manage panel content; consumers pair a tab with its panel using a standard `aria-controls` attribute (a plain global HTML attribute, so it just works without any special handling) and switch panel visibility off `kit-tab-group`'s `change` event / `value` property, demonstrated in the `WithPanels` story.
**Why:** A tabpanel component is a legitimately separate piece of scope (its own visibility/animation/lazy-render concerns) rather than a natural extension of the tab button itself — better added deliberately later if a consumer need shows up than bolted on speculatively here.
