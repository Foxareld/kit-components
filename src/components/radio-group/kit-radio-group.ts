import { LitElement, html } from 'lit';
import {
	customElement,
	property,
	query,
	queryAssignedElements,
} from 'lit/decorators.js';
import type KitRadio from '../radio/kit-radio';
import { componentStyles } from './kit-radio-group.styles';

/**
 * @slot hint - Slot for hint text
 */
@customElement('kit-radio-group')
export default class KitRadioGroup extends LitElement {
	/**
	 * @internal
	 */
	static formAssociated = true;

	static get styles() {
		return componentStyles;
	}

	/**
	 * @ignore
	 */
	private _internals: ElementInternals;

	/**
	 * @internal
	 */
	private _liveBuster = '';

	public form: HTMLFormElement | null;

	/**
	 * @internal
	 */
	@queryAssignedElements({ selector: 'kit-radio:not([disabled])' })
	_radios!: Array<KitRadio>;

	/**
	 * @internal
	 */
	@queryAssignedElements({ selector: '[checked]' })
	_checkedRadio!: KitRadio;

	/**
	 * @internal
	 */
	@query('#notify')
	_notify!: HTMLElement;

	@property({ type: String })
	label = 'Radio Group';

	@property({ type: String, reflect: true })
	layout: 'horizontal' | 'vertical' = 'horizontal';

	@property({ type: String })
	name!: string;

	@property({ type: Boolean })
	required = false;

	@property({ type: String, reflect: true })
	value = '';

	private _handleClick(e: MouseEvent) {
		const target = e.target as KitRadio;

		if (!target.disabled) {
			this._setValue(target);
		}
	}

	private _handleFocus(e: FocusEvent) {
		const focusedRadio = e.target as KitRadio;

		this._setNotifyText(focusedRadio);
	}

	private _handleKeydown(e: KeyboardEvent) {
		const target = e.target as KitRadio;

		if (
			e.key !== 'ArrowDown' &&
			e.key !== 'ArrowUp' &&
			e.key !== 'ArrowRight' &&
			e.key !== 'ArrowLeft' &&
			e.key !== ' '
		) {
			return;
		}

		if (e.key === ' ' && target.checked === false) {
			this._setValue(target);
		}

		const currentIndex = this._radios.findIndex(
			(radio) => radio === target,
		);

		let nextIndex: number = -1;

		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			//if the current index is the last radio, set the next index to the first radio
			//otherwise, set the next index to the next radio
			nextIndex =
				currentIndex == this._radios.length - 1 ? 0 : currentIndex + 1;
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			//if the current index is the first radio, set the next index to the last radio
			//otherwise, set the next index to the previous radio
			nextIndex =
				currentIndex == 0 ? this._radios.length - 1 : currentIndex - 1;
		}

		const nextRadio = this._radios[nextIndex];

		//set the tabIndex and checked properties of the next radio and focus it
		nextRadio.tabIndex = 0;
		nextRadio.checked = true;
		nextRadio.focus();

		this._setValue(nextRadio);
	}

	private _setNotifyText(radio: KitRadio) {
		const index = this._radios.findIndex((r) => r === radio);

		//aria-live won't read updates if the text is the same (i.e. if we tab out of the radio-group then tab back in into the same radio)
		//so we toggle a period at the end of the text to force an update
		this._liveBuster = this._liveBuster === '' ? '.' : '';

		const notifyText = `Radio ${index + 1} of ${this._radios.length}${
			this._liveBuster
		}`;

		this._notify.innerText = notifyText;
	}

	private _setValue(currRadio: KitRadio) {
		const value = currRadio.value;
		this.value = value;
		this._internals.setFormValue(value);

		if (this.required) {
			this._internals.setValidity({ valueMissing: false }, '');
		}

		//unselect radio that doesn't match value
		this._radios.forEach((radio) => {
			if (radio.value !== value) {
				radio.checked = false;
				radio.tabIndex = -1;
			}
		});

		this._setNotifyText(currRadio);
	}

	/**
	 * Return boolean value indicating validity of the element.
	 */
	public checkValidity(): boolean {
		return this._internals.checkValidity();
	}

	/**
	 * Check if the element has any constraints and whether it satisfies them.
	 * Will fire an invalid event if the element is invalid.
	 */
	public reportValidity(): boolean {
		return this._internals.reportValidity();
	}

	/**
	 * Set the elements submission value and state.
	 */
	public setFormValue(
		value: string | File | FormData | null,
		state?: string | File | FormData | null | undefined,
	): void {
		this._internals.setFormValue(value, state);
	}

	/**
	 * Set the element's validity.
	 */
	public setValidity(
		flags?: ValidityStateFlags | undefined,
		message?: string | undefined,
		anchor?: HTMLElement | undefined,
	): void {
		this._internals.setValidity(flags, message, anchor);
	}

	/**
	 * Returns the ValidityState object for internals's target element.
	 */
	public get validity(): ValidityState {
		return this._internals.validity;
	}

	/**
	 * Returns the error message that would be shown to the user if internals's target element was to be checked for validity.
	 */
	public get validationMessage(): string {
		return this._internals.validationMessage;
	}

	/**
	 * Returns true if internals's target element will be validated when the form is submitted; false otherwise.
	 */
	public get willValidate(): boolean {
		return this._internals.willValidate;
	}

	constructor() {
		super();
		this._internals = this.attachInternals();
		this.form = this._internals.form;
	}

	firstUpdated() {
		const radios = this._radios;

		radios[0].tabIndex = 0;

		//if required is set, set the validitity to false
		//anchor needs to be set so the browser knows where to display the error message
		if (this.required) {
			this._internals.setValidity(
				{ valueMissing: true },
				'Please select an option YO',
				radios[0],
			);
		}

		radios.forEach((radio: KitRadio) => {
			//set the name attribute of the radios
			radio.name = this.name;

			if (radio.checked) {
				this._setValue(radio);
			}
		});
	}

	render() {
		return html`
			<fieldset class="radio-group" role="radiogroup">
				<legend>
					${this.label}
					${this.required
						? html`<span class="req-star" aria-hidden="true">*</span
								><span class="sr-only">Field is required</span>`
						: ''}
				</legend>
				<div class="radio-container">
					<slot
						@click=${this._handleClick}
						@keydown=${this._handleKeydown}
						@focusin=${this._handleFocus}
					></slot>
				</div>
			</fieldset>
			<span id="notify" aria-live="polite" class="sr-only"></span>
			<div id="hint">
				<slot name="hint"></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-radio-group': KitRadioGroup;
	}
}
