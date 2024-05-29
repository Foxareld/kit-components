import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import { componentStyles } from './kit-menu-item.styles';

@customElement('kit-menu-item')
export default class KitMenuItem extends LitElement {
	static get styles(): CSSResultGroup {
		return [componentStyles];
	}

	// TODO: ADD ALL THIS STUFF BACK WHEN NEEDED

	// @property({ type: String, reflect: true })
	// accessor type: 'default' | 'check' = 'default';

	// @property({ type: Boolean, reflect: true })
	// accessor checked = false;

	// protected firstUpdated(): void {
	// 	this.addEventListener('click', this.handleClick);
	// }

	/**
	 * Handle click event on menu items
	 * @param event - MouseEvent
	 */
	// private handleClick(): void {
	// 	if (this.type === 'check') {
	// 		this.checked = !this.checked;
	// 	}
	// }

	render() {
		return html`
			<div class="menu-item">
				<slot></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-menu-item': KitMenuItem;
	}
}
