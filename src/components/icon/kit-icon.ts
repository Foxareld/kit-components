import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentStyles } from './kit-icon.styles';
import type { CSSResultGroup } from 'lit';
import { findIconDefinition, library } from '@fortawesome/fontawesome-svg-core';
import { icon as getIcon } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import type { IconName } from '@fortawesome/fontawesome-common-types';

library.add(fas);

export type IconColor =
	| 'default'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'white'
	| 'disabled';

export type IconSize = 'small' | 'medium' | 'default' | 'large';

@customElement('kit-icon')
export default class KitIcon extends LitElement {
	static get styles(): CSSResultGroup {
		return componentStyles;
	}

	/**
	 * The name of the icon
	 */
	@property({ type: String, reflect: true })
	icon!: IconName;

	/**
	 * The color of the icon
	 */
	@property({ type: String, reflect: true })
	color: IconColor = 'default';

	/**
	 * The size of the icon
	 */
	@property({ type: String, reflect: true })
	size: IconSize = 'default';

	render() {
		const iconDef = findIconDefinition({
			prefix: 'fas',
			iconName: this.icon,
		});
		const i = getIcon(iconDef);
		const iconSvg = i.node[0];

		if (!i) {
			return null;
		}

		return html`${iconSvg}`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'kit-icon': KitIcon;
	}
}
