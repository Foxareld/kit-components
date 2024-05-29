import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './kit-button';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
	title: 'Button',
	component: 'kit-button',
	argTypes: {
		disabled: {
			control: 'boolean',
		},
		size: {
			control: {
				type: 'select',
				options: ['small', 'medium', 'large'],
			},
		},
		variant: {
			control: {
				type: 'select',
				options: ['primary', 'secondary', 'transparent'],
			},
		},
	},
};

export default meta;

type Story = StoryObj;

export const Button: Story = {
	render: () =>
		html`<kit-button @click=${action('clicked')}>Click me</kit-button>`,
};
