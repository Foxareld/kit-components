import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './radio-group.component.js';
import '../radio/radio.component.js';
import '../button/button.component.js';
import type { KitRadioGroup } from './radio-group.component.js';

/**
 * Groups kit-radio children: mutual exclusivity, roving-tabindex keyboard
 * navigation (arrow keys move focus and selection, Space selects), and
 * form participation for the group as a whole.
 */
const meta: Meta = {
	title: 'Components/Radio Group',
	component: 'kit-radio-group',
	tags: ['autodocs'],
	argTypes: {
		label: {
			control: 'text',
			description: "Accessible label shown in the group's legend",
		},
		name: {
			control: 'text',
			description: 'Name attribute for form submission',
		},
		required: {
			control: 'boolean',
			description: 'Whether at least one radio must be checked',
		},
		value: {
			control: 'text',
			description: 'The value of the currently checked radio',
		},
	},
	args: {
		label: 'Favorite color',
		name: 'color',
		required: false,
		value: '',
	},
};

export default meta;
type Story = StoryObj;

/**
 * The default story exposes every kit-radio-group control. Use the
 * controls panel to explore variants (required, an initial value) instead
 * of maintaining a separate story per prop combination.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-radio-group
			label=${args.label}
			name=${args.name}
			?required=${args.required}
			value=${args.value}
		>
			<kit-radio value="red">Red</kit-radio>
			<kit-radio value="green">Green</kit-radio>
			<kit-radio value="blue">Blue</kit-radio>
			<kit-radio value="purple" disabled>Purple (disabled)</kit-radio>
		</kit-radio-group>
	`,
};

/**
 * A form built from kit-radio-group and kit-button. Required validation is
 * entirely native — kit-radio-group reports its own error text once
 * `form.reportValidity()` runs, same as kit-input. The business rule
 * ("red" is the wrong answer) is one call to `setCustomValidity`.
 */
export const InAForm: Story = {
	render: () => {
		const handleSubmit = (event: Event) => {
			const form = (event.currentTarget as HTMLElement).closest('form');
			if (!form) return;

			const colorGroup = form.querySelector<KitRadioGroup>(
				'kit-radio-group[name="favoriteColor"]'
			);
			if (colorGroup) {
				const isRed = colorGroup.value === 'red';
				colorGroup.setCustomValidity(
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
					gap: var(--spacing-lg, 1.5rem);
					max-width: 320px;
				}
				.form-status {
					color: var(--color-success, #24a148);
					font-size: var(--font-size-sm, 0.875rem);
					margin: 0;
				}
			</style>
			<form class="demo-form" @submit=${(e: Event) => e.preventDefault()}>
				<kit-radio-group
					label="What's the best color, red or green?"
					name="favoriteColor"
					required
				>
					<kit-radio value="red">Red</kit-radio>
					<kit-radio value="green">Green</kit-radio>
				</kit-radio-group>
				<kit-button type="submit" @click=${handleSubmit}>Submit</kit-button>
				<p class="form-status" data-form-status></p>
			</form>
		`;
	},
};
