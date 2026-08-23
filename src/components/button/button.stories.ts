import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, fn } from 'storybook/test';
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
		onClick: fn(),
	},
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
	render: (args) => html`
		<kit-button
			data-testid="kit-button"
			variant=${args.variant}
			size=${args.size}
			?disabled=${args.disabled}
			?full-width=${args.fullWidth}
			type=${args.type}
			@click=${args.onClick}
		>
			Primary Button
		</kit-button>
	`,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByTestId('kit-button'));

		await expect(args.onClick).toHaveBeenCalled();
	},
};
