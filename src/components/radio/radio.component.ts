import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles, disabledStyles } from '../../styles/utilities.js';
import { radioStyles } from './radio.styles.js';

/**
 * A single radio button. Not form-associated on its own — pair it with
 * `kit-radio-group`, which owns selection, keyboard navigation, and form
 * participation for its slotted `kit-radio` children.
 *
 * @slot - The radio's label content
 *
 * @csspart radio - The circular indicator
 * @csspart label - The label container
 */
@customElement('kit-radio')
export class KitRadio extends KitElement {
	static styles = [baseStyles, radioStyles, disabledStyles];

	/**
	 * Whether this radio is checked.
	 */
	@property({ type: Boolean, reflect: true })
	checked = false;

	/**
	 * Whether this radio is disabled.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * The name of the radio group this radio belongs to. Informational only
	 * — grouping and mutual exclusivity are managed by the parent
	 * kit-radio-group, not by matching `name` values.
	 */
	@property({ type: String, reflect: true })
	name = '';

	/**
	 * The value submitted when this radio is the checked one in its group.
	 */
	@property({ type: String })
	value = '';

	private _handleClick() {
		if (!this.disabled) {
			this.checked = true;
		}
	}

	private _handleKeydown(event: KeyboardEvent) {
		if (event.key === ' ' && !this.disabled) {
			this.checked = true;
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('click', this._handleClick);
		this.addEventListener('keydown', this._handleKeydown);

		this.setAttribute('role', 'radio');
		this.setAttribute('tabindex', '-1');
		this.setAttribute('aria-disabled', String(this.disabled));
		this.setAttribute('aria-checked', String(this.checked));
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);

		if (changedProperties.has('checked')) {
			this.setAttribute('aria-checked', String(this.checked));
		}

		if (changedProperties.has('disabled')) {
			this.setAttribute('aria-disabled', String(this.disabled));
		}
	}

	render() {
		return html`
			<span id="input">
				<span part="radio" id="radio"></span>
				<span part="label" id="label"><slot></slot></span>
			</span>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-radio': KitRadio;
	}
}
