import { KitElement } from './KitElement.js';

/**
 * Base class for components that participate in a `<form>` via
 * `ElementInternals`. Provides the boilerplate every form-associated
 * component needs identically: attaching internals, and the read-only
 * validity API (`checkValidity`, `reportValidity`, `validity`,
 * `validationMessage`, `willValidate`, `form`).
 *
 * Deliberately does NOT provide `setValidity`/`setCustomValidity`/
 * `formResetCallback` — how a component computes and clears its own
 * validity differs too much between components to share (e.g. kit-input
 * mirrors a native `<input>`'s own ValidityState; a component with no
 * native control underneath has to compute validity itself). Implement
 * those on the subclass, and remember to call `this.requestUpdate()`
 * after any imperative validity mutation, since none of it touches a
 * reactive property on its own — see CLAUDE.md's "Form-associated
 * components" section.
 *
 * @example
 * ```typescript
 * export class KitInput extends FormAssociatedElement {
 *   static styles = [baseStyles, inputStyles];
 * }
 * ```
 */
export abstract class FormAssociatedElement extends KitElement {
	static formAssociated = true;

	protected _internals: ElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	/**
	 * Checks the element's validity without showing the browser's UI.
	 */
	checkValidity(): boolean {
		return this._internals.checkValidity();
	}

	/**
	 * Checks the element's validity and shows the browser's validation UI if invalid.
	 */
	reportValidity(): boolean {
		return this._internals.reportValidity();
	}

	/**
	 * The element's current validity state.
	 */
	get validity(): ValidityState {
		return this._internals.validity;
	}

	/**
	 * The element's current validation message, if any.
	 */
	get validationMessage(): string {
		return this._internals.validationMessage;
	}

	/**
	 * Whether the element is a candidate for constraint validation.
	 */
	get willValidate(): boolean {
		return this._internals.willValidate;
	}

	/**
	 * The form this element is associated with, if any.
	 */
	get form(): HTMLFormElement | null {
		return this._internals.form;
	}
}
