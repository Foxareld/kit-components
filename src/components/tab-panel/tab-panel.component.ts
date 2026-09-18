import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles } from '../../styles/utilities.js';
import { tabPanelStyles } from './tab-panel.styles.js';
import type { KitTabGroup } from '../tab-group/tab-group.component.js';
import type { KitTab } from '../tab/tab.component.js';

let panelIdCounter = 0;

/**
 * The content panel associated with a `kit-tab`. Not slotted inside
 * `kit-tab-group` — pairs with it by id via the `tab-group` attribute
 * (the same idea as a native `<label for>`), so a panel can live anywhere
 * in the page relative to the tabs that control it.
 *
 * kit-tab-panel hides itself (via the standard `hidden` attribute)
 * whenever its `value` doesn't match the paired kit-tab-group's current
 * `value`, and wires `aria-controls`/`aria-labelledby` between the
 * matching kit-tab and itself automatically — without overwriting either
 * if a consumer already set one explicitly.
 *
 * The `tab-group` attribute is resolved once, when the panel connects;
 * it isn't reactive to being changed afterward.
 *
 * @slot - The panel's content
 *
 * @csspart panel - The panel element
 */
@customElement('kit-tab-panel')
export class KitTabPanel extends KitElement {
	static styles = [baseStyles, tabPanelStyles];

	private _group: KitTabGroup | null = null;
	private _fallbackId = `kit-tab-panel-${++panelIdCounter}`;

	/**
	 * Identifies which kit-tab this panel belongs to — matched against a
	 * kit-tab's `value` within the paired group.
	 */
	@property({ type: String })
	value = '';

	/**
	 * The id of the kit-tab-group this panel is paired with.
	 */
	@property({ type: String, attribute: 'tab-group' })
	tabGroup = '';

	private _handleChange = () => {
		this._syncVisibility();
	};

	private _syncVisibility() {
		this.hidden = !this._group || this._group.value !== this.value;
	}

	private _syncLabelling() {
		const group = this._group;
		if (!group) return;

		const tab = [...group.querySelectorAll<KitTab>('kit-tab')].find(
			(t) => t.value === this.value
		);
		if (!tab) return;

		if (!this.id) this.id = this._fallbackId;

		if (!tab.hasAttribute('aria-controls')) {
			tab.setAttribute('aria-controls', this.id);
		}
		if (!this.hasAttribute('aria-labelledby')) {
			if (!tab.id) tab.id = `${this._fallbackId}-tab`;
			this.setAttribute('aria-labelledby', tab.id);
		}
	}

	private async _connectToGroup() {
		const group = this.tabGroup
			? ((document.getElementById(this.tabGroup) as KitTabGroup | null) ??
				null)
			: null;
		if (!group) return;

		this._group = group;
		group.addEventListener('change', this._handleChange);

		await group.updateComplete;
		this._syncVisibility();
		this._syncLabelling();
	}

	connectedCallback() {
		super.connectedCallback();
		this.setAttribute('role', 'tabpanel');
		this.tabIndex = 0;

		// Hide by default until the paired group resolves which tab is
		// actually selected, so multiple panels never render visible at once
		// during that (brief, async) resolution.
		this.hidden = true;

		void this._connectToGroup();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._group?.removeEventListener('change', this._handleChange);
		this._group = null;
	}

	render() {
		return html`
			<div part="panel">
				<slot></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-tab-panel': KitTabPanel;
	}
}
