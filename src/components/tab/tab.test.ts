import { expect, fixture, html } from '@open-wc/testing';
import './tab.component.js';
import { KitTab } from './tab.component.js';

describe('KitTab', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitTab>(html` <kit-tab>Profile</kit-tab> `);

		expect(el).to.exist;
		expect(el.selected).to.be.false;
		expect(el.disabled).to.be.false;
		expect(el.value).to.equal('');
	});

	it('renders slotted label content', async () => {
		const el = await fixture<KitTab>(html` <kit-tab>Profile</kit-tab> `);

		expect(el.textContent?.trim()).to.equal('Profile');
	});

	it('sets ARIA role and selected state', async () => {
		const el = await fixture<KitTab>(html` <kit-tab selected>Profile</kit-tab> `);

		expect(el.getAttribute('role')).to.equal('tab');
		expect(el.getAttribute('aria-selected')).to.equal('true');
	});

	it('becomes selected on click', async () => {
		const el = await fixture<KitTab>(html` <kit-tab>Profile</kit-tab> `);

		el.click();
		await el.updateComplete;

		expect(el.selected).to.be.true;
		expect(el.getAttribute('aria-selected')).to.equal('true');
	});

	it('becomes selected on Space and Enter keydown', async () => {
		const spaceEl = await fixture<KitTab>(html` <kit-tab>Profile</kit-tab> `);
		spaceEl.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true })
		);
		await spaceEl.updateComplete;
		expect(spaceEl.selected).to.be.true;

		const enterEl = await fixture<KitTab>(html` <kit-tab>Profile</kit-tab> `);
		enterEl.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
		);
		await enterEl.updateComplete;
		expect(enterEl.selected).to.be.true;
	});

	it('ignores click and keydown when disabled', async () => {
		const el = await fixture<KitTab>(html` <kit-tab disabled>Profile</kit-tab> `);

		el.click();
		el.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true })
		);
		await el.updateComplete;

		expect(el.selected).to.be.false;
		expect(el.getAttribute('aria-disabled')).to.equal('true');
	});

	it('is accessible', async () => {
		// role="tab" requires a role="tablist" ancestor per ARIA, which
		// kit-tab-group normally provides — supply one directly here since
		// this test exercises kit-tab in isolation.
		const container = await fixture<HTMLDivElement>(html`
			<div role="tablist" aria-label="Sections">
				<kit-tab selected>Accessible tab</kit-tab>
			</div>
		`);

		await expect(container).to.be.accessible();
	});
});
