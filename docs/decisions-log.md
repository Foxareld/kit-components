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
**Decision:** Added Home/End handling to `kit-tab-group`'s keydown handler (jumps to the first/last *enabled* tab).
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
