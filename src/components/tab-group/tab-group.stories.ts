import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './tab-group.component.js';
import '../tab/tab.component.js';
import '../tab-panel/tab-panel.component.js';

/**
 * Groups kit-tab children: mutual exclusivity and roving-tabindex keyboard
 * navigation (arrow keys move focus and selection, Home/End jump to the
 * ends, Space/Enter select). Exactly one enabled tab is always selected.
 */
const meta: Meta = {
	title: 'Components/Tab Group',
	component: 'kit-tab-group',
	tags: ['autodocs'],
	argTypes: {
		value: {
			control: 'text',
			description: 'The value of the currently selected tab',
		},
	},
	args: {
		value: '',
	},
};

export default meta;
type Story = StoryObj;

/**
 * The default story exposes every kit-tab-group control. Use the controls
 * panel to explore variants (an initial value) instead of maintaining a
 * separate story per prop combination.
 */
export const Default: Story = {
	render: (args) => html`
		<kit-tab-group value=${args.value}>
			<kit-tab value="profile">Profile</kit-tab>
			<kit-tab value="settings">Settings</kit-tab>
			<kit-tab value="billing">Billing</kit-tab>
			<kit-tab value="archived" disabled>Archived (disabled)</kit-tab>
		</kit-tab-group>
	`,
};

/**
 * kit-tab-group does not manage panel content itself — pair each tab with a
 * kit-tab-panel elsewhere in the page via a shared `tab-group` id. Panel
 * visibility and the aria-controls/aria-labelledby wiring between each tab
 * and its panel are both automatic.
 */
export const WithPanels: Story = {
	render: () => html`
		<div>
			<kit-tab-group id="story-account-tabs">
				<kit-tab value="profile">Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
			<kit-tab-panel value="profile" tab-group="story-account-tabs">
				Profile content.
			</kit-tab-panel>
			<kit-tab-panel value="settings" tab-group="story-account-tabs">
				Settings content.
			</kit-tab-panel>
		</div>
	`,
};
