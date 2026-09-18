import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles, disabledStyles } from '../../styles/utilities.js';
import { optionStyles } from './option.styles.js';
import '../icon/icon.component.js';

/**
 * A single selectable option. Not form-associated on its own — pair it
 * with `kit-select`, which owns the listbox, selection, keyboard
 * navigation, and form participation for its slotted `kit-option`
 * children.
 *
 * @slot - The option's label content
 *
 * @csspart option - The root element
 * @csspart label - The label container
 * @csspart check - The selected-state check icon
 */
@customElement('kit-option')
export class KitOption extends KitElement {
	static styles = [baseStyles, optionStyles, disabledStyles];

	/**
	 * Whether this option is selected.
	 */
	@property({ type: Boolean, reflect: true })
	selected = false;

	/**
	 * Whether this option is disabled.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * The value submitted when this option is the selected one.
	 */
	@property({ type: String })
	value = '';

	private _handleClick() {
		if (!this.disabled) {
			this.selected = true;
		}
	}

	private _handleKeydown(event: KeyboardEvent) {
		if (event.key === ' ' && !this.disabled) {
			event.preventDefault();
			this.selected = true;
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('click', this._handleClick);
		this.addEventListener('keydown', this._handleKeydown);

		this.setAttribute('role', 'option');
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
			<span part="option" id="option">
				<span part="label" id="label"><slot></slot></span>
				${this.selected
					? html`<kit-icon
							part="check"
							id="check"
							name="check"
							size="small"
						></kit-icon>`
					: nothing}
			</span>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-option': KitOption;
	}
}
