import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import '../button/kit-button';
import '../radio/kit-radio';
import './kit-radio-group';

const meta: Meta = {
	title: 'Radio Group',
	component: 'kit-radio-group',
	args: {
		hint: 'Hint text',
		label: 'Radio Legend',
		layout: 'horizontal',
		required: false,
		name: 'radioWC',
	},
	argTypes: {
		layout: {
			control: {
				type: 'select',
			},
			options: ['horizontal', 'vertical'],
		},
		checkValidity: {
			description:
				'Return boolean value indicating validity of the element.',
			table: {
				category: 'Methods',
				type: {
					summary: 'boolean',
				},
			},
		},
		reportValidity: {
			description:
				'Check if the element is valid and report the result to the user.',
			table: {
				category: 'Methods',
				type: {
					summary: 'boolean',
				},
			},
		},
		setFormValue: {
			description: 'Set the elements submission value and state.',
			table: {
				category: 'Methods',
				type: {
					summary: 'void',
				},
			},
		},
		setValidity: {
			description: 'Set the elements validity.',
			table: {
				category: 'Methods',
				type: {
					summary: 'void',
				},
			},
		},
	},
};

export default meta;

type Story = StoryObj;

export const RadioGroup: Story = {
	render: (args) => html`
		<kit-radio-group
			label=${args.label}
			layout=${args.layout}
			?required=${args.required}
			name="radio"
		>
			<kit-radio value="radio1">Radio 1</kit-radio>
			<kit-radio value="radio2">Radio 2</kit-radio>
			<kit-radio value="radio3">Radio 3</kit-radio>
		</kit-radio-group>
	`,
};

export const RadioGroupDisabled: Story = {
	render: (args) => html`
		<kit-radio-group
			label=${args.label}
			layout=${args.layout}
			?required=${args.required}
			name="radio"
		>
			<kit-radio value="radio1">Radio 1</kit-radio>
			<kit-radio value="radio2" disabled>Radio 2</kit-radio>
			<kit-radio value="radio3">Radio 3</kit-radio>
		</kit-radio-group>
	`,
};

export const RadioGroupHintText: Story = {
	render: (args) => html`
		<kit-radio-group
			label=${args.label}
			layout=${args.layout}
			?required=${args.required}
			name="radio"
		>
			<kit-radio value="radio1">Radio 1</kit-radio>
			<kit-radio value="radio2">Radio 2</kit-radio>
			<kit-radio value="radio3">Radio 3</kit-radio>
			<slot slot="hint">${args.hint}</slot>
		</kit-radio-group>
		<kit-button
			@click=${() => {
				const radio = document.querySelector(
					'fs-radio[value="radio2"]',
				) as HTMLElement;
				radio.focus();
			}}
		>
			Focus
		</kit-button>
	`,
};

export const RadioInForm: Story = {
	render: () => {
		const handleSubmit = (evt: Event) => {
			evt.preventDefault();

			const output = document.getElementById('result');

			// Get form data
			const formData = new FormData(evt.target as HTMLFormElement);

			// Convert form data to an object
			const formObject: { [key: string]: FormDataEntryValue } = {};

			formData.forEach(function (value, key) {
				formObject[key] = value;
			});

			output!.innerText = JSON.stringify(formObject, null, 2);
		};

		return html`
			<form id="form" @submit=${handleSubmit}>
				<kit-radio-group label="Radio Legend" name="radioWC" required>
					<kit-radio value="radio1">Radio 1</kit-radio>
					<kit-radio value="radio2">Radio 2</kit-radio>
					<kit-radio value="radio3">Radio 3</kit-radio>
				</fs-radio-group>
				<kit-button type="submit">Submit</kit-button>
			</form>
			<div id="result"></div>
		`;
	},
};
