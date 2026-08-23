import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { inputStyles } from './input.styles.js';
import { baseInput } from '../../styles/utilities.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

/**
 * Input component
 *
 * @slot - Default slot content
 *
 * @csspart root - The root element
 */
@customElement('kit-input')
export class KitInput extends KitElement {
	static formAssociated = true;
	static styles = [inputStyles, baseInput];

	private _internals: ElementInternals;

	/**
	 * disabled state of the input
	 */
	@property({ type: Boolean })
	disabled = false;

	/**
	 * label for the input
	 */
	@property({ type: String })
	label = '';

	/**
	 * The min length of the input value
	 */
	@property({ type: Number })
	minLength?: number;

	/**
	 * The max length of the input value
	 */
	@property({ type: Number })
	maxLength?: number;

	/**
	 * The min value of the input (for number type)
	 */
	@property({ type: Number })
	min?: number;

	/**
	 * The max value of the input (for number type)
	 */
	@property({ type: Number })
	max?: number;

	/**
	 * The name of the input, used for form submission
	 */
	@property({ type: String })
	name = '';

	/**
	 * The input pattern for validation
	 */
	@property({ type: String })
	pattern = '';

	/**
	 * The input placeholder
	 */
	@property({ type: String })
	placeholder = '';

	/**
	 * required state of the input
	 */
	@property({ type: Boolean })
	required = false;

	/**
	 * The input type
	 */
	@property({ type: String })
	type: 'text' | 'password' | 'email' | 'number' = 'text';

	/**
	 * The input value
	 */
	@property({ type: String })
	value = '';

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	render() {
		return html`
			<div id="labelContainer">
				<label part="label" for=${this.name}>
					${this.label}
					${this.required
						? html`<span class="error-state">*</span>`
						: nothing}
				</label>
			</div>
			<div id="inputContainer">
				<input
					part="input"
					class=${classMap({
						'input-base': true,
					})}
					type=${this.type}
					name=${this.name}
					placeholder=${this.placeholder}
					.value=${live(this.value)}
					.minlength=${ifDefined(this.minLength)}
					.maxlength=${ifDefined(this.maxLength)}
					.min=${ifDefined(this.min)}
					.max=${ifDefined(this.max)}
					pattern=${this.pattern}
					?disabled=${this.disabled}
					?required=${this.required}
				/>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-input': KitInput;
	}
}
