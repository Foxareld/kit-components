# Integration Mistakes

## "I set kit-button type="submit" inside a form, but clicking it (or pressing Enter in kit-input) doesn't submit"

<!-- tag: forms, audience: consumer -->

Putting `kit-input` and `kit-button type="submit"` inside a `<form>`, neither clicking the button nor pressing Enter in the input submits it — no `submit` event fires, confirmed with real clicks and keypresses, not just a synthetic `dispatchEvent`.

Both components render their native `<button>`/`<input>` inside shadow DOM, where `.form` is `null`, so the browser's submit-button activation and implicit submission never reach the light-DOM form. `kit-input` itself is form-associated and its own `.form` is correct, but implicit submission is driven by the native control, not the host — `kit-button` isn't form-associated at all, so its `type` prop only changes the inner button's attribute and has no effect on a form. Until this is fixed at the component level (making `kit-button` form-associated and routing `submit`/`reset` through `ElementInternals.form`, plus Enter handling in `kit-input`), call `form.requestSubmit()` yourself from the button's `click` handler and the input's Enter `keydown` handler.
