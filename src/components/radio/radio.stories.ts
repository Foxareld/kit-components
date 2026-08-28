import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './radio.component.js';

/**
 * A single radio button. Not form-associated on its own — use it inside
 * kit-radio-group, which owns selection, keyboard navigation, and form
 * participation.
 */
const meta: Meta = {
	title: 'Components/Radio',
	component: 'kit-radio',
	tags: ['autodocs'],
	argTypes: {
		checked: {
			control: 'boolean',
			description: 'Whether the radio is checked',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the radio is disabled',
		},
		value: {
			control: 'text',
			description: 'The value submitted when this radio is checked',
		},
	},
	args: {
		checked: false,
		disabled: false,
		value: 'option-1',
	},
	decorators: [
		(story) => html`<div role="radiogroup" aria-label="Demo">${story()}</div>`,
	],
};

export default meta;
type Story = StoryObj;

/**
 * kit-radio rendered on its own. A role="radiogroup" wrapper is required by
 * ARIA for a standalone role="radio" element — kit-radio-group normally
 * provides this automatically.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-radio
			?checked=${args.checked}
			?disabled=${args.disabled}
			value=${args.value}
		>
			Option
		</kit-radio>
	`,
};
