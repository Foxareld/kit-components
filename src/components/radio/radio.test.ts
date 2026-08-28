import { expect, fixture, html } from '@open-wc/testing';
import './radio.component.js';
import { KitRadio } from './radio.component.js';

describe('KitRadio', () => {
	it('renders with default properties', async () => {
		const el = await fixture<KitRadio>(html` <kit-radio>Option</kit-radio> `);

		expect(el).to.exist;
		expect(el.checked).to.be.false;
		expect(el.disabled).to.be.false;
		expect(el.value).to.equal('');
	});

	it('renders slotted label content', async () => {
		const el = await fixture<KitRadio>(html`
			<kit-radio>Option 1</kit-radio>
		`);

		expect(el.textContent?.trim()).to.equal('Option 1');
	});

	it('sets ARIA role and checked state', async () => {
		const el = await fixture<KitRadio>(html`
			<kit-radio checked>Option</kit-radio>
		`);

		expect(el.getAttribute('role')).to.equal('radio');
		expect(el.getAttribute('aria-checked')).to.equal('true');
	});

	it('becomes checked on click', async () => {
		const el = await fixture<KitRadio>(html` <kit-radio>Option</kit-radio> `);

		el.click();
		await el.updateComplete;

		expect(el.checked).to.be.true;
		expect(el.getAttribute('aria-checked')).to.equal('true');
	});

	it('becomes checked on Space keydown', async () => {
		const el = await fixture<KitRadio>(html` <kit-radio>Option</kit-radio> `);

		el.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true })
		);
		await el.updateComplete;

		expect(el.checked).to.be.true;
	});

	it('ignores click and keydown when disabled', async () => {
		const el = await fixture<KitRadio>(html`
			<kit-radio disabled>Option</kit-radio>
		`);

		el.click();
		el.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true })
		);
		await el.updateComplete;

		expect(el.checked).to.be.false;
		expect(el.getAttribute('aria-disabled')).to.equal('true');
	});

	it('is accessible', async () => {
		// role="radio" requires a role="radiogroup" ancestor per ARIA, which
		// kit-radio-group normally provides — supply one directly here since
		// this test exercises kit-radio in isolation.
		const container = await fixture<HTMLDivElement>(html`
			<div role="radiogroup" aria-label="Options">
				<kit-radio>Accessible option</kit-radio>
			</div>
		`);

		await expect(container).to.be.accessible();
	});
});
