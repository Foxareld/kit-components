import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { FormAssociatedElement } from '../../base/FormAssociatedElement.js';
import { baseStyles, disabledStyles } from '../../styles/utilities.js';
import { checkboxStyles } from './checkbox.styles.js';

/**
 * Checkbox component. Wraps a real native `<input type="checkbox">` so it
 * gets native keyboard/click/indeterminate behavior for free — its
 * ValidityState is mirrored into ElementInternals, same as kit-input.
 *
 * @slot - The checkbox's label content
 *
 * @csspart row - The label wrapping the box and label content
 * @csspart box - The visual checkbox box
 * @csspart label - The label text container
 */
@customElement('kit-checkbox')
export class KitCheckbox extends FormAssociatedElement {
	static styles = [baseStyles, checkboxStyles, disabledStyles];

	private _defaultChecked = false;

	@query('#checkbox')
	private _inputElement!: HTMLInputElement;

	@state()
	private _shouldShowValidation = false;

	/**
	 * Whether the checkbox is checked.
	 */
	@property({ type: Boolean, reflect: true })
	checked = false;

	/**
	 * disabled state of the checkbox.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * Puts the checkbox in the indeterminate visual state. This is a
	 * display-only, JS-driven state (mirroring the native checkbox
	 * behavior) — it doesn't affect `checked` or the submitted form value.
	 */
	@property({ type: Boolean, reflect: true })
	indeterminate = false;

	/**
	 * The name of the checkbox, used for form submission.
	 */
	@property({ type: String, reflect: true })
	name = '';

	/**
	 * required state of the checkbox.
	 */
	@property({ type: Boolean, reflect: true })
	required = false;

	/**
	 * The value submitted when the checkbox is checked.
	 */
	@property({ type: String })
	value = 'on';

	connectedCallback() {
		super.connectedCallback();
		this._defaultChecked = this.checked;
	}

	private _handleInput(event: Event) {
		this.checked = (event.target as HTMLInputElement).checked;
	}

	private _handleChange() {
		this._shouldShowValidation = true;
	}

	private _handleInvalid(event: Event) {
		event.preventDefault();
		this._shouldShowValidation = true;
	}

	constructor() {
		super();
		this.addEventListener('invalid', this._handleInvalid);
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
	 * Whether the invalid state should currently be surfaced to the user: a
	 * validation attempt has occurred (native `invalid` event or a `change`).
	 */
	private get _isShowingError(): boolean {
		return this._shouldShowValidation && !this.validity.valid;
	}

	/**
	 * A human-readable message for the checkbox's current validity state.
	 */
	private get _displayMessage(): string {
		const validity = this.validity;
		if (validity.customError) return this.validationMessage;
		if (validity.valueMissing) return 'This field is required.';
		return this.validationMessage || 'This value is invalid.';
	}

	protected willUpdate(changedProperties: PropertyValues<this>) {
		super.willUpdate(changedProperties);
		if (this._inputElement) {
			this._mirrorNativeValidity();
		}
	}

	protected firstUpdated(changedProperties: PropertyValues<this>) {
		super.firstUpdated(changedProperties);
		this._mirrorNativeValidity();
		this.requestUpdate();
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);
		this._internals.setFormValue(this.checked ? this.value : null);
	}

	/**
	 * Resets the checkbox to whatever was checked when the owning form
	 * connected.
	 */
	formResetCallback() {
		this.checked = this._defaultChecked;
		this._shouldShowValidation = false;
		this._mirrorNativeValidity();
	}

	/**
	 * Sets the checkbox's validity using arbitrary constraint flags,
	 * mirroring `ElementInternals.setValidity`. Prefer `setCustomValidity`
	 * for simple custom error messages.
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
		}

		this.requestUpdate();
	}

	/**
	 * Sets a custom validation error message. Pass an empty string to clear
	 * the custom error and fall back to the checkbox's native constraints.
	 */
	setCustomValidity(message: string) {
		this._inputElement.setCustomValidity(message);
		this._mirrorNativeValidity();
		this.requestUpdate();
	}

	/**
	 * Moves focus to the checkbox.
	 */
	focus(options?: FocusOptions) {
		this._inputElement.focus(options);
	}

	/**
	 * Removes focus from the checkbox.
	 */
	blur() {
		this._inputElement.blur();
	}

	render() {
		const isShowingError = this._isShowingError;

		return html`
			<label part="row" id="row" for="checkbox">
				<span id="boxWrapper">
					<input
						id="checkbox"
						type="checkbox"
						name=${this.name}
						value=${this.value}
						.checked=${live(this.checked)}
						.indeterminate=${this.indeterminate}
						?disabled=${this.disabled}
						?required=${this.required}
						aria-describedby=${ifDefined(isShowingError ? 'errorText' : undefined)}
						@input=${this._handleInput}
						@change=${this._handleChange}
					/>
					<span part="box" id="box" class=${classMap({ error: isShowingError })}>
						${this.indeterminate
							? html`<span id="dash"></span>`
							: this.checked
								? html`<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fill="none"
											stroke="var(--color-text)"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2.5"
											d="M5 13l4.5 4.5L19 7"
										></path>
									</svg>`
								: nothing}
					</span>
				</span>
				<span part="label" id="label">
					<slot></slot>
					${this.required
						? html`<span class="required-indicator" aria-hidden="true">*</span>`
						: nothing}
				</span>
			</label>
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
		'kit-checkbox': KitCheckbox;
	}
}
