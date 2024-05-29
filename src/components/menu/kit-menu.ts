import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import { componentStyles } from './kit-menu.styles';

@customElement('kit-menu')
export default class KitMenu extends LitElement {
	static get styles(): CSSResultGroup {
		return [componentStyles];
	}

	private currentIndex = 0;

	/**
	 * Add role and tabindex to menu & menu items
	 */
	firstUpdated(): void {
		this.setAttribute('role', 'menu');
		const items = this.querySelectorAll('kit-menu-item');
		items.forEach((item, index) => {
			item.setAttribute('role', 'menuitem');
			item.setAttribute('tabindex', index === 0 ? '0' : '-1');
		});
	}

	/**
	 * Get all menu items
	 * @returns HTMLElement[]
	 */
	private get items(): HTMLElement[] {
		return Array.from(this.querySelectorAll('kit-menu-item'));
	}

	/**
	 * Handle click event on menu items
	 * @param event - MouseEvent
	 */
	private handleClick(event: MouseEvent): void {
		const clickedItem = event.target as HTMLElement;
		const items = this.items;
		const index = items.indexOf(clickedItem);
		if (index !== -1) {
			this.setCurrentMenuItem(index);
		}
	}

	/**
	 * Handle keyboard navigation
	 * @param event - KeyboardEvent
	 */
	private handleKeyDown(event: KeyboardEvent): void {
		const items = this.items;

		switch (event.key) {
			case 'ArrowUp':
				this.currentIndex =
					this.currentIndex > 0
						? this.currentIndex - 1
						: items.length - 1;
				break;
			case 'ArrowDown':
				this.currentIndex =
					this.currentIndex < items.length - 1
						? this.currentIndex + 1
						: 0;
				break;
			case 'Home':
				this.currentIndex = 0;
				break;
			case 'End':
				this.currentIndex = items.length - 1;
				break;
			case 'Enter':
				items[this.currentIndex].click();
				break;
			default:
				return;
		}

		this.setCurrentMenuItem(this.currentIndex);
	}

	/**
	 * Set the current menu item
	 * @param index - The index of the menu item to set as current
	 */
	private setCurrentMenuItem(index: number): void {
		const items = this.items;
		if (index >= 0 && index < items.length) {
			this.currentIndex = index;
			items.forEach((item, i) => {
				item.setAttribute('tabindex', i === index ? '0' : '-1');
				if (i === index) {
					item.focus();
				}
			});
		}
	}

	render() {
		return html`
			<slot
				@click=${this.handleClick}
				@keydown=${this.handleKeyDown}
			></slot>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-menu': KitMenu;
	}
}
