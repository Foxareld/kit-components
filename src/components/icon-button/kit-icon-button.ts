import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import { componentStyles } from './kit-icon-button.styles';

import type { IconName } from '@fortawesome/fontawesome-common-types';
import type { IconColor, IconSize } from '../icon/kit-icon';

export type IconButtonVariant = 'primary' | 'transparent' | 'success' | 'grey';
export type IconButtonSize = 'small' | 'medium' | 'large';

/**
 * @prop {string} variant - Variant styling for button
 * @prop {string} size - Various sizes for button
 * @prop {string} icon - Icon to display in button; uses fs-icon
 * @prop {string} label - Label to add to button; MUST be used for accessibility
 * @prop {boolean} disabled - Disabled attribute
 */
@customElement('kit-icon-button')
export default class KitIconButton extends LitElement {
	static get styles(): CSSResultGroup {
		return [componentStyles];
	}

	@property({ type: String, reflect: true })
	variant: IconButtonVariant = 'primary';

	@property({ type: String, reflect: true })
	size: IconButtonSize = 'medium';

	@property({ type: String })
	icon!: IconName;

	@property({ type: String })
	label!: string;

	@property({ type: Boolean })
	disabled = false;

	render() {
		const iconColor: IconColor = this.disabled ? 'disabled' : 'default',
			iconSize: IconSize = this.size == 'large' ? 'default' : 'small';

		return html`<button aria-label=${this.label} ?disabled=${this.disabled}>
			<kit-icon
				icon=${this.icon}
				color=${iconColor}
				size=${iconSize}
				?disabled=${this.disabled}
			></kit-icon>
		</button>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-icon-button': KitIconButton;
	}
}
