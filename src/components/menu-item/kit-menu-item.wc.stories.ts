import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './kit-menu-item';

const meta: Meta = {
	title: 'Menu Item',
	component: 'kit-menu-item',
};

export default meta;

type Story = StoryObj;

export const ListItem: Story = {
	render: () => html`<kit-menu-item>Menu Item</kit-menu-item>`,
};
