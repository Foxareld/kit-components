import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './checkbox.component.js';
import '../button/button.component.js';

/**
 * A single checkbox. Form-associated on its own — wraps a native
 * `<input type="checkbox">` internally for keyboard/click/indeterminate
 * behavior and mirrors its validity.
 */
const meta: Meta = {
	title: 'Components/Checkbox',
	component: 'kit-checkbox',
	tags: ['autodocs'],
	argTypes: {
		checked: {
			control: 'boolean',
			description: 'Whether the checkbox is checked',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the checkbox is disabled',
		},
		indeterminate: {
			control: 'boolean',
			description: 'Shows the indeterminate visual state',
		},
		required: {
			control: 'boolean',
			description: 'Whether the checkbox is required',
		},
		value: {
			control: 'text',
			description: 'The value submitted when the checkbox is checked',
		},
	},
	args: {
		checked: false,
		disabled: false,
		indeterminate: false,
		required: false,
		value: 'accepted',
	},
};

export default meta;
type Story = StoryObj;

/**
 * The default story exposes every kit-checkbox control. Use the controls
 * panel to explore variants (checked, indeterminate, required, disabled)
 * instead of maintaining a separate story per prop combination.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-checkbox
			?checked=${args.checked}
			?disabled=${args.disabled}
			?indeterminate=${args.indeterminate}
			?required=${args.required}
			value=${args.value}
		>
			Accept terms and conditions
		</kit-checkbox>
	`,
};

/**
 * A realistic form built from kit-checkbox and kit-button. Required
 * validation is entirely native — kit-checkbox reports its own error text
 * once `form.reportValidity()` runs, same as kit-input and
 * kit-radio-group. The "interests" group shares one `name` across several
 * checkboxes, showing how multiple checked values collect under a single
 * FormData key.
 */
export const InAForm: Story = {
	render: () => {
		const handleSubmit = (event: Event) => {
			const form = (event.currentTarget as HTMLElement).closest('form');
			if (!form) return;

			const isValid = form.reportValidity();

			const status = form.querySelector<HTMLElement>('[data-form-status]');
			const output = form.querySelector<HTMLElement>('[data-form-output]');
			if (!status || !output) return;

			if (!isValid) {
				status.textContent = '';
				output.textContent = '';
				return;
			}

			const formData = new FormData(form);
			const data: Record<string, FormDataEntryValue[]> = {};
			for (const [key, value] of formData.entries()) {
				(data[key] ??= []).push(value);
			}

			status.textContent = 'Form submitted successfully!';
			output.textContent = JSON.stringify(data, null, 2);
		};

		return html`
			<style>
				.demo-form {
					display: flex;
					flex-direction: column;
					gap: var(--spacing-md, 1rem);
					max-width: 320px;
				}
				.demo-fieldset {
					display: flex;
					flex-direction: column;
					gap: var(--spacing-sm, 0.5rem);
					margin: 0;
					padding: 0;
					border: none;
				}
				.demo-legend {
					padding: 0;
					margin: 0 0 var(--spacing-xs, 0.25rem);
					font-size: var(--font-size-base, 1rem);
				}
				.form-status {
					color: var(--color-success, #24a148);
					font-size: var(--font-size-sm, 0.875rem);
					margin: 0;
				}
				.form-output {
					margin: 0;
					padding: var(--spacing-sm, 0.5rem);
					background: color-mix(in srgb, var(--color-border, #a9b3bf) 15%, transparent);
					border-radius: var(--border-radius-sm, 0.25rem);
					font-family: ui-monospace, Menlo, monospace;
					font-size: var(--font-size-sm, 0.875rem);
					white-space: pre-wrap;
				}
			</style>
			<form class="demo-form" @submit=${(e: Event) => e.preventDefault()}>
				<kit-checkbox name="terms" value="accepted" required>
					I agree to the terms and conditions
				</kit-checkbox>
				<kit-checkbox name="newsletter" value="subscribed">
					Subscribe to the newsletter
				</kit-checkbox>
				<fieldset class="demo-fieldset">
					<legend class="demo-legend">What are you interested in?</legend>
					<kit-checkbox name="interests" value="design">Design</kit-checkbox>
					<kit-checkbox name="interests" value="engineering">
						Engineering
					</kit-checkbox>
					<kit-checkbox name="interests" value="product">Product</kit-checkbox>
				</fieldset>
				<kit-button type="submit" @click=${handleSubmit}>Submit</kit-button>
				<p class="form-status" data-form-status></p>
				<pre class="form-output" data-form-output></pre>
			</form>
		`;
	},
};
