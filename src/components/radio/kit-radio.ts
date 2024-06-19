import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentStyles } from './kit-radio.styles';
import type { CSSResultGroup } from 'lit';

/**
 * NOTE for the future: Dispatch event when checked changes to update the radio group?
 */

@customElement('kit-radio')
export default class KitRadio extends LitElement {
	static get styles(): CSSResultGroup {
		return componentStyles;
	}

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String })
	name = '';

	@property({ type: String })
	value = '';

	private _handleClick() {
		if (!this.disabled) {
			this.checked = true;
		}
	}

	private _handleKeydown(e: KeyboardEvent) {
		// Check if the space key is pressed
		if (e.key === ' ' && !this.checked) {
			this.checked = true;
		}
	}

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('click', this._handleClick);
		this.addEventListener('keydown', this._handleKeydown);

		this.setAttribute('role', 'radio');
		this.setAttribute('tabindex', '-1');
		this.setAttribute('aria-disabled', this.disabled.toString());
		this.setAttribute('aria-checked', this.checked.toString());
	}

	updated(changedProperties: Map<string | number | symbol, unknown>) {
		// Update the aria-checked attribute and tabindex when the checked property changes
		if (
			changedProperties.has('checked') &&
			changedProperties.get('checked') !== undefined
		) {
			this.setAttribute('aria-checked', this.checked.toString());

			if (this.checked) {
				this.tabIndex = 0;
				this.setAttribute('tabindex', '0');
			} else {
				this.tabIndex = -1;
				this.setAttribute('tabindex', '-1');
			}
		}
	}

	render() {
		return html`
			<span id="input">
				<span id="radio" tabindex="0"></span>
				<div id="label"><slot></slot></div>
			</span>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-radio': KitRadio;
	}
}
