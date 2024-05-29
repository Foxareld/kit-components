import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { componentStyles } from './kit-dropdown.styles';
import type { CSSResultGroup } from 'lit';

/**
 * @prop {string} position - Position of dropdown
 * @slot trigger - Trigger for dropdown
 */
@customElement('kit-dropdown')
export default class KitDropdown extends LitElement {
	static get styles(): CSSResultGroup {
		return [componentStyles];
	}

	@property({ type: String, reflect: true })
	accessor align: 'left' | 'right' | 'center' = 'left';

	@property({ type: String, reflect: true })
	accessor position: 'top' | 'bottom' = 'bottom';

	@state()
	accessor isOpen: boolean = false;

	connectedCallback(): void {
		super.connectedCallback();
		document.addEventListener('click', this.handleClickOutside);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		document.removeEventListener('click', this.handleClickOutside);
	}

	/**
	 * Handle click outside of dropdown and closes dropdown
	 * @param event - Event
	 */
	private handleClickOutside = (event: Event): void => {
		const target = event.target as HTMLElement;
		if (!this.contains(target)) {
			this.isOpen = false;
		}
	};

	/**
	 * Toggle dropdown
	 */
	private toggleDropdown(): void {
		this.isOpen = !this.isOpen;
	}

	render() {
		return html`
			<div class="dropdown">
				<slot name="trigger" @click=${this.toggleDropdown}></slot>
				<div class="dropdown-content ${this.isOpen ? 'open' : ''}">
					<slot></slot>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-dropdown': KitDropdown;
	}
}
