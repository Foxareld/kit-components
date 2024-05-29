import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import { componentStyles } from './kit-button-group.styles';

@customElement('kit-button-group')
export default class KitButtonGroup extends LitElement {
	static styles: CSSResultGroup = componentStyles;

	@query('slot')
	private defaultSlot!: HTMLSlotElement;

	firstUpdated() {
		const slotted = [
			...this.defaultSlot.assignedElements({ flatten: true }),
		];

		slotted.forEach((element, index) => {
			// Add class to button
			const button =
				element.closest('kit-button') ??
				element.querySelector('kit-button')!;

			if (button) {
				button.classList.add('grouped-button');

				if (index == slotted.length - 1) {
					button.classList.add('last');
				} else if (index == 0) {
					button.classList.add('first');
				}
			}

			const dropdown =
				element.closest('kit-dropdown') ??
				element.querySelector('kit-dropdown')!;
			if (dropdown) {
				dropdown.classList.add('grouped-dropdown');
			}
		});
	}

	render() {
		return html`
			<div class="button-group">
				<slot></slot>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-button-group': KitButtonGroup;
	}
}
