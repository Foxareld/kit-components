import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
// import { action } from '@storybook/addon-actions';

import './kit-button-group';
import '../button';
import '../dropdown';
import '../menu';
import '../menu-item';

const meta: Meta = {
	title: 'Button Group',
	component: 'kit-button-group',
};

export default meta;

type Story = StoryObj;

// const handleMenuClick = (event: Event) => {
// 	const target = event.target as HTMLElement;
// 	action('menu-item-clicked')(target.textContent);
// };

// const handleClick = (event: Event) => {
// 	const target = event.target as HTMLElement;
// 	action('button-clicked')(target.textContent);
// };

export const ButtonGroup: Story = {
	render: () => html`
		<kit-button-group>
			<kit-button>Button 1</kit-button>
			<kit-button>Button 2</kit-button>
			<kit-button>Button 3</kit-button>
		</kit-button-group>
	`,
};

// export const SplitButton: Story = {
// 	render: () => html`
// 		<kit-button-group>
// 			<kit-button @click=${handleClick}>Button 1</kit-button>
// 			<kit-dropdown>
// 				<kit-button slot="trigger" caret></kit-button>
// 				<kit-menu>
// 					<kit-menu-item @click=${handleMenuClick}>Menu Item 1</kit-menu-item>
// 					<kit-menu-item @click=${handleMenuClick}>Menu Item 2</kit-menu-item>
// 					<kit-menu-item @click=${handleMenuClick}>Menu Item 3</kit-menu-item>
// 				</kit-menu>
// 			</kit-dropdown>
// 		</kit-button-group>
// 	`,
// };
