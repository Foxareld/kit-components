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
