import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles, disabledStyles } from '../../styles/utilities.js';
import { tabStyles } from './tab.styles.js';

/**
 * A single tab. Not interactive selection logic on its own beyond its own
 * click/keydown — pair it with `kit-tab-group`, which owns mutual
 * exclusivity, roving-tabindex keyboard navigation, and orientation for its
 * slotted `kit-tab` children.
 *
 * kit-tab does not manage any associated panel content. Pair each tab with
 * its panel elsewhere in the page using a standard `aria-controls` attribute
 * (e.g. `<kit-tab aria-controls="panel-1">`) and switch panel visibility
 * off the group's `value`/`change` event.
 *
 * @slot - The tab's label content
 *
 * @csspart tab - The tab element
 */
@customElement('kit-tab')
export class KitTab extends KitElement {
	static styles = [baseStyles, tabStyles, disabledStyles];

	/**
	 * Whether this tab is the selected one in its group.
	 */
	@property({ type: Boolean, reflect: true })
	selected = false;

	/**
	 * Whether this tab is disabled.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * An identifier for this tab, surfaced as kit-tab-group's `value` when
	 * this tab is selected.
	 */
	@property({ type: String })
	value = '';

	private _handleClick() {
		if (!this.disabled) {
			this.selected = true;
		}
	}

	private _handleKeydown(event: KeyboardEvent) {
		if ((event.key === ' ' || event.key === 'Enter') && !this.disabled) {
			event.preventDefault();
			this.selected = true;
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('click', this._handleClick);
		this.addEventListener('keydown', this._handleKeydown);

		this.setAttribute('role', 'tab');
		this.setAttribute('tabindex', '-1');
		this.setAttribute('aria-disabled', String(this.disabled));
		this.setAttribute('aria-selected', String(this.selected));
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);

		if (changedProperties.has('selected')) {
			this.setAttribute('aria-selected', String(this.selected));
		}

		if (changedProperties.has('disabled')) {
			this.setAttribute('aria-disabled', String(this.disabled));
		}
	}

	render() {
		return html`
			<span part="tab" id="tab">
				<slot></slot>
			</span>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-tab': KitTab;
	}
}
