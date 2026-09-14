import { html, type PropertyValues } from 'lit';
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles, disabledStyles } from '../../styles/utilities.js';
import { dropdownStyles } from './dropdown.styles.js';

/**
 * Anchors floating content to a trigger and shows/hides it via the native
 * Popover API — light-dismiss (click-outside), Escape-to-close, and
 * top-layer rendering (so it's never clipped by an ancestor's overflow)
 * all come from the platform instead of custom listeners. Positioning
 * uses CSS anchor positioning where supported; browsers without it get a
 * plain, non-flipping position computed once when the dropdown opens
 * (not tracked continuously on scroll/resize).
 *
 * Content-agnostic: it only owns opening/closing and positioning. Any
 * keyboard handling, search, or selection logic belongs to whatever is
 * slotted in — a menu, a form, plain text.
 *
 * @slot trigger - The element that opens/closes the dropdown on click
 * @slot - The dropdown's content
 *
 * @csspart trigger - Wrapper around the trigger slot; also the anchor positioning reference
 * @csspart content - The floating content container
 */
@customElement('kit-dropdown')
export class KitDropdown extends KitElement {
	static styles = [baseStyles, dropdownStyles, disabledStyles];

	private static readonly _supportsAnchorPositioning =
		typeof CSS !== 'undefined' && CSS.supports('anchor-name: --kit-dropdown-probe');

	@query('#content')
	private _contentElement!: HTMLElement;

	@queryAssignedElements({ slot: 'trigger', flatten: true })
	private _triggerElements!: HTMLElement[];

	/**
	 * Whether the dropdown's content is open. Reflects to an attribute,
	 * the same pattern as native `<details open>` — set it directly to
	 * open/close the dropdown programmatically.
	 */
	@property({ type: Boolean, reflect: true })
	open = false;

	/**
	 * When true, clicking the trigger slot no longer opens/closes the
	 * dropdown on its own — set `open` or call `toggle()` yourself
	 * instead. Useful when the trigger has its own buttons or other
	 * interactive bits that shouldn't always open the dropdown.
	 *
	 * The trigger stays fully clickable and focusable either way — this
	 * only turns off the automatic open/close wiring, it doesn't disable
	 * the trigger itself. For that, use `disabled` instead.
	 */
	@property({ type: Boolean, reflect: true, attribute: 'disable-trigger' })
	disableTrigger = false;

	/**
	 * Disables the dropdown entirely: it can't be opened (via the trigger
	 * or `toggle()`), and the `disabled` attribute is set on the assigned
	 * trigger element(s) so a component like kit-button shows its own
	 * disabled styling.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * Toggles the dropdown open or closed. No-ops while disabled.
	 */
	toggle(): void {
		if (this.disabled) return;
		this.open = !this.open;
	}

	private _handleTriggerClick = (): void => {
		if (!this.disabled && !this.disableTrigger) {
			this.toggle();
		}
	};

	private _handleTriggerSlotChange = (): void => {
		this._updateTriggerAria();
		this._updateTriggerDisabled();
	};

	/**
	 * The native `toggle` event on the popover element is the source of
	 * truth for `open` — the browser can close it itself (Escape,
	 * light-dismiss) without `close()`/`open = false` ever being called.
	 * It only needs to sync the property here: `updated()` reacts to that
	 * change (along with any change we make ourselves) in one place,
	 * rather than duplicating side effects in both places and racing the
	 * native event's own (asynchronous) timing.
	 */
	private _handlePopoverToggle = (event: Event): void => {
		const isOpen = (event as ToggleEvent).newState === 'open';
		if (this.open !== isOpen) {
			this.open = isOpen;
		}
	};

	private _updateTriggerAria(): void {
		this._triggerElements[0]?.setAttribute('aria-expanded', String(this.open));
	}

	private _updateTriggerDisabled(): void {
		const trigger = this._triggerElements[0];
		if (!trigger) return;

		trigger.toggleAttribute('disabled', this.disabled);
		trigger.setAttribute('aria-disabled', String(this.disabled));
	}

	/**
	 * One-shot position for browsers without CSS anchor positioning
	 * support, computed when the dropdown opens rather than tracked
	 * continuously. Full viewport-collision tracking on scroll/resize
	 * would mean always-on positioning logic running for every open
	 * dropdown — a deliberate scope cut for the shrinking browser tail
	 * that lacks anchor positioning.
	 */
	private _positionFallback(): void {
		const trigger = this._triggerElements[0];
		if (!trigger) return;

		const rect = trigger.getBoundingClientRect();
		this._contentElement.style.top = `${rect.bottom + 4}px`;
		this._contentElement.style.left = `${rect.left}px`;
	}

	protected willUpdate(changedProperties: PropertyValues<this>): void {
		super.willUpdate(changedProperties);

		// A disabled dropdown can't stay open — forced here (rather than in
		// `updated()`) so this render already reflects the closed state
		// instead of scheduling a visible follow-up cycle.
		if (changedProperties.has('disabled') && this.disabled) {
			this.open = false;
		}
	}

	protected updated(changedProperties: PropertyValues<this>): void {
		super.updated(changedProperties);

		if (changedProperties.has('disabled')) {
			this._updateTriggerDisabled();
		}

		if (!changedProperties.has('open')) return;

		const isShowing = this._contentElement.matches(':popover-open');
		if (this.open && !isShowing) {
			this._contentElement.showPopover();
			if (!KitDropdown._supportsAnchorPositioning) {
				this._positionFallback();
			}
		} else if (!this.open && isShowing) {
			this._contentElement.hidePopover();
		}

		this._updateTriggerAria();

		// `changedProperties.get('open')` is `undefined` only on the very
		// first update (there's no "previous value" yet) — skip focus
		// movement and the `toggle` event there so mounting the component
		// already-open doesn't steal focus or fire a spurious event before
		// any consumer could have attached a listener.
		if (changedProperties.get('open') === undefined) return;

		if (!this.open) {
			this._triggerElements[0]?.focus();
		}
		this.dispatchEvent(
			new CustomEvent('toggle', {
				detail: this.open,
				bubbles: true,
				composed: true,
			})
		);
	}

	protected firstUpdated(changedProperties: PropertyValues<this>): void {
		super.firstUpdated(changedProperties);
		this._updateTriggerAria();
		this._updateTriggerDisabled();
	}

	render() {
		return html`
			<span id="triggerAnchor" part="trigger">
				<slot
					name="trigger"
					@click=${this._handleTriggerClick}
					@slotchange=${this._handleTriggerSlotChange}
				></slot>
			</span>
			<div
				id="content"
				part="content"
				popover="auto"
				@toggle=${this._handlePopoverToggle}
			>
				<slot></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-dropdown': KitDropdown;
	}
}
