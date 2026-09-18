import { html, type PropertyValues } from 'lit';
import {
	customElement,
	property,
	queryAssignedElements,
} from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles } from '../../styles/utilities.js';
import { tabGroupStyles } from './tab-group.styles.js';
import '../tab/tab.component.js';
import type { KitTab } from '../tab/tab.component.js';

const NEXT_KEYS = new Set(['ArrowRight']);
const PREVIOUS_KEYS = new Set(['ArrowLeft']);

/**
 * Groups kit-tab children, managing mutual exclusivity and roving-tabindex
 * keyboard navigation. kit-tab-group always keeps exactly one enabled tab
 * selected (falling back to the first enabled tab if none is marked
 * `selected`), matching the tablist widget's expected behavior — unlike
 * kit-radio-group, where "nothing checked" is a valid state.
 *
 * kit-tab-group does not render or manage panel content. Pair each tab with
 * a panel elsewhere in the page (via `aria-controls` on the tab) and switch
 * panel visibility off the `change` event / `value` property.
 *
 * @slot - kit-tab children
 *
 * @csspart tablist - The element carrying the tabs
 */
@customElement('kit-tab-group')
export class KitTabGroup extends KitElement {
	static styles = [baseStyles, tabGroupStyles];

	@queryAssignedElements({ selector: 'kit-tab' })
	private _tabElements!: KitTab[];

	/**
	 * The value of the currently selected tab. Setting this externally
	 * selects the matching tab and deselects the others.
	 */
	@property({ type: String })
	value = '';

	private get _enabledTabs(): KitTab[] {
		return this._tabElements.filter((tab) => !tab.disabled);
	}

	private get _selectedTab(): KitTab | undefined {
		return this._tabElements.find((tab) => tab.selected);
	}

	private _handleSlotChange() {
		this._updateTabIndexes();
	}

	private _handleClick(event: Event) {
		const target = (event.target as HTMLElement)?.closest?.(
			'kit-tab'
		) as KitTab | null;
		if (!target || target.disabled) return;
		this._selectTab(target);
	}

	private _handleKeydown(event: KeyboardEvent) {
		const current = (event.target as HTMLElement)?.closest?.(
			'kit-tab'
		) as KitTab | null;

		if (event.key === ' ' || event.key === 'Enter') {
			if (current && !current.disabled) {
				event.preventDefault();
				this._selectTab(current);
			}
			return;
		}

		const enabled = this._enabledTabs;
		if (enabled.length === 0) return;

		let nextIndex: number | null = null;
		const currentIndex = current ? enabled.indexOf(current) : -1;

		if (NEXT_KEYS.has(event.key)) {
			nextIndex =
				currentIndex === -1 ? 0 : (currentIndex + 1) % enabled.length;
		} else if (PREVIOUS_KEYS.has(event.key)) {
			nextIndex =
				currentIndex === -1
					? 0
					: (currentIndex - 1 + enabled.length) % enabled.length;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = enabled.length - 1;
		}

		if (nextIndex === null) return;

		event.preventDefault();
		const next = enabled[nextIndex];
		if (!next) return;

		this._selectTab(next);
		next.focus();
	}

	private _selectTab(tab: KitTab) {
		if (tab.disabled) return;

		for (const t of this._tabElements) {
			t.selected = t === tab;
		}
		this.value = tab.value;
		this._updateTabIndexes();

		this.dispatchEvent(
			new CustomEvent('change', {
				bubbles: true,
				composed: true,
				detail: this.value,
			})
		);
	}

	private _applyValueToTabs() {
		for (const t of this._tabElements) {
			t.selected = t.value === this.value;
		}
	}

	/**
	 * Ensures exactly one enabled tab has tabindex="0" (the selected one, or
	 * the first enabled one if none are selected) so the group is reachable
	 * — and internally navigable — via Tab.
	 */
	private _updateTabIndexes() {
		const enabled = this._enabledTabs;
		const target = enabled.find((t) => t.selected) ?? enabled[0];

		for (const tab of this._tabElements) {
			tab.tabIndex = tab.disabled ? -1 : tab === target ? 0 : -1;
		}
	}

	protected firstUpdated(changedProperties: PropertyValues<this>) {
		super.firstUpdated(changedProperties);

		const selectedTab = this._selectedTab;
		if (selectedTab) {
			this.value = selectedTab.value;
		} else if (this.value) {
			this._applyValueToTabs();
		} else {
			const fallback = this._enabledTabs[0];
			if (fallback) {
				fallback.selected = true;
				this.value = fallback.value;
			}
		}

		this._updateTabIndexes();
	}

	protected updated(changedProperties: PropertyValues<this>) {
		super.updated(changedProperties);

		if (
			changedProperties.has('value') &&
			this._selectedTab?.value !== this.value
		) {
			this._applyValueToTabs();
			this._updateTabIndexes();

			// _selectTab() (click/keyboard) dispatches 'change' itself and
			// already leaves _selectedTab in sync with value by this point, so
			// this only fires for a directly-assigned `value` — kit-tab-panel
			// (and any other external observer) needs 'change' for every real
			// value transition, not just interactive ones.
			this.dispatchEvent(
				new CustomEvent('change', {
					bubbles: true,
					composed: true,
					detail: this.value,
				})
			);
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.setAttribute('role', 'tablist');
	}

	render() {
		return html`
			<div
				part="tablist"
				@click=${this._handleClick}
				@keydown=${this._handleKeydown}
			>
				<slot @slotchange=${this._handleSlotChange}></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-tab-group': KitTabGroup;
	}
}
