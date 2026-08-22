import type { CSSResultGroup } from 'lit';
import { LitElement } from 'lit';
import { boxSizing } from '../styles/utilities.js';

/**
 * Base class for all Kit components
 *
 * Extends LitElement with shared base styles and common functionality.
 * All Kit components should extend this instead of LitElement directly.
 *
 * Base styles are automatically prepended to component styles.
 *
 * @example
 * ```typescript
 * export class KitButton extends KitElement {
 *   static styles = buttonStyles; // baseStyles automatically included!
 * }
 * ```
 */
export class KitElement extends LitElement {
	/**
	 * Base styles applied to all Kit components
	 * These are automatically prepended to component styles
	 */
	static baseStyles: CSSResultGroup = boxSizing;

	/**
	 * Finalize lifecycle hook to automatically merge base styles with component styles
	 */
	protected static finalize() {
		// Check if this class defined its own styles
		if (this.hasOwnProperty('styles')) {
			const componentStyles = this.styles;

			// Ensure baseStyles are prepended (if not already included)
			if (Array.isArray(componentStyles)) {
				// Component provided array of styles
				this.styles = [this.baseStyles, ...componentStyles];
			} else if (componentStyles) {
				// Component provided single style
				this.styles = [this.baseStyles, componentStyles];
			}
		} else {
			// No component styles defined, just use base styles
			this.styles = this.baseStyles;
		}

		super.finalize();
	}
}
