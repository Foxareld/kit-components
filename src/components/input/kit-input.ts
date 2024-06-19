import { LitElement, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import type { CSSResultGroup } from 'lit';
import { componentStyles } from './kit-input.styles';
import '../icon/kit-icon';

export type InputTypes =
	| 'date'
	| 'email'
	| 'number'
	| 'password'
	| 'search'
	| 'tel'
	| 'time'
	| 'text'
	| 'url';

/**
 *
 * @method checkValidity - Returns true if the element meets all constraint validations, and false if it does not.
 */
@customElement('kit-input')
export default class KitInput extends LitElement {
	static formAssociated = true;

	static get styles(): CSSResultGroup {
		return componentStyles;
	}

	private internals: ElementInternals;
	private defaultValue = '';

	@query('input')
	accessor input!: HTMLInputElement;

	@state()
	private accessor _errorMessage!: string | null;

	@property({ type: String })
	accessor autocomplete!: string;

	@property({ type: String })
	accessor customError: string | null = null;

	@property({ type: Boolean, reflect: true })
	accessor disabled = false;

	@property({ type: Object })
	accessor form!: HTMLFormElement | null;

	@property({ type: Boolean, reflect: true })
	accessor hideLabel = false;

	@property({ type: String })
	accessor hint!: string;

	@property({ type: String })
	accessor label = '';

	@property({ type: Number })
	accessor max!: number;

	@property({ type: Number })
	accessor maxlength!: number;

	@property({ type: Number })
	accessor min!: number;

	@property({ type: Number })
	accessor minlength!: number;

	@property({ type: String, reflect: true })
	accessor name!: string;

	@property({ type: String })
	accessor pattern!: string;

	@property({ type: String })
	accessor placeholder = '';

	@property({ type: Boolean, reflect: true })
	accessor readonly = false;

	@property({ type: Boolean, reflect: true })
	accessor required = false;

	@property({ type: Number })
	accessor step!: number;

	@property({ type: String, reflect: true })
	accessor type: InputTypes = 'text';

	@property({ type: String })
	accessor value = '';

	private clearError(): void {
		this._errorMessage = null;
	}

	/**
	 * Sets value and validity then checks validity when change event is called
	 */
	private onChange(): void {
		this.setValue();
		this.updateValidity();
		this.internals.checkValidity();
	}

	private onInput(): void {
		this.setValue();
	}

	/**
	 * Sets error message when input is invalid
	 */
	private onInvalid(): void {
		const vs = this.validity;

		if (this.customError) {
			this._errorMessage = this.customError;
		} else {
			if (vs.tooShort) {
				this._errorMessage = 'Value is too short';
			} else if (vs.tooLong) {
				this._errorMessage = 'Value is too long';
			} else if (vs.rangeOverflow) {
				this._errorMessage = 'Value is too high';
			} else if (vs.rangeUnderflow) {
				this._errorMessage = 'Value is too low';
			} else if (vs.valueMissing) {
				this._errorMessage = 'Field is required. Please enter value.';
			} else {
				this._errorMessage = 'This value is incorrect';
			}
		}
	}

	/**
	 * Set component's value, also sets validity
	 */
	private setValue() {
		this.value = this.input.value;
		this.internals.setFormValue(this.value);
	}

	/**
	 * Set component's validity using input's ValidityState
	 */
	private updateValidity(): void {
		this.internals.setValidity(
			this.input.validity,
			this.input.validationMessage,
			this.input,
		);

		// Clears error message when input is valid
		if (this._errorMessage && this.internals.checkValidity()) {
			this.clearError();
		}
	}

	public blur(): void {
		this.input.blur();
	}

	public checkValidity(): boolean {
		return this.internals.checkValidity();
	}

	public focus(options?: FocusOptions): void {
		this.input.focus(options);
	}

	/**
	 * Reset component's value to default
	 */
	public formResetCallback(): void {
		this.input.value = this.defaultValue;
		this.value = this.defaultValue;

		this.setValue();
	}

	public reportValidity(): boolean {
		return this.internals.reportValidity();
	}

	public setCustomValidity(error: string): void {
		this.input.setCustomValidity(error);
	}

	public setSelectionRange(
		selectionStart: number | null,
		selectionEnd: number | null,
		selectionDirection?: 'forward' | 'backward' | 'none' | undefined,
	): void {
		this.input.setSelectionRange(
			selectionStart,
			selectionEnd,
			selectionDirection,
		);
	}

	public setRangeText(
		replacement: string,
		start: number,
		end: number,
		selectionMode?: SelectionMode | undefined,
	): void {
		const selectionStart = start ?? this.input.selectionStart;
		const selectionEnd = end ?? this.input.selectionEnd;

		this.input.setRangeText(
			replacement,
			selectionStart,
			selectionEnd,
			selectionMode,
		);

		if (this.value !== this.input.value) {
			this.setValue();
		}
	}

	public setValidity(
		flags: ValidityStateFlags | Record<string, never>,
		message?: string | undefined,
		anchor?: HTMLElement | undefined,
	): void {
		this.internals.setValidity(flags, message, anchor);

		if (message) {
			this.input.setCustomValidity(message);
			this.customError = message;
		}

		if (flags && Object.keys(flags).length === 0) {
			this.input.setCustomValidity('');
			this.customError = null;
		}

		this.updateValidity();

		if (this._errorMessage && this.internals.checkValidity()) {
			this.clearError();
		}
	}

	public get validity(): ValidityState {
		return this.internals.validity;
	}

	public get validationMessage(): string {
		return this.internals.validationMessage;
	}

	public get willValidate(): boolean {
		return this.internals.willValidate;
	}

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.addEventListener('invalid', this.onInvalid);
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.form = this.internals.form;
		this.defaultValue = this.value;
	}

	/**
	 * Sets initial values
	 */
	protected firstUpdated(): void {
		this.setValue();
		this.updateValidity();
	}

	render() {
		return html`
			<label for="input">
				${this.label}
				${this.required
					? html`<span class="req-star" aria-hidden="true">*</span>`
					: nothing}
			</label>
			${this._errorMessage
				? html`
						<span class="error-text">
							<kit-icon
								icon="error-color"
								size="small"
							></kit-icon>
							${this._errorMessage}
						</span>
					`
				: nothing}
			<input
				class=${this._errorMessage ? 'input-error' : ''}
				type=${this.type}
				name=${ifDefined(this.name)}
				id="input"
				placeholder=${ifDefined(this.placeholder)}
				pattern=${ifDefined(this.pattern)}
				min=${ifDefined(this.min)}
				max=${ifDefined(this.max)}
				minlength=${ifDefined(this.minlength)}
				maxlength=${ifDefined(this.maxlength)}
				step=${ifDefined(this.step)}
				autocomplete=${ifDefined(this.autocomplete)}
				.value=${live(this.value)}
				aria-describedby="hintText"
				?disabled=${this.disabled}
				?required=${this.required}
				?readonly=${this.readonly}
				@change=${this.onChange}
				@input=${this.onInput}
			/>
			${this.hint
				? html`
						<span part="descriptive-text" id="hintText">
							${this.hint}
						</span>
					`
				: nothing}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-input': KitInput;
	}
}
