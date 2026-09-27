# Theming

## kit-heading hardcodes font-weight: 600 instead of referencing an undefined --font-weight-* token

<!-- tag: theming, audience: internal -->

Kit's own design system reference (`design-reference/tokens/typography.css`) documents `--font-weight-regular`/`--font-weight-medium` custom properties, but neither token actually exists yet in the shipped `src/styles/variables.css` — every existing component that needs a heavier weight (`kit-tab`'s selected state, `kit-radio-group`'s legend) hardcodes a raw number instead.

`kit-heading` hardcodes `font-weight: 600`, matching that existing convention, rather than referencing a custom property that doesn't exist in the codebase yet. Referencing an undefined custom property fails silently — the declaration is just dropped, no error — which would have been a quiet bug. Introducing the real tokens into `variables.css` to close this gap is its own separate, broader change (a typography-token migration affecting every component with a hardcoded weight), not something to take on as a side effect of building one new component.

## "Why does `kit-heading` have 7 size options (display, title1–title6) instead of just sm/base/lg/xl?"

<!-- tag: theming, audience: consumer -->

`kit-heading` originally reused Kit's existing 4-step `--font-size-sm/base/lg/xl` scale for its `size` prop, since that was the only font-size scale defined at the time. That only gave 6 heading levels 4 distinct sizes — levels 3–4 and 5–6 each collapsed onto the same value.

A dedicated 7-step scale was added instead: `--heading-display` and `--heading-title1` through `--heading-title6`, each paired with its own `-leading` line-height value, as its own token namespace in `src/styles/variables.css`, separate from `--font-size-*`. `kit-heading`'s `size` union changed to `'display' | 'title1'..'title6'`, defaulting to the matching `titleN` for each level, so no two levels collapse onto the same size anymore — `display` is the one step nothing defaults to, opt-in only, for hero/marquee text bigger than any level's own default. The two scales are kept separate because they serve different things — body/UI text like button labels and error text versus heading sizes specifically — and folding them together would force every `--font-size-*` consumer to wade through heading-sized options irrelevant to them. The line-height values are carried alongside the sizes, not just the raw font-size numbers, since a larger heading needs a different line-height to read well than a smaller one — dropping them would leave the scale visually worse.

## "I imported Kit's components but page styles using CSS variables like var(--color-danger) get no value"

<!-- tag: theming, audience: consumer -->

Kit's docs describe the CSS custom properties as auto-injected at `:root` whenever any component is imported, but that's only true when your bundler treats CSS imports as a side effect (Vite does, which is why this looks fine inside Storybook). For a plain `<script>` consumer, or a bundler with esbuild's default CSS handling, `variables.css` comes out as a separate file (`kit.css` or `dist/index.css`) that nothing automatically links into the page.

Components still render correctly either way, because every token has a fallback baked into the component CSS — but anything outside the components, like your own page styles referencing `var(--color-danger)`, silently gets no value. Link the emitted CSS file (`kit.css` / `dist/index.css`) explicitly in your page rather than relying on the import alone.

## "Text typed into kit-input is invisible (white on white/light grey) when the page sets color-scheme: dark"

<!-- tag: theming, audience: consumer -->

If your page sets `color-scheme: dark` or `light dark`, typed text in `kit-input` can render white on the input's light grey focus background, effectively invisible. `color-scheme` inherits through shadow DOM, and in dark mode the native `<input>`'s default text color (`fieldtext`) flips to white — but Kit's field background comes from its light-only tokens, and `kit-input` never sets its own text `color`, so it inherits whatever the page's color-scheme implies.

Until `kit-input` sets an explicit text color token on the field (flagged as a library fix), work around it by pinning `color-scheme: light` on the surface hosting the input, and painting your own light background behind it, rather than letting a dark page theme apply. Overriding Kit's text tokens instead doesn't work: a property like `--color-text-secondary` colors both the label (on the page background) and text inside the white field, so no single value reads correctly on both — a light surface matches what Kit's tokens are actually designed for.
