import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { inputStyles } from './input.styles.js';
import {
	baseInput,
	baseStyles,
	disabledStyles,
} from '../../styles/utilities.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import '../icon/icon.component.js';
import type { IconColor, IconSize } from '../icon/icon.component.js';
import type { IconName } from '../../assets/icons/icon-registry.js';

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
	static styles = [baseStyles, inputStyles, baseInput, disabledStyles];

	private _internals: ElementInternals;
	private _defaultValue = '';
	private _isInvalidSyncActive = false;

	@query('#input')
	private _inputElement!: HTMLInputElement;

	@state()
	private _shouldShowValidation = false;

	/**
	 * A custom error message. When set alongside `isInvalid`, this message is
	 * shown instead of the input's native validation message.
	 */
	@property({ type: String })
	customError: string | null = null;

	/**
	 * disabled state of the input
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * Optional icon shown inside the input, from the kit-icon registry.
	 */
	@property({ type: String, reflect: true })
	icon?: IconName;

	/**
	 * Color of the icon.
	 */
	@property({ type: String, attribute: 'icon-color' })
	iconColor: IconColor = 'default';

	/**
	 * Which side of the input the icon is shown on.
	 */
	@property({ type: String, reflect: true, attribute: 'icon-placement' })
	iconPlacement: 'left' | 'right' = 'left';

	/**
	 * Size of the icon.
	 */
	@property({ type: String, attribute: 'icon-size' })
	iconSize: IconSize = 'small';

	/**
	 * Marks the input as invalid regardless of its native constraints, e.g.
	 * for server-side or async validation errors. Pair with `customError` to
	 * control the displayed message.
	 */
	@property({ type: Boolean, reflect: true })
	isInvalid = false;

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
	@property({ type: String, reflect: true })
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
	@property({ type: Boolean, reflect: true })
	required = false;

	/**
	 * The input type
	 */
	@property({ type: String, reflect: true })
	type: 'text' | 'password' | 'email' | 'number' = 'text';

	/**
	 * The input value
	 */
	@property({ type: String })
	value = '';

	constructor() {
		super();
		this._internals = this.attachInternals();
		this.addEventListener('invalid', this._handleInvalid);
	}

	connectedCallback() {
		super.connectedCallback();
		this._defaultValue = this.value;
	}

	private _handleInput(event: Event) {
		this.value = (event.target as HTMLInputElement).value;
	}

	private _handleChange() {
		this._shouldShowValidation = true;
	}

	private _handleInvalid(event: Event) {
		event.preventDefault();
		this._shouldShowValidation = true;
	}

	/**
	 * Mirrors the native `<input>`'s current `ValidityState` into
	 * `ElementInternals`, unchanged.
	 */
	private _mirrorNativeValidity() {
		this._internals.setValidity(
			this._inputElement.validity,
			this._inputElement.validationMessage,
			this._inputElement
		);
	}

	/**
	 * Applies a declarative `isInvalid` override (if any), then mirrors
	 * validity into `ElementInternals`. Called from `willUpdate`/
	 * `firstUpdated` (before render commits) rather than `updated`, so a
	 * single render reflects the fresh validity state instead of needing a
	 * follow-up update cycle.
	 *
	 * Only clears a custom error that this method itself applied — a
	 * message set directly via `setCustomValidity`/`setValidity` is left
	 * alone so it isn't wiped out by the next unrelated re-render.
	 */
	private _syncValidity() {
		if (this.isInvalid) {
			this._inputElement.setCustomValidity(
				this.customError || 'This value is invalid.'
			);
			this._isInvalidSyncActive = true;
		} else if (this._isInvalidSyncActive) {
			this._inputElement.setCustomValidity('');
			this._isInvalidSyncActive = false;
		}

		this._mirrorNativeValidity();
	}

	/**
	 * Whether the invalid state should currently be surfaced to the user:
	 * either a validation attempt has occurred (native `invalid` event or a
	 * `change`), or `isInvalid` was set declaratively.
	 */
	private get _isShowingError(): boolean {
		return (this._shouldShowValidation || this.isInvalid) && !this.validity.valid;
	}

	/**
	 * A human-readable message for the input's current validity state.
	 */
	private get _displayMessage(): string {
		const validity = this.validity;
		if (validity.customError) return this.validationMessage;
		if (validity.valueMissing) return 'This field is required.';
		if (validity.tooShort) return 'Value is too short.';
		if (validity.tooLong) return 'Value is too long.';
		if (validity.rangeUnderflow) return 'Value is too low.';
		if (validity.rangeOverflow) return 'Value is too high.';
		return this.validationMessage || 'This value is invalid.';
	}

	protected willUpdate(changedProperties: PropertyValues<this>) {
		super.willUpdate(changedProperties);
		if (this._inputElement) {
			this._syncValidity();
		}
	}

	protected firstUpdated(changedProperties: PropertyValues<this>) {
		super.firstUpdated(changedProperties);
		this._syncValidity();
		this.requestUpdate();
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);
		this._internals.setFormValue(this.value);
	}

	/**
	 * Resets the input to its initial value when the owning form is reset.
	 */
	formResetCallback() {
		this.value = this._defaultValue;
		this._inputElement.value = this._defaultValue;
		this._shouldShowValidation = false;
		this._syncValidity();
	}

	/**
	 * Sets the input's validity using arbitrary constraint flags, mirroring
	 * `ElementInternals.setValidity`. Prefer `setCustomValidity` for simple
	 * custom error messages.
	 */
	setValidity(
		flags: ValidityStateFlags,
		message?: string,
		anchor?: HTMLElement
	) {
		this._internals.setValidity(flags, message, anchor ?? this._inputElement);

		if (Object.keys(flags).length === 0 && this._inputElement.validity.customError) {
			this._inputElement.setCustomValidity('');
		}

		if (message) {
			this._inputElement.setCustomValidity(message);
			this.customError = message;
		}

		this.requestUpdate();
	}

	/**
	 * Sets a custom validation error message. Pass an empty string to clear
	 * the custom error and fall back to the input's native constraints.
	 */
	setCustomValidity(message: string) {
		this._inputElement.setCustomValidity(message);
		this._mirrorNativeValidity();
		this.requestUpdate();
	}

	/**
	 * Checks the input's validity without showing the browser's UI.
	 */
	checkValidity(): boolean {
		return this._internals.checkValidity();
	}

	/**
	 * Checks the input's validity and shows the browser's validation UI if invalid.
	 */
	reportValidity(): boolean {
		return this._internals.reportValidity();
	}

	/**
	 * Moves focus to the input.
	 */
	focus(options?: FocusOptions) {
		this._inputElement.focus(options);
	}

	/**
	 * Removes focus from the input.
	 */
	blur() {
		this._inputElement.blur();
	}

	/**
	 * Sets the text selection range within the input.
	 */
	setSelectionRange(
		start: number | null,
		end: number | null,
		direction?: 'forward' | 'backward' | 'none'
	) {
		this._inputElement.setSelectionRange(start, end, direction);
	}

	/**
	 * The input's current validity state.
	 */
	get validity(): ValidityState {
		return this._internals.validity;
	}

	/**
	 * The input's current validation message, if any.
	 */
	get validationMessage(): string {
		return this._internals.validationMessage;
	}

	/**
	 * Whether the input is a candidate for constraint validation.
	 */
	get willValidate(): boolean {
		return this._internals.willValidate;
	}

	/**
	 * The form this input is associated with, if any.
	 */
	get form(): HTMLFormElement | null {
		return this._internals.form;
	}

	render() {
		const isShowingError = this._isShowingError;

		return html`
			<div id="labelContainer">
				<label part="label" for="input">
					${this.label}
					${this.required
						? html`<span class="error-state">*</span>`
						: nothing}
				</label>
			</div>
			<div id="inputContainer">
				${this.icon
					? html`<kit-icon
							name=${this.icon}
							size=${this.iconSize}
							color=${this.iconColor}
							part="input-icon"
							class=${classMap({
								'icon-right': this.iconPlacement === 'right',
							})}
						></kit-icon>`
					: nothing}
				<input
					id="input"
					part="input"
					class=${classMap({
						'input-base': true,
						'input-error': isShowingError,
						'has-icon': !!this.icon,
						'icon-right': !!this.icon && this.iconPlacement === 'right',
					})}
					type=${this.type}
					name=${this.name}
					placeholder=${this.placeholder}
					.value=${live(this.value)}
					.minlength=${ifDefined(this.minLength)}
					.maxlength=${ifDefined(this.maxLength)}
					.min=${ifDefined(this.min)}
					.max=${ifDefined(this.max)}
					pattern=${ifDefined(this.pattern || undefined)}
					aria-describedby=${ifDefined(isShowingError ? 'errorText' : undefined)}
					?disabled=${this.disabled}
					?required=${this.required}
					@input=${this._handleInput}
					@change=${this._handleChange}
				/>
			</div>
			${isShowingError
				? html`<p id="errorText" class="error-text" role="alert">
						${this._displayMessage}
					</p>`
				: nothing}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-input': KitInput;
	}
}
