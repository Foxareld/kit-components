import { html, nothing, type PropertyValues } from 'lit';
import {
	customElement,
	property,
	queryAssignedElements,
	state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { FormAssociatedElement } from '../../base/FormAssociatedElement.js';
import { baseStyles } from '../../styles/utilities.js';
import { radioGroupStyles } from './radio-group.styles.js';
import '../radio/radio.component.js';
import type { KitRadio } from '../radio/radio.component.js';

const NEXT_KEYS = new Set(['ArrowDown', 'ArrowRight']);
const PREVIOUS_KEYS = new Set(['ArrowUp', 'ArrowLeft']);

/**
 * Groups kit-radio children, managing mutual exclusivity, roving-tabindex
 * keyboard navigation, and form participation. kit-radio itself is not
 * form-associated — this component owns the checked value and validity for
 * the whole group.
 *
 * @slot - kit-radio children
 *
 * @csspart fieldset - The root fieldset element
 * @csspart legend - The legend containing the label
 */
@customElement('kit-radio-group')
export class KitRadioGroup extends FormAssociatedElement {
	static styles = [baseStyles, radioGroupStyles];

	private _defaultValue = '';
	private _customError: string | null = null;

	@queryAssignedElements({ selector: 'kit-radio' })
	private _radioElements!: KitRadio[];

	@state()
	private _shouldShowValidation = false;

	/**
	 * Accessible label shown in the fieldset's legend.
	 */
	@property({ type: String })
	label = '';

	/**
	 * The name of the radio group, used for form submission.
	 */
	@property({ type: String, reflect: true })
	name = '';

	/**
	 * required state of the radio group — at least one radio must be checked.
	 */
	@property({ type: Boolean, reflect: true })
	required = false;

	/**
	 * The value of the currently checked radio. Setting this externally
	 * checks the matching radio and unchecks the others.
	 */
	@property({ type: String })
	value = '';

	private get _enabledRadios(): KitRadio[] {
		return this._radioElements.filter((radio) => !radio.disabled);
	}

	private get _checkedRadio(): KitRadio | undefined {
		return this._radioElements.find((radio) => radio.checked);
	}

	/**
	 * Whether the invalid state should currently be surfaced to the user:
	 * a validation attempt has occurred (native `invalid` event, or focus
	 * left the group).
	 */
	private get _isShowingError(): boolean {
		return this._shouldShowValidation && !this.validity.valid;
	}

	/**
	 * A human-readable message for the group's current validity state.
	 */
	private get _displayMessage(): string {
		const validity = this.validity;
		if (validity.customError) return this.validationMessage;
		if (validity.valueMissing) return 'Please select an option.';
		return this.validationMessage || 'This selection is invalid.';
	}

	constructor() {
		super();
		this.addEventListener('invalid', this._handleInvalid);
	}

	private _handleInvalid(event: Event) {
		event.preventDefault();
		this._shouldShowValidation = true;
	}

	private _handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (!next || !this.contains(next)) {
			this._shouldShowValidation = true;
		}
	}

	private _handleSlotChange() {
		this._updateTabIndexes();
	}

	private _handleClick(event: Event) {
		const target = (event.target as HTMLElement)?.closest?.(
			'kit-radio'
		) as KitRadio | null;
		if (!target || target.disabled) return;
		this._selectRadio(target);
	}

	private _handleKeydown(event: KeyboardEvent) {
		const current = (event.target as HTMLElement)?.closest?.(
			'kit-radio'
		) as KitRadio | null;

		if (event.key === ' ') {
			if (current && !current.disabled) {
				event.preventDefault();
				this._selectRadio(current);
			}
			return;
		}

		const isNext = NEXT_KEYS.has(event.key);
		const isPrevious = PREVIOUS_KEYS.has(event.key);
		if (!isNext && !isPrevious) return;

		const enabled = this._enabledRadios;
		if (enabled.length === 0) return;

		event.preventDefault();
		const currentIndex = current ? enabled.indexOf(current) : -1;
		const step = isNext ? 1 : -1;
		const nextIndex =
			currentIndex === -1
				? 0
				: (currentIndex + step + enabled.length) % enabled.length;
		const next = enabled[nextIndex];
		if (!next) return;

		this._selectRadio(next);
		next.focus();
	}

	private _selectRadio(radio: KitRadio) {
		if (radio.disabled) return;

		for (const r of this._radioElements) {
			r.checked = r === radio;
		}
		this.value = radio.value;
		this._updateTabIndexes();

		this.dispatchEvent(
			new CustomEvent('change', {
				bubbles: true,
				composed: true,
				detail: this.value,
			})
		);
	}

	private _applyValueToRadios() {
		for (const r of this._radioElements) {
			r.checked = r.value === this.value;
		}
	}

	/**
	 * Ensures exactly one enabled radio has tabindex="0" (the checked one,
	 * or the first enabled one if none are checked) so the group is
	 * reachable — and internally navigable — via Tab.
	 */
	private _updateTabIndexes() {
		const enabled = this._enabledRadios;
		const target = enabled.find((r) => r.checked) ?? enabled[0];

		for (const radio of this._radioElements) {
			radio.tabIndex = radio.disabled ? -1 : radio === target ? 0 : -1;
		}
	}

	private _syncValidity() {
		if (this._customError) {
			this._internals.setValidity(
				{ customError: true },
				this._customError,
				this
			);
		} else if (this.required && !this.value) {
			this._internals.setValidity(
				{ valueMissing: true },
				'Please select an option.',
				this
			);
		} else {
			this._internals.setValidity({});
		}
	}

	protected willUpdate(changedProperties: PropertyValues<this>) {
		super.willUpdate(changedProperties);
		this._syncValidity();
	}

	protected firstUpdated(changedProperties: PropertyValues<this>) {
		super.firstUpdated(changedProperties);

		const checkedRadio = this._checkedRadio;
		if (checkedRadio) {
			this.value = checkedRadio.value;
		} else if (this.value) {
			this._applyValueToRadios();
		}

		this._defaultValue = this.value;
		this._updateTabIndexes();
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);
		this._internals.setFormValue(this.value);

		if (
			changedProperties.has('value') &&
			this._checkedRadio?.value !== this.value
		) {
			this._applyValueToRadios();
			this._updateTabIndexes();
		}
	}

	/**
	 * Resets the group to whichever radio was checked (or value set) when
	 * the owning form connected.
	 */
	formResetCallback() {
		this.value = this._defaultValue;
		this._applyValueToRadios();
		this._shouldShowValidation = false;
		this._customError = null;
		this._updateTabIndexes();
		this._syncValidity();
	}

	/**
	 * Sets the group's validity using arbitrary constraint flags, mirroring
	 * `ElementInternals.setValidity`. Prefer `setCustomValidity` for simple
	 * custom error messages.
	 */
	setValidity(
		flags: ValidityStateFlags,
		message?: string,
		anchor?: HTMLElement
	) {
		this._internals.setValidity(flags, message, anchor ?? this);

		if (Object.keys(flags).length === 0) {
			this._customError = null;
		} else if (message) {
			this._customError = message;
		}

		this.requestUpdate();
	}

	/**
	 * Sets a custom validation error message. Pass an empty string to clear
	 * the custom error and fall back to the group's `required` constraint.
	 */
	setCustomValidity(message: string) {
		this._customError = message || null;
		this._syncValidity();
		this.requestUpdate();
	}

	render() {
		const isShowingError = this._isShowingError;

		return html`
			<fieldset
				part="fieldset"
				role="radiogroup"
				aria-required=${this.required ? 'true' : 'false'}
				aria-describedby=${ifDefined(isShowingError ? 'errorText' : undefined)}
			>
				<legend part="legend">
					${this.label}
					${this.required
						? html`<span class="required-indicator" aria-hidden="true"
								>*</span
							>`
						: nothing}
				</legend>
				<div
					class="radio-container"
					@click=${this._handleClick}
					@keydown=${this._handleKeydown}
					@focusout=${this._handleFocusOut}
				>
					<slot @slotchange=${this._handleSlotChange}></slot>
				</div>
			</fieldset>
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
		'kit-radio-group': KitRadioGroup;
	}
}
