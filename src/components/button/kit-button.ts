import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { componentStyles } from './kit-button.styles';

import type { CSSResultGroup } from 'lit';

export type ButtonVariant = 'primary' | 'secondary' | 'transparent';

export type ButtonSize = 'small' | 'medium' | 'large';

@customElement('kit-button')
export default class KitButton extends LitElement {
	static styles: CSSResultGroup = componentStyles;

	@query('button')
	private _button!: HTMLButtonElement;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String, reflect: true })
	size: ButtonSize = 'medium';

	@property({ type: String, reflect: true })
	variant: ButtonVariant = 'primary';

	public focus() {
		this._button.focus();
	}

	render() {
		return html`
			<button ?disabled=${this.disabled}>
				<slot></slot>
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-button': KitButton;
	}
}
