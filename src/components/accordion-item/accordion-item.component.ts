import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles, disabledStyles } from '../../styles/utilities.js';
import { accordionItemStyles } from './accordion-item.styles.js';
import '../icon/icon.component.js';
import '../heading/heading.component.js';

let itemIdCounter = 0;

/**
 * A single collapsible header/panel pair. Self-contained and independently
 * usable — it owns its own `open` state and toggles itself on click, so it
 * works standalone without a parent `kit-accordion`.
 *
 * Pair several under `kit-accordion` for arrow-key navigation between
 * headers and, opt-in via `single`, mutual exclusivity. `kit-tab-panel`'s
 * decoupled-by-id pairing model doesn't apply here: a header and its panel
 * are always a co-located pair, never positionally separate the way a tab
 * strip and its panel can be.
 *
 * @slot header - The header content (the always-visible clickable label)
 * @slot - The panel content, shown when open
 *
 * @fires change - Fired on toggle, `detail: { open, value }`
 *
 * @csspart header - The kit-heading wrapping the trigger button
 * @csspart trigger - The toggle button
 * @csspart icon - The expand/collapse chevron
 * @csspart panel - The panel region (the collapse/expand animation target)
 * @csspart content - The padded wrapper around the slotted panel content
 */
@customElement('kit-accordion-item')
export class KitAccordionItem extends KitElement {
	static styles = [baseStyles, accordionItemStyles, disabledStyles];

	private _headerId = `kit-accordion-item-header-${++itemIdCounter}`;
	private _panelId = `kit-accordion-item-panel-${itemIdCounter}`;

	/**
	 * Whether the panel is expanded.
	 */
	@property({ type: Boolean, reflect: true })
	open = false;

	/**
	 * Whether this item is disabled — the header button can't be toggled.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * An identifier for this item, surfaced in the `toggle` event detail.
	 */
	@property({ type: String })
	value = '';

	/**
	 * The level of the `kit-heading` wrapping the trigger button. Set this
	 * to match where the accordion sits in the surrounding page's heading
	 * outline (defaults to 3, i.e. nested under a page's h2 sections). When
	 * this item is inside a `kit-accordion`, the group's own `heading-level`
	 * overwrites this on every item — set it there instead of per item.
	 */
	@property({ type: Number, attribute: 'heading-level' })
	headingLevel = 3;

	private _handleClick() {
		if (this.disabled) return;

		this.open = !this.open;
		// Named 'change' (matching kit-tab-group/kit-radio-group), not
		// 'toggle' — 'toggle' collides with the DOM's own ToggleEvent
		// (dispatched by <details>/popover), which isn't a CustomEvent and
		// has no `detail`, so a consumer's TS would fight the built-in
		// HTMLElementEventMap['toggle'] type on every listener.
		this.dispatchEvent(
			new CustomEvent('change', {
				bubbles: true,
				composed: true,
				detail: { open: this.open, value: this.value },
			})
		);
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);

		if (changedProperties.has('disabled')) {
			this.setAttribute('aria-disabled', String(this.disabled));
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.setAttribute('aria-disabled', String(this.disabled));
	}

	/**
	 * Moves focus to the header button.
	 */
	focus(options?: FocusOptions) {
		this.renderRoot.querySelector<HTMLButtonElement>('button')?.focus(options);
	}

	render() {
		return html`
			<kit-heading part="header" level=${this.headingLevel}>
				<button
					type="button"
					part="trigger"
					id=${this._headerId}
					aria-expanded=${this.open}
					aria-controls=${this._panelId}
					?disabled=${this.disabled}
					@click=${this._handleClick}
				>
					<slot name="header"></slot>
					<kit-icon
						name="chevron-down"
						size="small"
						part="icon"
						class=${classMap({ icon: true, open: this.open })}
					></kit-icon>
				</button>
			</kit-heading>
			<div
				part="panel"
				id=${this._panelId}
				role="region"
				aria-labelledby=${this._headerId}
				?inert=${!this.open}
			>
				<div part="panel-inner">
					<div part="content">
						<slot></slot>
					</div>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-accordion-item': KitAccordionItem;
	}
}
