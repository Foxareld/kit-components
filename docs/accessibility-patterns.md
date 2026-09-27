# Accessibility Patterns

## "Why do arrow keys immediately select a tab in `kit-tab-group`, instead of just moving focus?"

<!-- tag: accessibility, audience: consumer -->

WAI-ARIA APG allows either activation model for tabs — automatic (arrow keys move focus and select in the same step) or manual (arrow keys only move focus, a separate Enter/Space press selects) — recommending manual activation mainly when moving to a tab triggers an expensive operation, like a network fetch for panel content.

`kit-tab-group` uses automatic activation: arrow keys move focus and select the tab in the same step, and Space/Enter also select for when a tab is reached via Tab key rather than arrows. Kit doesn't know what a given consumer's panel switch costs, but automatic activation is the more common, expected default for tabs, and it matches `kit-radio-group`'s existing behavior — keeping keyboard interaction consistent across Kit's grouped-selection components rather than introducing a second interaction model.

## "Why does `kit-tab-group` support Home/End when `kit-radio-group` doesn't?"

<!-- tag: accessibility, audience: consumer -->

`kit-radio-group` has no Home/End support, but the WAI-ARIA APG tabs pattern specifically calls for Home/End to jump to the first/last tab as part of a tablist's expected keyboard support — unlike the radio pattern as Kit implements it.

Home/End handling was added to `kit-tab-group`'s keydown handler, jumping to the first/last enabled tab. This is spec-required behavior for the tablist widget specifically, not a gap being carried over for consistency's sake, and it was cheap to add once arrow-key navigation already existed.

## kit-tab-panel starts hidden synchronously, before its paired group resolves

<!-- tag: accessibility, audience: internal -->

Resolving the paired `kit-tab-group` and reading its `value` happens asynchronously (`await group.updateComplete`, since the group may not have finished picking its own default-selected tab yet). If a panel defaulted to visible until that resolution finished, multiple panels could theoretically render visible together for that brief window.

`kit-tab-panel` now sets `hidden = true` synchronously in `connectedCallback()`, before the async group resolution even starts, then corrects it once the real value is known — cheap insurance that "at most one panel visible" holds at every observable point, rather than relying on the resolution being fast enough in practice to not matter.

## "Do I need to manually wire aria-controls/aria-labelledby between kit-tab and kit-tab-panel?"

<!-- tag: accessibility, audience: consumer -->

`kit-tab`/`kit-tab-group` originally left `aria-controls` wiring as a manual task for the consumer. Once `kit-tab-panel` existed and already had to find its matching `kit-tab` (by `value`) to determine visibility, it had everything needed to close that gap automatically.

On connecting to its paired group, `kit-tab-panel` now finds the `kit-tab` whose `value` matches its own, assigns ids to itself and/or the tab if either is missing, and sets `aria-controls` on the tab and `aria-labelledby` on itself — but only if the corresponding attribute isn't already present, so your own explicit wiring (or a pre-set `id`) is never clobbered. This is the kind of accessibility completeness a dedicated panel component should provide by default, and the "don't overwrite" guard keeps it safe if you want your own ids/attributes for other reasons, like deep-linking to a specific panel.

## "Why does `kit-accordion-item` use `role="heading"` instead of a real `hN` tag for its header?"

<!-- tag: accessibility, audience: consumer -->

Without heading semantics wrapping each header, a screen reader user navigating by heading has no way to jump between accordion sections — the ARIA APG accordion pattern calls for each header to be nested in a heading element.

`kit-accordion-item` adds a `heading-level` property (default 3), rendered as a `role="heading"` + `aria-level` wrapper around the header button, rather than a literal `<h3>`-style tag. The correct heading level depends on where a consumer places the accordion in their own page's heading outline, which a fixed tag name couldn't adapt to — `role="heading"` + `aria-level` gives the same semantics as a real heading tag while staying configurable, and isn't capped at `aria-level="6"` the way literal heading tags are.

## "Can I still Tab into, or have a screen reader read, a closed `kit-accordion-item`'s panel?"

<!-- tag: accessibility, audience: consumer -->

Merely hiding a closed panel's content visually, or trying to keep it out of the tab order by setting `tabindex` on a `<slot>` element, doesn't actually work — a `<slot>`'s own `tabindex` attribute has no effect on the focusability of the nodes assigned to it, so the panel's content would stay fully keyboard-reachable and exposed to assistive tech despite being visually collapsed.

`kit-accordion-item` applies the `inert` attribute to the panel region while it's closed instead. `inert` genuinely removes everything inside it from both the tab order and the accessibility tree, regardless of what a consumer slots in, with no need to walk arbitrary slotted content and set `tabindex` on each focusable descendant by hand. It's broadly supported across the browsers this library tests against (Chromium, Firefox, WebKit).

## "Why can I Tab to every `kit-accordion-item` header, instead of just one like `kit-tab-group`'s tabs?"

<!-- tag: accessibility, audience: consumer -->

`kit-tab-group`'s pattern (shared by `kit-tab` and `kit-radio-group`'s `kit-radio`) gives the whole group a single Tab stop, with roving tabindex and manual keydown-based activation on a `role="tab"`/`role="radio"` element. Accordion headers don't share that shape — the ARIA APG accordion pattern expects every header to remain its own Tab stop, with arrow keys only moving focus (never roving tabindex) and Home/End jumping to the ends.

`kit-accordion-item` renders a real native `<button>` for its header instead of a `role="tab"`-style element with manually-managed tabindex/keydown handling, getting focus, native `disabled` semantics, and Enter/Space activation for free. `kit-accordion`'s own keydown handler only moves focus on arrow keys/Home/End; it never touches any item's tabindex. A native button is simpler and more correct here, since accordion doesn't need — and per APG shouldn't have — the single-Tab-stop composite-widget behavior that makes roving tabindex necessary for tabs and radios; copying that shape anyway would have made every header but one unreachable via Tab, which is wrong specifically for accordions.
