import type { Meta, StoryObj } from '@storybook/web-components';
import { action } from '@storybook/addon-actions';
import { html } from 'lit';

import './kit-menu';
import '../menu-item/kit-menu-item';

const meta: Meta = {
	title: 'Menu',
	component: 'kit-menu',
};

export default meta;

type Story = StoryObj;

const handleClick = (event: Event) => {
	const target = event.target as HTMLElement;
	action('menu-item-clicked')(target.textContent);
};

export const Menu: Story = {
	render: () => html`
		<kit-menu>
			<kit-menu-item @click=${handleClick}>Menu Item 1</kit-menu-item>
			<kit-menu-item @click=${handleClick}>Menu Item 2</kit-menu-item>
			<kit-menu-item @click=${handleClick}>Menu Item 3</kit-menu-item>
		</kit-menu>
	`,
};
