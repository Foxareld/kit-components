import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './select.component.js';
import '../option/option.component.js';
import '../button/button.component.js';
import type { KitSelect } from './select.component.js';

/**
 * A single-choice select built from kit-dropdown (positioning, dismiss,
 * disabled propagation) and slotted kit-option children (the listbox).
 * Full keyboard support: Arrow keys open the listbox and move focus among
 * options, Home/End jump to the first/last, typing jumps to a match,
 * Enter/Space/click select and close, Escape/outside-click close via
 * kit-dropdown's native popover behavior, and Tab closes without
 * selecting.
 */
const meta: Meta = {
	title: 'Components/Select',
	component: 'kit-select',
	tags: ['autodocs'],
	argTypes: {
		label: {
			control: 'text',
			description: 'Accessible label shown above the trigger',
		},
		name: {
			control: 'text',
			description: 'Name attribute for form submission',
		},
		placeholder: {
			control: 'text',
			description: 'Text shown in the trigger when nothing is selected',
		},
		required: {
			control: 'boolean',
			description: 'Whether an option must be selected',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the select is disabled',
		},
	},
	args: {
		label: 'Region',
		name: 'region',
		placeholder: 'Select a region',
		required: false,
		disabled: false,
	},
};

export default meta;
type Story = StoryObj;

/**
 * The default story exposes every kit-select control. Use the controls
 * panel to explore variants instead of maintaining a separate story per
 * prop combination.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-select
			label=${args.label}
			name=${args.name}
			placeholder=${args.placeholder}
			?required=${args.required}
			?disabled=${args.disabled}
		>
			<kit-option value="eu-west-1">EU West (Ireland)</kit-option>
			<kit-option value="eu-central-1">EU Central (Frankfurt)</kit-option>
			<kit-option value="us-east-1">US East (Virginia)</kit-option>
			<kit-option value="ap-south-1" disabled>AP South (Mumbai)</kit-option>
		</kit-select>
	`,
};

/**
 * A form built from kit-select and kit-button. Required validation is
 * entirely native — kit-select reports its own error text once
 * `form.reportValidity()` runs, same as kit-input and kit-radio-group.
 */
export const InAForm: Story = {
	render: () => {
		const handleSubmit = (event: Event) => {
			const form = (event.currentTarget as HTMLElement).closest('form');
			if (!form) return;

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
				<kit-select label="Region" name="region" required>
					<kit-option value="eu-west-1">EU West (Ireland)</kit-option>
					<kit-option value="us-east-1">US East (Virginia)</kit-option>
				</kit-select>
				<kit-button type="submit" @click=${handleSubmit}>Submit</kit-button>
				<p class="form-status" data-form-status></p>
			</form>
		`;
	},
};

/**
 * A pre-selected value, set declaratively on the kit-option itself.
 */
export const WithASelectedValue: Story = {
	render: () => html`
		<kit-select label="Region">
			<kit-option value="eu-west-1">EU West (Ireland)</kit-option>
			<kit-option value="us-east-1" selected>US East (Virginia)</kit-option>
		</kit-select>
	`,
};

/**
 * Programmatic validity via setCustomValidity, mirroring kit-input and
 * kit-radio-group's InAForm business-rule examples.
 */
export const WithACustomValidationRule: Story = {
	render: () => {
		const handleSubmit = (event: Event) => {
			const form = (event.currentTarget as HTMLElement).closest('form');
			if (!form) return;

			const select = form.querySelector<KitSelect>('kit-select[name="region"]');
			if (select) {
				const isUsEast = select.value === 'us-east-1';
				select.setCustomValidity(
					isUsEast ? 'us-east-1 is at capacity — pick another region.' : ''
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
				<kit-select label="Region" name="region" required>
					<kit-option value="eu-west-1">EU West (Ireland)</kit-option>
					<kit-option value="us-east-1">US East (Virginia)</kit-option>
				</kit-select>
				<kit-button type="submit" @click=${handleSubmit}>Submit</kit-button>
				<p class="form-status" data-form-status></p>
			</form>
		`;
	},
};
