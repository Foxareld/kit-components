import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { KitElement } from '../../base/KitElement.js';
import { baseStyles } from '../../styles/utilities.js';
import { buttonStyles } from './button.styles.js';

/**
 * A clickable button for triggering actions or submitting forms.
 *
 * Renders a native `<button>` in its shadow DOM, so it inherits standard
 * button keyboard and focus behavior for free. Supports `primary`,
 * `secondary`, and `ghost` visual variants, three sizes, and a `full-width`
 * layout option. Use the `type` prop to make it act as a form submit or
 * reset control when placed inside a `<form>`.
 *
 * @slot - The button content
 *
 * @csspart button - The button element
 */
@customElement('kit-button')
export class KitButton extends KitElement {
	static styles = [baseStyles, buttonStyles];

	/**
	 * The visual style variant of the button
	 */
	@property({ type: String })
	variant: 'primary' | 'secondary' | 'ghost' = 'primary';

	/**
	 * The size of the button
	 */
	@property({ type: String })
	size: 'small' | 'medium' | 'large' = 'medium';

	/**
	 * Whether the button is disabled
	 */
	@property({ type: Boolean })
	disabled = false;

	/**
	 * Whether the button should take full width of its container
	 */
	@property({ type: Boolean, attribute: 'full-width' })
	fullWidth = false;

	/**
	 * The button type attribute
	 */
	@property({ type: String })
	type: 'button' | 'submit' | 'reset' = 'button';

	render() {
		return html`
			<button
				part="button"
				type=${this.type}
				class=${classMap({
					[this.variant]: true,
					[this.size]: true,
					'full-width': this.fullWidth,
				})}
				?disabled=${this.disabled}
			>
				<slot></slot>
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-button': KitButton;
	}
}
