import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './option.component.js';

/**
 * A single selectable option. Not form-associated on its own — use it
 * inside kit-select, which owns the listbox, selection, and keyboard
 * navigation.
 */
const meta: Meta = {
	title: 'Components/Option',
	component: 'kit-option',
	tags: ['autodocs'],
	argTypes: {
		selected: {
			control: 'boolean',
			description: 'Whether the option is selected',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the option is disabled',
		},
		value: {
			control: 'text',
			description: 'The value submitted when this option is selected',
		},
	},
	args: {
		selected: false,
		disabled: false,
		value: 'eu-west-1',
	},
	decorators: [
		(story) => html`<div role="listbox" aria-label="Demo">${story()}</div>`,
	],
};

export default meta;
type Story = StoryObj;

/**
 * kit-option rendered on its own. A role="listbox" wrapper is required by
 * ARIA for a standalone role="option" element — kit-select normally
 * provides this automatically.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-option
			?selected=${args.selected}
			?disabled=${args.disabled}
			value=${args.value}
		>
			eu-west-1
		</kit-option>
	`,
};
