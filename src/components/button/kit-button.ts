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
	size: 'small' | 'normal' | 'large' = 'normal';

	@property({ type: String })
	type: 'button' | 'submit' | 'reset' = 'button';

	@property({ type: String, reflect: true })
	variant: ButtonVariant = 'primary';

	public focus() {
		this._button.focus();
	}

	render() {
		return html`
			<button>
				<slot></slot>
			</button>
		`;
	}
}
