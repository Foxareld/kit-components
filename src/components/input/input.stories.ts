import type { Meta, StoryObj } from '@storybook/web-components';
import { html, nothing } from 'lit';
import './input.component.js';
import '../button/button.component.js';
import type { KitInput } from './input.component.js';

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
		icon: {
			control: 'select',
			options: [
				'',
				'arrow-down',
				'arrow-left',
				'arrow-right',
				'arrow-up',
				'emoji',
				'plus',
				'xmark',
			],
			description: 'Optional icon shown inside the input',
		},
		iconColor: {
			control: 'select',
			options: [
				'default',
				'success',
				'warning',
				'danger',
				'info',
				'white',
				'grey',
				'disabled',
			],
			description: 'Color of the icon',
		},
		iconPlacement: {
			control: 'select',
			options: ['left', 'right'],
			description: 'Which side of the input the icon is shown on',
		},
		iconSize: {
			control: 'select',
			options: ['small', 'medium', 'default', 'large', 'xlarge'],
			description: 'Size of the icon',
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
		icon: '',
		iconColor: 'default',
		iconPlacement: 'left',
		iconSize: 'small',
	},
};

export default meta;
type Story = StoryObj;

/**
 * The default story exposes every kit-input control. Use the controls panel
 * to explore variants (password, number, email, disabled, required, etc.)
 * instead of maintaining a separate story per prop combination.
 */
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
			icon=${args.icon || nothing}
			icon-color=${args.iconColor}
			icon-placement=${args.iconPlacement}
			icon-size=${args.iconSize}
		></kit-input>
	`,
};

/**
 * A realistic form built from kit-input and kit-button. Field-level
 * validation is entirely native — required/email are native browser
 * constraints, and kit-input reports its own error text once a check
 * has been attempted. Only the business rule ("red" is the wrong answer)
 * needs a line of custom code, via `setCustomValidity`:
 * - First name: required
 * - Last name: required
 * - Phone number: optional
 * - Email: required, must look like an email address
 * - "Best color": required, and "red" is rejected as the wrong answer
 */
export const InAForm: Story = {
	render: () => {
		const handleSubmit = (event: Event) => {
			const form = (event.currentTarget as HTMLElement).closest('form');
			if (!form) return;

			const colorInput = form.querySelector<KitInput>(
				'kit-input[name="favoriteColor"]'
			);
			if (colorInput) {
				const isRed = colorInput.value.trim().toLowerCase() === 'red';
				colorInput.setCustomValidity(
					isRed ? 'Wrong answer — green is the best color.' : ''
				);
			}

			const isValid = form.reportValidity();

			const status = form.querySelector<HTMLElement>('[data-form-status]');
			if (status) {
				status.textContent = isValid ? 'Form submitted successfully!' : '';
			}
		};

		return html`
			<style>
				.demo-form {
					display: flex;
					flex-direction: column;
					gap: var(--spacing-md, 1rem);
					max-width: 320px;
				}
				.form-status {
					color: var(--color-success, #24a148);
					font-size: var(--font-size-sm, 0.875rem);
					margin: 0;
				}
			</style>
			<form class="demo-form" @submit=${(e: Event) => e.preventDefault()}>
				<kit-input label="First Name" name="firstName" required></kit-input>
				<kit-input label="Last Name" name="lastName" required></kit-input>
				<kit-input label="Phone Number" name="phone" type="text"></kit-input>
				<kit-input label="Email" name="email" type="email" required></kit-input>
				<kit-input
					label="What's the best color, red or green?"
					name="favoriteColor"
					required
				></kit-input>
				<kit-button type="submit" @click=${handleSubmit}>Submit</kit-button>
				<p class="form-status" data-form-status></p>
			</form>
		`;
	},
};
