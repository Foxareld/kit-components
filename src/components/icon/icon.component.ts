import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { getIcon, type IconName } from '../../assets/icons/icon-registry.js';
import { KitElement } from '../../base/KitElement.js';
import { iconStyles } from './icon.styles.js';

export type IconColor =
	| 'default'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'white'
	| 'grey'
	| 'disabled'
	| (string & {});

export type IconSize = 'small' | 'medium' | 'default' | 'large' | 'xlarge';

/**
 * Icon component
 *
 * @csspart root - The root SVG element
 */
@customElement('kit-icon')
export class KitIcon extends KitElement {
	static styles = iconStyles;

	/**
	 * Icon name from the icon registry
	 */
	@property({ type: String })
	name: IconName = 'star';

	/**
	 * Icon size
	 */
	@property({ type: String })
	size: IconSize = 'default';

	/**
	 * Icon color
	 */
	@property({ type: String })
	color: IconColor = 'default';

	render() {
		const iconData = getIcon(this.name);
		let boxSize;

		switch (this.size) {
			case 'small':
				boxSize = 16;
				break;
			case 'medium':
				boxSize = 24;
				break;
			case 'default':
				boxSize = 32;
				break;
			case 'large':
				boxSize = 48;
				break;
			case 'xlarge':
				boxSize = 64;
				break;
		}

		if (!iconData) {
			console.warn(`Icon "${this.name}" not found in registry`);
			return html`<svg
				part="root"
				width="${boxSize}"
				height="${boxSize}"
				color="${this.color}"
			></svg>`;
		}

		return html`
			<svg
				part="root"
				color="${this.color}"
				viewBox="${iconData.viewBox}"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				width="${boxSize}"
				height="${boxSize}"
			>
				${unsafeSVG(iconData.content)}
			</svg>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-icon': KitIcon;
	}
}
