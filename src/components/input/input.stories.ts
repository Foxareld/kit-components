import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './input.component.js';

/**
 * Input component for text entry and form data collection
 */
const meta: Meta = {
	title: 'Components/Input',
	component: 'kit-input',
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['text', 'password', 'email', 'number'],
			description: 'The input type',
		},
		label: {
			control: 'text',
			description: 'Label for the input',
		},
		name: {
			control: 'text',
			description: 'Name attribute for form submission',
		},
		value: {
			control: 'text',
			description: 'The input value',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text',
		},
		disabled: {
			control: 'boolean',
			description: 'Disabled state',
		},
		required: {
			control: 'boolean',
			description: 'Required state',
		},
		minLength: {
			control: 'number',
			description: 'Minimum length of input value',
		},
		maxLength: {
			control: 'number',
			description: 'Maximum length of input value',
		},
		min: {
			control: 'number',
			description: 'Minimum value (for number type)',
		},
		max: {
			control: 'number',
			description: 'Maximum value (for number type)',
		},
		pattern: {
			control: 'text',
			description: 'Validation pattern (regex)',
		},
	},
	args: {
		type: 'text',
		label: 'Label',
		name: 'input-name',
		value: '',
		placeholder: 'Enter text...',
		disabled: false,
		required: false,
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: (args) => html`
		<kit-input
			type=${args.type}
			label=${args.label}
			name=${args.name}
			value=${args.value}
			placeholder=${args.placeholder}
			?disabled=${args.disabled}
			?required=${args.required}
			.minLength=${args.minLength}
			.maxLength=${args.maxLength}
			.min=${args.min}
			.max=${args.max}
			pattern=${args.pattern}
		></kit-input>
	`,
};

export const WithLabel: Story = {
	args: {
		label: 'Email Address',
		type: 'email',
		placeholder: 'you@example.com',
		required: true,
	},
};

export const Password: Story = {
	args: {
		label: 'Password',
		type: 'password',
		placeholder: 'Enter password',
		minLength: 8,
		required: true,
	},
};

export const Number: Story = {
	args: {
		label: 'Age',
		type: 'number',
		placeholder: 'Enter your age',
		min: 0,
		max: 120,
	},
};

export const Disabled: Story = {
	args: {
		label: 'Disabled Input',
		value: 'Cannot edit this',
		disabled: true,
	},
};
