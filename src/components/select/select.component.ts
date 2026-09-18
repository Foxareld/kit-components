import { html, nothing, type PropertyValues } from 'lit';
import {
	customElement,
	property,
	query,
	queryAssignedElements,
	state,
} from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { FormAssociatedElement } from '../../base/FormAssociatedElement.js';
import { baseInput, baseStyles } from '../../styles/utilities.js';
import { selectStyles } from './select.styles.js';
import '../dropdown/dropdown.component.js';
import type { KitDropdown } from '../dropdown/dropdown.component.js';
import '../option/option.component.js';
import type { KitOption } from '../option/option.component.js';
import '../icon/icon.component.js';

const NEXT_KEYS = new Set(['ArrowDown']);
const PREVIOUS_KEYS = new Set(['ArrowUp']);

/**
 * A single-choice select built from kit-dropdown (positioning, dismiss,
 * disabled propagation) and slotted kit-option children (the listbox).
 * kit-select owns the listbox semantics on top: roving-tabindex keyboard
 * navigation, type-ahead, selection, and form participation.
 *
 * @slot - kit-option children
 *
 * @csspart label - The label element
 * @csspart trigger - The trigger button
 * @csspart listbox - The listbox container
 */
@customElement('kit-select')
export class KitSelect extends FormAssociatedElement {
	static styles = [baseStyles, selectStyles, baseInput];

	private _defaultValue = '';
	private _customError: string | null = null;
	private _searchBuffer = '';
	private _searchTimeout?: number;

	@queryAssignedElements({ selector: 'kit-option' })
	private _optionElements!: KitOption[];

	@query('kit-dropdown')
	private _dropdownElement!: KitDropdown;

	@state()
	private _isOpen = false;

	@state()
	private _shouldShowValidation = false;

	/**
	 * Accessible label shown above the trigger.
	 */
	@property({ type: String })
	label = '';

	/**
	 * The name of the select, used for form submission.
	 */
	@property({ type: String, reflect: true })
	name = '';

	/**
	 * Text shown in the trigger when nothing is selected.
	 */
	@property({ type: String })
	placeholder = 'Select an option';

	/**
	 * required state of the select — an option must be selected.
	 */
	@property({ type: Boolean, reflect: true })
	required = false;

	/**
	 * disabled state of the select.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * The value of the currently selected option. Setting this externally
	 * selects the matching option and deselects the others.
	 */
	@property({ type: String })
	value = '';

	private get _enabledOptions(): KitOption[] {
		return this._optionElements.filter((option) => !option.disabled);
	}

	private get _selectedOption(): KitOption | undefined {
		return this._optionElements.find((option) => option.selected);
	}

	/**
	 * Whether the invalid state should currently be surfaced to the user:
	 * a validation attempt has occurred (native `invalid` event, or focus
	 * left the component).
	 */
	private get _isShowingError(): boolean {
		return this._shouldShowValidation && !this.validity.valid;
	}

	/**
	 * A human-readable message for the select's current validity state.
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

	private _handleDropdownToggle(event: Event) {
		this._isOpen = (event as CustomEvent<boolean>).detail;
		if (this._isOpen) {
			this._focusSelectedOrFirstOption();
		}
	}

	private _handleTriggerKeydown(event: KeyboardEvent) {
		if (this.disabled) return;

		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!this._dropdownElement.open) {
				this._dropdownElement.open = true;
			}
		}
	}

	private _handleListboxClick(event: Event) {
		const target = (event.target as HTMLElement)?.closest?.(
			'kit-option'
		) as KitOption | null;
		if (!target || target.disabled) return;
		this._selectOption(target);
	}

	private _handleListboxKeydown(event: KeyboardEvent) {
		const current = (event.target as HTMLElement)?.closest?.(
			'kit-option'
		) as KitOption | null;

		if (event.key === ' ' || event.key === 'Enter') {
			if (current && !current.disabled) {
				event.preventDefault();
				this._selectOption(current);
			}
			return;
		}

		if (event.key === 'Tab') {
			this._dropdownElement.open = false;
			return;
		}

		if (event.key === 'Backspace') {
			this._searchBuffer = '';
			clearTimeout(this._searchTimeout);
			return;
		}

		const isNext = NEXT_KEYS.has(event.key);
		const isPrevious = PREVIOUS_KEYS.has(event.key);
		const isHome = event.key === 'Home';
		const isEnd = event.key === 'End';
		if (!isNext && !isPrevious && !isHome && !isEnd) {
			if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
				event.stopPropagation();
				this._updateSearchBuffer(event.key);
				this._selectByTypeAhead();
			}
			return;
		}

		event.preventDefault();
		const enabled = this._enabledOptions;
		if (enabled.length === 0) return;

		const currentIndex = current ? enabled.indexOf(current) : -1;
		let nextIndex: number;
		if (isHome) {
			nextIndex = 0;
		} else if (isEnd) {
			nextIndex = enabled.length - 1;
		} else {
			const step = isNext ? 1 : -1;
			nextIndex =
				currentIndex === -1
					? 0
					: (currentIndex + step + enabled.length) % enabled.length;
		}

		const nextOption = enabled[nextIndex];
		if (!nextOption) return;
		this._setActiveOption(nextOption);
	}

	private _updateSearchBuffer(key: string) {
		this._searchBuffer += key.toLowerCase();
		clearTimeout(this._searchTimeout);
		this._searchTimeout = window.setTimeout(() => {
			this._searchBuffer = '';
		}, 1000);
	}

	private _selectByTypeAhead() {
		const match = this._enabledOptions.find((option) => {
			const text = option.textContent?.toLowerCase().trim() ?? '';
			return this._searchBuffer.length === 1
				? text.startsWith(this._searchBuffer)
				: text.includes(this._searchBuffer);
		});
		if (match) this._setActiveOption(match);
	}

	private _selectOption(option: KitOption) {
		if (option.disabled) return;

		for (const o of this._optionElements) {
			o.selected = o === option;
		}
		this.value = option.value;
		this._updateTabIndexes();
		this._dropdownElement.open = false;

		this.dispatchEvent(
			new CustomEvent('change', {
				bubbles: true,
				composed: true,
				detail: this.value,
			})
		);
	}

	private _setActiveOption(option: KitOption) {
		for (const o of this._optionElements) {
			o.tabIndex = o === option ? 0 : -1;
		}
		option.focus();
	}

	private _focusSelectedOrFirstOption() {
		const enabled = this._enabledOptions;
		if (enabled.length === 0) return;
		const target = enabled.find((option) => option.selected) ?? enabled[0];
		if (!target) return;
		this._setActiveOption(target);
	}

	private _applyValueToOptions() {
		for (const option of this._optionElements) {
			option.selected = option.value === this.value;
		}
	}

	/**
	 * Ensures exactly one enabled option has tabindex="0" (the selected
	 * one, or the first enabled one if none is selected) so the listbox
	 * is reachable — and internally navigable — via Tab.
	 */
	private _updateTabIndexes() {
		const enabled = this._enabledOptions;
		const target = enabled.find((option) => option.selected) ?? enabled[0];

		for (const option of this._optionElements) {
			option.tabIndex = option.disabled ? -1 : option === target ? 0 : -1;
		}
	}

