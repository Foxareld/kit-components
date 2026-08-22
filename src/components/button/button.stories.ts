import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './button.component.js';

/**
 * The Button component is a fundamental interactive element for triggering actions.
 * It supports multiple variants, sizes, and states.
 */
const meta: Meta = {
	title: 'Components/Button',
	component: 'kit-button',
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['primary', 'secondary', 'ghost'],
			description: 'The visual style variant of the button',
		},
		size: {
			control: 'select',
			options: ['small', 'medium', 'large'],
			description: 'The size of the button',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the button is disabled',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Whether the button should take full width',
		},
		type: {
			control: 'select',
			options: ['button', 'submit', 'reset'],
			description: 'The button type attribute',
		},
	},
	args: {
		variant: 'primary',
		size: 'medium',
		disabled: false,
		fullWidth: false,
		type: 'button',
	},
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
	render: (args) => html`
		<kit-button
			variant=${args.variant}
			size=${args.size}
			?disabled=${args.disabled}
			?full-width=${args.fullWidth}
			type=${args.type}
		>
			Primary Button
		</kit-button>
	`,
};

export const FullWidth: Story = {
	render: () => html`
		<div style="width: 300px;">
			<kit-button full-width>Full Width Button</kit-button>
		</div>
	`,
};

export const WithClickHandler: Story = {
	render: () => html`
		<kit-button @click=${() => console.log('Button clicked!')}>
			Click Me
		</kit-button>
	`,
};
