import { html, type PropertyValues } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles } from '../../styles/utilities.js';
import { accordionStyles } from './accordion.styles.js';
import '../accordion-item/accordion-item.component.js';
import type { KitAccordionItem } from '../accordion-item/accordion-item.component.js';

/**
 * Groups kit-accordion-item children, adding arrow-key navigation between
 * headers (Up/Down move focus, Home/End jump to the ends — Tab still moves
 * through every header in document order, unlike kit-tab-group's roving
 * tabindex, since accordion headers are each independently tabbable per the
 * ARIA APG accordion pattern) and, opt-in via `single`, mutual exclusivity.
 *
 * Items are independently functional without a parent kit-accordion at all
 * — multiple can be open at once by default. Set `single` to close every
 * other item whenever one opens, matching kit-tab-group's behavior.
 *
 * `heading-level` is set once on the group and pushed down to every item's
 * own `heading-level`, overwriting it — so a consumer configures the
 * outline position for the whole accordion in one place instead of
 * repeating it per item.
 *
 * @slot - kit-accordion-item children
 *
 * @csspart root - The element carrying the items
 */
@customElement('kit-accordion')
export class KitAccordion extends KitElement {
	static styles = [baseStyles, accordionStyles];

	@queryAssignedElements({ selector: 'kit-accordion-item' })
	private _itemElements!: KitAccordionItem[];

	/**
	 * When true, opening one item closes every other item in the group.
	 * When false (the default), items open and close independently.
	 */
	@property({ type: Boolean, reflect: true })
	single = false;

	/**
	 * The heading level applied to every item's header, overwriting each
	 * item's own `heading-level`. Set this to match where the accordion
	 * sits in the surrounding page's heading outline.
	 */
	@property({ type: Number, attribute: 'heading-level' })
	headingLevel = 3;

	private get _enabledItems(): KitAccordionItem[] {
		return this._itemElements.filter((item) => !item.disabled);
	}

	private _applyHeadingLevel() {
		for (const item of this._itemElements) {
			item.headingLevel = this.headingLevel;
		}
	}

	private _handleChange(event: Event) {
		if (!this.single) return;

		const target = event.target as KitAccordionItem;
		if (!target.open) return;

		for (const item of this._itemElements) {
			if (item !== target) item.open = false;
		}
	}

	private _handleSlotChange() {
		this._applyHeadingLevel();
	}

	private _handleKeydown(event: KeyboardEvent) {
		const current = (event.target as HTMLElement)?.closest?.(
			'kit-accordion-item'
		) as KitAccordionItem | null;

		const enabled = this._enabledItems;
		if (enabled.length === 0) return;

		let nextIndex: number | null = null;
		const currentIndex = current ? enabled.indexOf(current) : -1;

		if (event.key === 'ArrowDown') {
			nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % enabled.length;
		} else if (event.key === 'ArrowUp') {
			nextIndex =
				currentIndex === -1
					? 0
					: (currentIndex - 1 + enabled.length) % enabled.length;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = enabled.length - 1;
		}

		if (nextIndex === null) return;

		event.preventDefault();
		enabled[nextIndex]?.focus();
	}

	/**
	 * If `single` and multiple items are declaratively marked `open`,
	 * keeps only the first and closes the rest. Only reconciles at mount —
	 * setting `.open = true` on a second item via script afterward while
	 * `single` is on relies on that item's own `change` event to close its
	 * siblings, same as a click would.
	 */
	protected firstUpdated(changedProperties: PropertyValues<this>) {
		super.firstUpdated(changedProperties);

		this._applyHeadingLevel();

		if (!this.single) return;

		let seenOpen = false;
		for (const item of this._itemElements) {
			if (!item.open) continue;
			if (seenOpen) {
				item.open = false;
			} else {
				seenOpen = true;
			}
		}
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);

		if (changedProperties.has('headingLevel')) {
			this._applyHeadingLevel();
		}
	}

	render() {
		return html`
			<div part="root" @change=${this._handleChange} @keydown=${this._handleKeydown}>
				<slot @slotchange=${this._handleSlotChange}></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-accordion': KitAccordion;
	}
}