	private _handleSlotChange() {
		this._updateTabIndexes();
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

	/**
	 * kit-dropdown has its own independent update cycle — closing it (e.g.
	 * from `_selectOption`) schedules a Lit update on kit-dropdown that
	 * `super.updateComplete` doesn't know about, since it's a separate
	 * element. Without this, `await selectEl.updateComplete` can resolve
	 * before kit-dropdown's own close/focus-return logic has actually run.
	 */
	protected async getUpdateComplete(): Promise<boolean> {
		const result = await super.getUpdateComplete();
		await this._dropdownElement?.updateComplete;
		return result;
	}

	protected firstUpdated(changedProperties: PropertyValues<this>) {
		super.firstUpdated(changedProperties);

		const selected = this._selectedOption;
		if (selected) {
			this.value = selected.value;
		} else if (this.value) {
			this._applyValueToOptions();
		}

		this._defaultValue = this.value;
		this._updateTabIndexes();
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);
		this._internals.setFormValue(this.value);

		if (
			changedProperties.has('value') &&
			this._selectedOption?.value !== this.value
		) {
			this._applyValueToOptions();
			this._updateTabIndexes();
		}
	}

	/**
	 * Resets the select to whichever option was selected (or value set)
	 * when the owning form connected.
	 */
	formResetCallback() {
		this.value = this._defaultValue;
		this._applyValueToOptions();
		this._shouldShowValidation = false;
		this._customError = null;
		this._updateTabIndexes();
		this._syncValidity();
		this._dropdownElement.open = false;
	}

	/**
	 * Sets the select's validity using arbitrary constraint flags,
	 * mirroring `ElementInternals.setValidity`. Prefer `setCustomValidity`
	 * for simple custom error messages.
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
	 * the custom error and fall back to the select's `required` constraint.
	 */
	setCustomValidity(message: string) {
		this._customError = message || null;
		this._syncValidity();
		this.requestUpdate();
	}

	/**
	 * Moves focus to the trigger.
	 */
	focus(options?: FocusOptions) {
		this._dropdownElement
			?.querySelector<HTMLElement>('[slot="trigger"]')
			?.focus(options);
	}

	render() {
		const isShowingError = this._isShowingError;
		const selectedOption = this._selectedOption;

		return html`
			<label part="label" id="selectLabel" for="trigger">
				${this.label}
				${this.required
					? html`<span class="required-indicator" aria-hidden="true">*</span>`
					: nothing}
			</label>
			<kit-dropdown ?disabled=${this.disabled} @toggle=${this._handleDropdownToggle}>
				<button
					type="button"
					id="trigger"
					part="trigger"
					slot="trigger"
					class=${classMap({
						'input-base': true,
						'select-trigger': true,
						'input-error': isShowingError,
					})}
					role="combobox"
					aria-haspopup="listbox"
					aria-controls="listbox"
					aria-labelledby="selectLabel"
					aria-expanded=${this._isOpen}
					aria-required=${this.required ? 'true' : 'false'}
					aria-describedby=${ifDefined(isShowingError ? 'errorText' : undefined)}
					@keydown=${this._handleTriggerKeydown}
					@focusout=${this._handleFocusOut}
				>
					<span class=${classMap({ placeholder: !selectedOption })}>
						${selectedOption ? selectedOption.textContent?.trim() : this.placeholder}
					</span>
					<kit-icon
						name="chevron-down"
						size="small"
						class=${classMap({ chevron: true, open: this._isOpen })}
					></kit-icon>
				</button>
				<div
					id="listbox"
					part="listbox"
					role="listbox"
					aria-labelledby="selectLabel"
					@click=${this._handleListboxClick}
					@keydown=${this._handleListboxKeydown}
				>
					<slot @slotchange=${this._handleSlotChange}></slot>
				</div>
			</kit-dropdown>
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
		'kit-select': KitSelect;
	}
}
