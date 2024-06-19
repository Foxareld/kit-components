import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import KitInput from './kit-input';
import './kit-input';
import '../button/kit-button';

const meta: Meta = {
	title: 'Input',
	component: 'kit-input',
	args: {
		label: 'Label',
		name: 'my-input',
		type: 'text',
	},
	argTypes: {
		autocomplete: {
			control: 'text',
		},
		disabled: {
			control: 'boolean',
		},
		hideLabel: {
			control: 'boolean',
		},
		hint: {
			control: 'text',
		},
		label: {
			control: 'text',
		},
		max: {
			control: 'number',
		},
		maxlength: {
			control: 'number',
		},
		min: {
			control: 'number',
		},
		minlength: {
			control: 'number',
		},
		name: {
			control: 'text',
		},
		pattern: {
			control: 'text',
		},
		placeholder: {
			control: 'text',
		},
		readonly: {
			control: 'boolean',
		},
		required: {
			control: 'boolean',
		},
		step: {
			control: 'number',
		},
		type: {
			control: { type: 'select' },
			options: [
				'date',
				'email',
				'number',
				'password',
				'search',
				'search',
				'tel',
				'time',
				'text',
				'url',
			],
		},
		setValidity: {
			control: false,
			table: {
				category: 'Methods',
			},
			description: 'Sets a custom validity message for the input',
			defaultValue: { summary: '() => void' },
		},
		value: {
			control: 'text',
		},
		accessor: {
			table: {
				disable: true,
			},
		},
		formAssociated: {
			table: {
				disable: true,
			},
		},
		form: {
			table: {
				disable: true,
			},
		},
		input: {
			table: {
				disable: true,
			},
		},
		internals: {
			table: {
				disable: true,
			},
		},
		_errorMessage: {
			table: {
				disable: true,
			},
		},
		validity: {
			table: {
				disable: true,
			},
		},
		validationMessage: {
			table: {
				disable: true,
			},
		},
	},
	parameters: {
		actions: {
			handles: ['submit #myForm'],
		},
	},
};

export default meta;

type Story = StoryObj;

const handleSubmit = (evt: Event) => {
	evt.preventDefault();

	console.log('SUBMIT');

	const output = document.getElementById('result');

	// Get form data
	const formData = new FormData(evt.target as HTMLFormElement);
	console.log(formData);
	console.log(evt.target);

	// Convert form data to an object
	const formObject: { [key: string]: FormDataEntryValue } = {};

	formData.forEach(function (value, key) {
		formObject[key] = value;
	});

	output!.innerText = JSON.stringify(formObject, null, 2);
};

export const Input: Story = {
	args: {
		placeholder: 'This is placeholder text',
		hint: 'This is hint text',
	},
};

export const InputError: Story = {
	render: () => {
		const customInput = document.getElementById('customInput') as KitInput;
		const dependentInput = document.getElementById(
			'dependentInput',
		) as KitInput;

		customInput.addEventListener('invalid', () => {
			dependentInput.setValidity(
				{ customError: true },
				'Custom input is invalid',
			);
			dependentInput.checkValidity();

			customInput.addEventListener('input', () => {
				if (customInput.value == 'Valid') {
					customInput.setValidity({});
					dependentInput.setValidity({});
				}
			});
		});

		const customValidation = (evt: KeyboardEvent) => {
			const input = evt.target as KitInput;

			if (evt.key === 'Enter') {
				if (input.value != 'Valid') {
					input.setValidity(
						{ customError: true },
						'Value must be "Valid"',
					);
				} else {
					input.setValidity({});
				}
			}
		};

		return html`
			<kit-input
				hint='Press Enter to submit input: This input will be invalid when the value is not "Valid"'
				label="Custom Validation"
				value="Word"
				@keydown=${customValidation}
				id="customInput"
			></kit-input>

			<kit-input
				hint="This input will be invalid if the first input is invalid"
				label="Dependent Validation"
				id="dependentInput"
			></kit-input>
		`;
	},
};

export const InputRequired: Story = {
	args: {
		required: true,
	},
};

export const InputDisabled: Story = {
	args: {
		disabled: true,
		value: 'This is disabled',
	},
};

export const InputReadonly: Story = {
	args: {
		readonly: true,
		value: 'Read Only',
	},
};

export const InputForm: Story = {
	args: {
		label: 'Label',
		hint: 'Enter more than 5 characters',
		minlength: 5,
	},
	render: (args) => {
		return html`
			<form id="myForm" @submit=${handleSubmit}>
				<kit-input
					autocomplete=${ifDefined(args.autocomplete)}
					hint=${ifDefined(args.hint)}
					label=${ifDefined(args.label)}
					max=${ifDefined(args.max)}
					maxlength=${ifDefined(args.maxlength)}
					min=${ifDefined(args.min)}
					minlength=${ifDefined(args.minlength)}
					name=${args.name}
					pattern=${ifDefined(args.pattern)}
					placeholder=${ifDefined(args.placeholder)}
					step=${ifDefined(args.step)}
					type=${ifDefined(args.type)}
					value=${ifDefined(args.value)}
					?disabled=${args.disabled}
					?readonly=${args.readonly}
					?required=${args.required}
				></kit-input>

				<kit-button type="submit">Submit</kit-button>
				<kit-button type="reset">Reset</kit-button>
			</form>

			<div id="result"></div>
		`;
	},
};

export const InputSelection: Story = {
	args: {
		value: 'This is a value',
	},
	render: (args) => {
		return html`
			<kit-input
				autocomplete=${ifDefined(args.autocomplete)}
				hint=${ifDefined(args.hint)}
				label=${ifDefined(args.label)}
				max=${ifDefined(args.max)}
				maxlength=${ifDefined(args.maxlength)}
				min=${ifDefined(args.min)}
				minlength=${ifDefined(args.minlength)}
				name=${args.name}
				pattern=${ifDefined(args.pattern)}
				placeholder=${ifDefined(args.placeholder)}
				step=${ifDefined(args.step)}
				type=${ifDefined(args.type)}
				value=${ifDefined(args.value)}
				?disabled=${args.disabled}
				?readonly=${args.readonly}
				?required=${args.required}
			></kit-input>

			<kit-button
				@click=${() => {
					const input = document.querySelector(
						'fs-input',
					) as KitInput;
					input.setSelectionRange(2, 5);
					input.focus();
				}}
				>setSelectionRange(2, 5)</kit-button
			>
			<kit-button
				@click=${() => {
					const input = document.querySelector(
						'fs-input',
					) as KitInput;
					input.setRangeText('new text', 2, 5);
				}}
				>setRangeText('new text', 2, 5)</kit-button
			>
		`;
	},
};
