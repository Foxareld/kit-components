import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import './kit-dropdown';
import '../menu';
import '../menu-item';
import '../button';
// import '../icon-button';

const meta: Meta = {
	title: 'Dropdown',
	component: 'kit-dropdown',
	args: {
		align: 'left',
		position: 'bottom',
	},
	argTypes: {
		align: {
			control: {
				type: 'select',
			},
			options: ['left', 'right', 'center'],
		},
		position: {
			control: {
				type: 'select',
			},
			options: ['top', 'bottom'],
		},
		accessor: {
			table: {
				disable: true,
			},
		},
		isOpen: {
			table: {
				disable: true,
			},
		},
		handleClickOutside: {
			table: {
				disable: true,
			},
		},
	},
	decorators: [
		(story) => html`
			<div
				style="height: 100vh; display: flex; justify-content: center; align-items: center;"
			>
				${story()}
			</div>
		`,
	],
};

export default meta;

type Story = StoryObj;

const handleClick = (event: Event) => {
	const target = event.target as HTMLElement;
	action('menu-item-clicked')(target.textContent);
};

export const DropdownWithButton: Story = {
	render: (args) => html`
		<kit-dropdown position=${args.position} align=${args.align}>
			<kit-button slot="trigger">Toggle Dropdown</kit-button>
			<kit-menu>
				<kit-menu-item @click=${handleClick}>Menu Item 1</kit-menu-item>
				<kit-menu-item @click=${handleClick}>Menu Item 2</kit-menu-item>
				<kit-menu-item @click=${handleClick}>Menu Item 3</kit-menu-item>
			</kit-menu>
		</kit-dropdown>
	`,
};

export const DropdownWithIconButton: Story = {
	render: (args) => html`
		<kit-dropdown position=${args.position} align=${args.align}>
			<kit-icon-button
				icon="more-horizontal"
				slot="trigger"
			></kit-icon-button>
			<kit-menu>
				<kit-menu-item @click=${handleClick}>Menu Item 1</kit-menu-item>
				<kit-menu-item @click=${handleClick}>Menu Item 2</kit-menu-item>
				<kit-menu-item @click=${handleClick}>Menu Item 3</kit-menu-item>
			</kit-menu>
		</kit-dropdown>
	`,
};
