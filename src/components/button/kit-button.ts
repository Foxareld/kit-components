import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { componentStyles } from './kit-button.styles';

import type { CSSResultGroup } from 'lit';

export type ButtonVariant = 'primary' | 'secondary' | 'transparent';

export type ButtonSize = 'small' | 'medium' | 'large';

@customElement('kit-button')
export default class KitButton extends LitElement {
	static formAssociated = true;
	static styles: CSSResultGroup = componentStyles;

	private _form: HTMLFormElement | null = null;
	private _internals: ElementInternals;

	@query('button')
	private _button!: HTMLButtonElement;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String, reflect: true })
	size: ButtonSize = 'medium';

	@property({ type: String })
	type: 'button' | 'submit' | 'reset' = 'button';

	@property({ type: String, reflect: true })
	variant: ButtonVariant = 'primary';

	private _handleClick() {
		if (this.type === 'submit') {
			this._form?.requestSubmit();
		} else if (this.type === 'reset') {
			this._form?.reset();
		}
	}

	public focus() {
		this._button.focus();
	}

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	connectedCallback() {
		super.connectedCallback();
		this._form = this._internals.form;
	}

	render() {
		return html`
			<button
				type=${this.type}
				?disabled=${this.disabled}
				@click=${this._handleClick}
			>
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
