import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './tab.component.js';

/**
 * A single tab. Not interactive selection logic on its own — use it inside
 * kit-tab-group, which owns mutual exclusivity, keyboard navigation, and
 * orientation.
 */
const meta: Meta = {
	title: 'Components/Tab',
	component: 'kit-tab',
	tags: ['autodocs'],
	argTypes: {
		selected: {
			control: 'boolean',
			description: 'Whether the tab is selected',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the tab is disabled',
		},
		value: {
			control: 'text',
			description: "Identifier surfaced as the group's value when selected",
		},
	},
	args: {
		selected: false,
		disabled: false,
		value: 'profile',
	},
	decorators: [
		(story) => html`<div role="tablist" aria-label="Demo">${story()}</div>`,
	],
};

export default meta;
type Story = StoryObj;

/**
 * kit-tab rendered on its own. A role="tablist" wrapper is required by ARIA
 * for a standalone role="tab" element — kit-tab-group normally provides
 * this automatically.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-tab
			?selected=${args.selected}
			?disabled=${args.disabled}
			value=${args.value}
		>
			Profile
		</kit-tab>
	`,
};
