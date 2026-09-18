import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import './tab-panel.component.js';
import '../tab-group/tab-group.component.js';
import '../tab/tab.component.js';
import { KitTabPanel } from './tab-panel.component.js';
import type { KitTabGroup } from '../tab-group/tab-group.component.js';
import type { KitTab } from '../tab/tab.component.js';

describe('KitTabPanel', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitTabPanel>(html`
			<kit-tab-panel value="profile">Profile content</kit-tab-panel>
		`);

		expect(el).to.exist;
		expect(el.value).to.equal('profile');
		expect(el.tabGroup).to.equal('');
	});

	it('renders slotted content', async () => {
		const el = await fixture<KitTabPanel>(html`
			<kit-tab-panel value="profile">Profile content</kit-tab-panel>
		`);

		expect(el.textContent?.trim()).to.equal('Profile content');
	});

	it('sets role="tabpanel" and a tabindex', async () => {
		const el = await fixture<KitTabPanel>(html`
			<kit-tab-panel value="profile">Profile content</kit-tab-panel>
		`);

		expect(el.getAttribute('role')).to.equal('tabpanel');
		expect(el.tabIndex).to.equal(0);
	});

	it('stays hidden with no matching tab-group id', async () => {
		const el = await fixture<KitTabPanel>(html`
			<kit-tab-panel value="profile" tab-group="does-not-exist"
				>Profile content</kit-tab-panel
			>
		`);
		await aTimeout(0);

		expect(el.hidden).to.be.true;
	});

	it('shows the panel matching the group\'s selected value and hides the rest', async () => {
		const container = await fixture<HTMLDivElement>(html`
			<div>
				<kit-tab-group id="account-tabs">
					<kit-tab value="profile" selected>Profile</kit-tab>
					<kit-tab value="settings">Settings</kit-tab>
				</kit-tab-group>
				<kit-tab-panel value="profile" tab-group="account-tabs"
					>Profile content</kit-tab-panel
				>
				<kit-tab-panel value="settings" tab-group="account-tabs"
					>Settings content</kit-tab-panel
				>
			</div>
		`);
		const [profilePanel, settingsPanel] = [
			...container.querySelectorAll<KitTabPanel>('kit-tab-panel'),
		] as [KitTabPanel, KitTabPanel];
		await profilePanel.updateComplete;
		await settingsPanel.updateComplete;

		expect(profilePanel.hidden).to.be.false;
		expect(settingsPanel.hidden).to.be.true;
	});

	it('switches which panel is visible when the group selection changes', async () => {
		const container = await fixture<HTMLDivElement>(html`
			<div>
				<kit-tab-group id="account-tabs-2">
					<kit-tab value="profile" selected>Profile</kit-tab>
					<kit-tab value="settings">Settings</kit-tab>
				</kit-tab-group>
				<kit-tab-panel value="profile" tab-group="account-tabs-2"
					>Profile content</kit-tab-panel
				>
				<kit-tab-panel value="settings" tab-group="account-tabs-2"
					>Settings content</kit-tab-panel
				>
			</div>
		`);
		const group = container.querySelector<KitTabGroup>('kit-tab-group')!;
		const [profilePanel, settingsPanel] = [
			...container.querySelectorAll<KitTabPanel>('kit-tab-panel'),
		] as [KitTabPanel, KitTabPanel];
		const settingsTab =
			container.querySelectorAll<KitTab>('kit-tab')[1]!;

		settingsTab.click();
		await group.updateComplete;

		expect(profilePanel.hidden).to.be.true;
		expect(settingsPanel.hidden).to.be.false;
	});

	it('switches panels when the group value is set externally (not just interactively)', async () => {
		const container = await fixture<HTMLDivElement>(html`
			<div>
				<kit-tab-group id="account-tabs-3">
					<kit-tab value="profile" selected>Profile</kit-tab>
					<kit-tab value="settings">Settings</kit-tab>
				</kit-tab-group>
				<kit-tab-panel value="profile" tab-group="account-tabs-3"
					>Profile content</kit-tab-panel
				>
				<kit-tab-panel value="settings" tab-group="account-tabs-3"
					>Settings content</kit-tab-panel
				>
			</div>
		`);
		const group = container.querySelector<KitTabGroup>('kit-tab-group')!;
		const [profilePanel, settingsPanel] = [
			...container.querySelectorAll<KitTabPanel>('kit-tab-panel'),
		] as [KitTabPanel, KitTabPanel];

		group.value = 'settings';
		await group.updateComplete;

		expect(profilePanel.hidden).to.be.true;
		expect(settingsPanel.hidden).to.be.false;
	});

	it('wires aria-controls/aria-labelledby to the matching tab without overwriting an existing one', async () => {
		const container = await fixture<HTMLDivElement>(html`
			<div>
				<kit-tab-group id="account-tabs-4">
					<kit-tab value="profile" selected>Profile</kit-tab>
					<kit-tab value="settings" aria-controls="manual-panel"
						>Settings</kit-tab
					>
				</kit-tab-group>
				<kit-tab-panel value="profile" tab-group="account-tabs-4"
					>Profile content</kit-tab-panel
				>
				<kit-tab-panel
					value="settings"
					tab-group="account-tabs-4"
					id="manual-panel"
					>Settings content</kit-tab-panel
				>
			</div>
		`);
		const [profileTab, settingsTab] = [
			...container.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab];
		const [profilePanel] = [
			...container.querySelectorAll<KitTabPanel>('kit-tab-panel'),
		] as [KitTabPanel];
		await profilePanel.updateComplete;

		expect(profileTab.getAttribute('aria-controls')).to.equal(
			profilePanel.id
		);
		expect(profilePanel.getAttribute('aria-labelledby')).to.equal(
			profileTab.id
		);
		// Consumer-supplied aria-controls is left untouched.
		expect(settingsTab.getAttribute('aria-controls')).to.equal(
			'manual-panel'
		);
	});

	it('is accessible', async () => {
		const container = await fixture<HTMLDivElement>(html`
			<div>
				<kit-tab-group id="account-tabs-5">
					<kit-tab value="profile" selected>Profile</kit-tab>
				</kit-tab-group>
				<kit-tab-panel value="profile" tab-group="account-tabs-5"
					>Profile content</kit-tab-panel
				>
			</div>
		`);

		await expect(container).to.be.accessible();
	});
});
