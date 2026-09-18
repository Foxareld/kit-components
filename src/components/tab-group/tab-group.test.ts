import { expect, fixture, html } from '@open-wc/testing';
import './tab-group.component.js';
import '../tab/tab.component.js';
import { KitTabGroup } from './tab-group.component.js';
import type { KitTab } from '../tab/tab.component.js';

describe('KitTabGroup', () => {
	it('sets role="tablist" on the host', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile">Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
		`);

		expect(el.getAttribute('role')).to.equal('tablist');
	});

	it('selects the first enabled tab by default when nothing is selected', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile" disabled>Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
		`);
		const [profile, settings] = [
			...el.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab];

		expect(profile.selected).to.be.false;
		expect(settings.selected).to.be.true;
		expect(el.value).to.equal('settings');
	});

	it('picks up an initially selected tab as its value', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile">Profile</kit-tab>
				<kit-tab value="settings" selected>Settings</kit-tab>
			</kit-tab-group>
		`);

		expect(el.value).to.equal('settings');
	});

	it('enforces mutual exclusivity when a tab is clicked and dispatches change', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile" selected>Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
		`);
		const [profile, settings] = [
			...el.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab];

		let detail: string | undefined;
		el.addEventListener('change', (event) => {
			detail = (event as CustomEvent<string>).detail;
		});

		settings.click();
		await el.updateComplete;

		expect(profile.selected).to.be.false;
		expect(settings.selected).to.be.true;
		expect(el.value).to.equal('settings');
		expect(detail).to.equal('settings');
	});

	it('moves focus and selection with arrow keys, wrapping and skipping disabled tabs', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile" selected>Profile</kit-tab>
				<kit-tab value="settings" disabled>Settings</kit-tab>
				<kit-tab value="billing">Billing</kit-tab>
			</kit-tab-group>
		`);
		const [profile, , billing] = [
			...el.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab, KitTab];

		profile.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);
		await el.updateComplete;

		expect(billing.selected).to.be.true;
		expect(el.value).to.equal('billing');
		expect(document.activeElement).to.equal(billing);
	});

	it('moves selection to first/last tab with Home/End', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile">Profile</kit-tab>
				<kit-tab value="settings" selected>Settings</kit-tab>
				<kit-tab value="billing">Billing</kit-tab>
			</kit-tab-group>
		`);
		const [profile, , billing] = [
			...el.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab, KitTab];

		el.querySelector<KitTab>('[selected]')?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'End', bubbles: true })
		);
		await el.updateComplete;
		expect(billing.selected).to.be.true;

		billing.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
		);
		await el.updateComplete;
		expect(profile.selected).to.be.true;
	});

	it('defaults roving tabindex to the selected tab', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile" disabled>Profile</kit-tab>
				<kit-tab value="settings" selected>Settings</kit-tab>
				<kit-tab value="billing">Billing</kit-tab>
			</kit-tab-group>
		`);
		const [profile, settings, billing] = [
			...el.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab, KitTab];

		expect(profile.tabIndex).to.equal(-1);
		expect(settings.tabIndex).to.equal(0);
		expect(billing.tabIndex).to.equal(-1);
	});

	it('selects the matching tab when value is set externally', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile" selected>Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
		`);
		const [profile, settings] = [
			...el.querySelectorAll<KitTab>('kit-tab'),
		] as [KitTab, KitTab];

		el.value = 'settings';
		await el.updateComplete;

		expect(profile.selected).to.be.false;
		expect(settings.selected).to.be.true;
	});

	it('dispatches change when value is set externally, not just interactively', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile" selected>Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
		`);

		let detail: string | undefined;
		el.addEventListener('change', (event) => {
			detail = (event as CustomEvent<string>).detail;
		});

		el.value = 'settings';
		await el.updateComplete;

		expect(detail).to.equal('settings');
	});

	it('is accessible', async () => {
		const el = await fixture<KitTabGroup>(html`
			<kit-tab-group>
				<kit-tab value="profile">Profile</kit-tab>
				<kit-tab value="settings">Settings</kit-tab>
			</kit-tab-group>
		`);

		await expect(el).to.be.accessible();
	});
});
