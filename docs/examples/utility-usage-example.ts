// Example of using shared utilities in a component

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { focusStyles, srOnly } from '../../styles/utilities.js';
import { inputStyles } from './input.styles.js';

/**
 * Example component showing utility usage
 */
@customElement('kit-input')
export class KitInput extends LitElement {
	// Base styles (boxSizing) automatically included!
	// You can also add additional shared utilities if needed:
	static styles = [srOnly, focusStyles, inputStyles];

	@property({ type: String })
	label = '';

	@property({ type: Boolean })
	required = false;

	render() {
		return html`
			<label>
				${this.label}
				${this.required
					? html`<span class="sr-only"> (required)</span>`
					: ''}
			</label>
			<input type="text" ?required=${this.required} />
		`;
	}
}
