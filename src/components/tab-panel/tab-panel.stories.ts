import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../tab-group/tab-group.component.js';
import '../tab/tab.component.js';
import './tab-panel.component.js';

/**
 * The content panel associated with a kit-tab. Pairs with a kit-tab-group
 * by id (`tab-group` attribute), not by slotting — so it can live anywhere
 * in the page relative to the tabs that control it. Visibility and
 * `aria-controls`/`aria-labelledby` wiring to the matching tab are both
 * automatic.
 */
const meta: Meta = {
	title: 'Components/Tab Panel',
	component: 'kit-tab-panel',
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * A full kit-tab-group + kit-tab-panel pairing. Switching tabs — by click
 * or keyboard — switches which panel is visible with no wiring beyond the
 * shared `tab-group` id.
 */
export const Default: Story = {
	render: () => html`
		<div>
			<kit-tab-group id="story-account-tabs">
				<kit-tab value="profile">Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
				<kit-tab value="billing">Billing</kit-tab>
			</kit-tab-group>
			<kit-tab-panel value="profile" tab-group="story-account-tabs">
				Profile content.
			</kit-tab-panel>
			<kit-tab-panel value="settings" tab-group="story-account-tabs">
				Settings content.
			</kit-tab-panel>
			<kit-tab-panel value="billing" tab-group="story-account-tabs">
				Billing content.
			</kit-tab-panel>
		</div>
	`,
};
