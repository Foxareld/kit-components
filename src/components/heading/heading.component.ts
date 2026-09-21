import { literal, html as staticHtml } from 'lit/static-html.js';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles } from '../../styles/utilities.js';
import { headingStyles } from './heading.styles.js';

export type HeadingSize =
	| 'display'
	| 'title1'
	| 'title2'
	| 'title3'
	| 'title4'
	| 'title5'
	| 'title6';

const LEVEL_TAGS = {
	1: literal`h1`,
	2: literal`h2`,
	3: literal`h3`,
	4: literal`h4`,
	5: literal`h5`,
	6: literal`h6`,
} as const;

const LEVEL_SIZES: Record<1 | 2 | 3 | 4 | 5 | 6, HeadingSize> = {
	1: 'title1',
	2: 'title2',
	3: 'title3',
	4: 'title4',
	5: 'title5',
	6: 'title6',
};

/**
 * Renders a real `hN` element (never `role="heading"`), keeping the
 * semantic document-outline level (`level`) independent of visual size
 * (`size`) — set `size` explicitly when a heading needs to look bigger or
 * smaller than its outline position implies. `size` defaults to `titleN`
 * for the matching level (level 1 → `title1`, etc.) rather than a single
 * fixed style regardless of level, so the common case (no visual override)
 * still looks like a heading at every level out of the box. `display`
 * (the largest step, bigger than any level's own default) is opt-in only —
 * set `size="display"` for hero/marquee-style text at any level.
 *
 * @slot - The heading text
 *
 * @csspart heading - The rendered hN element
 */
@customElement('kit-heading')
export class KitHeading extends KitElement {
	static styles = [baseStyles, headingStyles];

	/**
	 * The semantic heading level (1–6), rendered as that literal `hN` tag.
	 * Clamped to 1–6.
	 */
	@property({ type: Number })
	level = 2;

	/**
	 * Visual size, independent of `level`. Defaults to `titleN` for the
	 * matching level when unset.
	 */
	@property({ type: String })
	size: HeadingSize | '' = '';

	private get _resolvedSize(): HeadingSize {
		return this.size || LEVEL_SIZES[this._resolvedLevel];
	}

	private get _resolvedLevel(): 1 | 2 | 3 | 4 | 5 | 6 {
		return Math.min(6, Math.max(1, Math.round(this.level))) as
			| 1
			| 2
			| 3
			| 4
			| 5
			| 6;
	}

	render() {
		const tag = LEVEL_TAGS[this._resolvedLevel];

		return staticHtml`
			<${tag}
				part="heading"
				class=${classMap({ heading: true, [`size-${this._resolvedSize}`]: true })}
			>
				<slot></slot>
			</${tag}>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-heading': KitHeading;
	}
}
